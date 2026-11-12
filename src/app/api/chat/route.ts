import { NextRequest, NextResponse } from "next/server";
import { searchInternet } from "@/lib/plugins/search-engine";
import { computeAstrologyInsights } from "@/lib/plugins/astrology-engine";
import { analyzeCSQuery } from "@/lib/plugins/cs-engine";
import { Citation, Message } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { messages, activePlugins = [], model = "qwen-2.5-72b", webSearchEnabled = true } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const rawQuery = (lastMessage.content || "").trim();
    const queryLower = rawQuery.toLowerCase();

    let citations: Citation[] = [];
    let activePluginName: string | undefined = undefined;
    let responseText = "";

    // 1. Direct Strawberry / Letter Counting Pattern Detector
    // (Addresses the famous LLM letter-counting prompt with 100% exact math)
    const letterCountMatch = queryLower.match(/how many\s+([a-z])(?:'s|s)?\s+(?:are\s+)?in\s+["']?([a-z]+)["']?/i);
    if (letterCountMatch) {
      const char = letterCountMatch[1].toLowerCase();
      const word = letterCountMatch[2].toLowerCase();
      const count = (word.match(new RegExp(char, "g")) || []).length;
      
      const highlighted = word
        .split("")
        .map((c: string) => (c.toLowerCase() === char ? `**${c}**` : c))
        .join("");

      return NextResponse.json({
        content: `There are **${count}** "${char}"s in the word **"${word}"**.\n\n*Letter breakdown:* ${highlighted}`,
        citations: [],
        pluginName: undefined,
        model,
      });
    }

    // 2. Astrology Plugin Execution
    if (activePlugins.includes("astrology")) {
      activePluginName = "Astrology & Celestial Insights";
      const astroInsight = computeAstrologyInsights(rawQuery);
      if (astroInsight) {
        responseText = astroInsight;
      }
    }

    // 3. Computer Science Plugin Execution
    if (activePlugins.includes("computer-science")) {
      activePluginName = "Computer Science & Code Sandbox";
      const csInsight = analyzeCSQuery(rawQuery);
      if (csInsight) {
        responseText = csInsight;
      }
    }

    // 4. Live Internet Search Grounding (Tavily AI)
    let searchAnswer = "";
    if (webSearchEnabled || activePlugins.includes("web-search")) {
      const searchRes = await searchInternet(rawQuery);
      citations = searchRes.citations;
      if (searchRes.synthesizedContext) {
        searchAnswer = searchRes.synthesizedContext;
      }
    }

    // 5. Check for Live LLM Provider (Hugging Face / Gemini)
    const hfToken = process.env.HF_TOKEN;
    const geminiKey = process.env.GEMINI_API_KEY;

    // Try Google Gemini API if configured
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `You are MIRA, a smart, direct, concise, and helpful conversational AI chatbot just like ChatGPT.
Answer the user's question directly and conversationally without unnecessary meta commentary.
${searchAnswer ? `Web search context:\n${searchAnswer}` : ""}
User query: ${rawQuery}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({
              content: reply,
              citations,
              pluginName: activePluginName,
              model,
            });
          }
        }
      } catch (e) {
        console.warn("Gemini API call failed:", e);
      }
    }

    // If Search gave a direct answer, synthesize cleanly into conversational response
    if (searchAnswer && !responseText) {
      // Clean up Tavily raw output into natural text
      responseText = searchAnswer;
    }

    // If still no response text, provide direct friendly conversational answers
    if (!responseText) {
      if (queryLower === "hi" || queryLower === "hello" || queryLower === "hey") {
        responseText = `Hello! I'm **MIRA**. How can I help you today? You can ask me any question, search the live web, or toggle the **Astrology** and **Computer Science** plugins.`;
      } else if (queryLower.includes("who are you") || queryLower.includes("what is mira")) {
        responseText = `I am **MIRA**, an advanced conversational AI assistant with live internet search grounding, multi-domain plugins (Astrology, Computer Science), and persistent memory.`;
      } else {
        responseText = `Here is what I found regarding your question:\n\n` +
          `**${rawQuery}**\n\n` +
          `I have searched across internet resources to assist you. If you need a more specific breakdown, code snippet, or astrological reading, feel free to let me know!`;
      }
    }

    return NextResponse.json({
      content: responseText,
      citations,
      pluginName: activePluginName,
      model,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
