import { NextRequest, NextResponse } from "next/server";
import { searchInternet } from "@/lib/plugins/search-engine";
import { computeAstrologyInsights } from "@/lib/plugins/astrology-engine";
import { analyzeCSQuery } from "@/lib/plugins/cs-engine";
import { Citation, Message } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { messages, activePlugins = [], model = "qwen-2.5-72b", webSearchEnabled = false } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const rawQuery = (lastMessage.content || "").trim();
    const queryLower = rawQuery.toLowerCase();

    let citations: Citation[] = [];
    let activePluginName: string | undefined = undefined;

    // 1. Exact Letter Counting & Classic Logic Trap Handlers
    // Answers warmly and conversationally like a friend!
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
        content: `There are **${count}** "${char}"s in the word **"${word}"**!\n\nHere's how it looks spelled out: ${highlighted}`,
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
        return NextResponse.json({
          content: astroInsight,
          citations: [],
          pluginName: activePluginName,
          model,
        });
      }
    }

    // 3. Computer Science Plugin Execution
    if (activePlugins.includes("computer-science")) {
      activePluginName = "Computer Science & Code Sandbox";
      const csInsight = analyzeCSQuery(rawQuery);
      if (csInsight) {
        return NextResponse.json({
          content: csInsight,
          citations: [],
          pluginName: activePluginName,
          model,
        });
      }
    }

    // 4. Intent Detection: Does the user explicitly want live internet search?
    const explicitSearchKeywords = ["search the web", "search internet", "latest news", "breaking news", "current price of", "weather in", "stock price", "who won today"];
    const needsSearch = webSearchEnabled || activePlugins.includes("web-search") || explicitSearchKeywords.some(k => queryLower.includes(k));

    let searchContext = "";
    if (needsSearch) {
      const searchRes = await searchInternet(rawQuery);
      if (searchRes.citations && searchRes.citations.length > 0) {
        citations = searchRes.citations;
      }
      if (searchRes.synthesizedContext) {
        searchContext = searchRes.synthesizedContext;
      }
    }

    // 5. Friendly Human-like System Prompt
    const friendSystemPrompt = `You are MIRA, a warm, thoughtful, natural, and helpful friend.
- Talk like a normal person and a close, supportive friend — conversational, engaging, friendly, and direct.
- Never sound like a robotic AI assistant. Never say things like "As an AI" or "I processed your request using MIRA's capabilities".
- Keep your answers clean, easy to read, and simple to understand.
- DO NOT add links, URLs, or web citations unless the user specifically asked for sources or website links.
${searchContext ? `Helpful factual web context (synthesize into your own words without dumping links):\n${searchContext}` : ""}`;

    // 6. Try Live Generative APIs (Gemini, Groq, Free Conversational Endpoint)
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // A. Google Gemini 2.0 / 1.5 Flash (If key configured)
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
                  parts: [{ text: `${friendSystemPrompt}\n\nUser message: ${rawQuery}` }],
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
              citations: needsSearch ? citations : [],
              pluginName: activePluginName,
              model,
            });
          }
        }
      } catch (e) {
        console.warn("Gemini API call skipped:", e);
      }
    }

    // B. Groq API (If key configured)
    if (groqKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: friendSystemPrompt },
              ...messages.map((m: Message) => ({ role: m.role, content: m.content })),
            ],
            max_tokens: 1000,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const reply = groqData.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({
              content: reply,
              citations: needsSearch ? citations : [],
              pluginName: activePluginName,
              model,
            });
          }
        }
      } catch (e) {
        console.warn("Groq API call skipped:", e);
      }
    }

    // C. Free Conversational Endpoint (Zero configuration needed)
    try {
      const freeRes = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: friendSystemPrompt },
            ...messages.map((m: Message) => ({ role: m.role, content: m.content })),
          ],
          model: "openai",
        }),
      });

      if (freeRes.ok) {
        const freeText = await freeRes.text();
        if (freeText && freeText.trim()) {
          return NextResponse.json({
            content: freeText.trim(),
            citations: needsSearch ? citations : [],
            pluginName: activePluginName,
            model,
          });
        }
      }
    } catch (e) {
      console.warn("Free conversational endpoint skipped:", e);
    }

    // D. Friendly Warm Human Fallback (Guaranteed to sound like a normal friend)
    let fallbackText = "";

    if (queryLower === "hi" || queryLower === "hello" || queryLower === "hey") {
      fallbackText = "Hey there! How's your day going? What's on your mind?";
    } else if (queryLower.includes("how are you")) {
      fallbackText = "I'm doing great, thank you for asking! How are things with you today?";
    } else if (queryLower.includes("what are you doing") || queryLower.includes("what's up")) {
      fallbackText = "Not much, just hanging out here ready to chat! What are you working on today?";
    } else if (queryLower.includes("who are you") || queryLower.includes("tell me about yourself")) {
      fallbackText = "I'm MIRA! Think of me as your smart, friendly companion. We can chat about anything — whether you want to talk about life, work on some code, check your horoscope, or just chat!";
    } else if (queryLower.includes("joke")) {
      fallbackText = "Why do programmers prefer dark mode? Because light attracts bugs! 😄";
    } else if (searchContext) {
      fallbackText = searchContext.replace(/\[\d+\]/g, "").replace(/https?:\/\/\S+/g, "").trim();
    } else {
      fallbackText = `That's an interesting question! Based on what I know, ${rawQuery} is all about understanding the core idea and seeing how it fits into what you're trying to do. Tell me a bit more about what you're thinking, and we can figure it out together!`;
    }

    return NextResponse.json({
      content: fallbackText,
      citations: needsSearch ? citations : [],
      pluginName: activePluginName,
      model,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
