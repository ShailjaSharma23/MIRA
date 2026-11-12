import { NextRequest, NextResponse } from "next/server";
import { searchInternet } from "@/lib/plugins/search-engine";
import { computeAstrologyInsights } from "@/lib/plugins/astrology-engine";
import { analyzeCSQuery } from "@/lib/plugins/cs-engine";
import { Citation, Message } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { messages = [], activePlugins = [], model = "qwen-2.5-72b", webSearchEnabled = false } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // Full conversation history up to the current turn
    const currentMessage = messages[messages.length - 1];
    const rawQuery = (currentMessage.content || "").trim();
    const queryLower = rawQuery.toLowerCase();

    let citations: Citation[] = [];
    let activePluginName: string | undefined = undefined;

    // 1. Astrology Plugin Execution
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

    // 2. Computer Science Plugin Execution
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

    // 3. Exact Letter Counting & Logic (strawberry check)
    // Only if it's explicitly asking "how many [letter]s are in [word]"
    const letterCountMatch = queryLower.match(/^how many\s+([a-z])(?:'s|s)?\s+(?:are\s+)?in\s+["']?([a-z]+)["']?\??$/i);
    if (letterCountMatch) {
      const char = letterCountMatch[1].toLowerCase();
      const word = letterCountMatch[2].toLowerCase();
      const count = (word.match(new RegExp(char, "g")) || []).length;
      
      const highlighted = word
        .split("")
        .map((c: string) => (c.toLowerCase() === char ? `**${c}**` : c))
        .join("");

      return NextResponse.json({
        content: `There are **${count}** "${char}"s in the word **"${word}"**!\n\nSpelled out: ${highlighted}`,
        citations: [],
        pluginName: undefined,
        model,
      });
    }

    // 4. Intent-based Web Search Grounding
    const explicitSearchKeywords = [
      "search the web",
      "search internet",
      "latest news",
      "breaking news",
      "current price of",
      "weather in",
      "stock price of",
      "who won today",
    ];
    const needsSearch =
      webSearchEnabled ||
      activePlugins.includes("web-search") ||
      explicitSearchKeywords.some((k) => queryLower.includes(k));

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

    // 5. Friendly Human Persona System Prompt
    const friendSystemPrompt = `You are MIRA, a warm, genuine, thoughtful, and intelligent friend.
- Talk like a normal person and a close, supportive friend — conversational, natural, friendly, and direct.
- You remember everything the user tells you in this conversation and maintain full context across previous messages.
- Never sound like a robotic AI assistant. Never say things like "As an AI" or "I processed your request".
- Keep your answers clean, easy to read, and simple to understand.
- DO NOT add links, URLs, or web citations unless the user specifically asked for sources or website links.
${searchContext ? `Helpful factual web context (synthesize into your own words without dumping links):\n${searchContext}` : ""}`;

    // Clean valid message history (filter out empty messages and limit to last 20 turns for token economy)
    const validHistory: Message[] = messages
      .filter((m: Message) => m.content && m.content.trim().length > 0)
      .slice(-20);

    // 6. Multi-turn AI Engine Providers
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // A. Google Gemini API with Full Multi-Turn Context History
    if (geminiKey) {
      try {
        // Format previous turns for Gemini: alternating user and model
        const geminiContents = validHistory.map((m: Message) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: friendSystemPrompt }],
              },
              contents: geminiContents,
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

    // B. Groq API with Full Multi-Turn Context History
    if (groqKey) {
      try {
        const groqMessages = [
          { role: "system", content: friendSystemPrompt },
          ...validHistory.map((m: Message) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        ];

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
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

    // C. Free Conversational Multi-Turn Endpoint (Pollinations AI)
    try {
      const fullPromptMessages = [
        { role: "system", content: friendSystemPrompt },
        ...validHistory.map((m: Message) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ];

      const freeRes = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: fullPromptMessages,
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

    // D. Context-Aware Fallback
    let fallbackText = "";
    if (queryLower === "hi" || queryLower === "hello" || queryLower === "hey") {
      fallbackText = "Hey! How are you doing today? What's on your mind?";
    } else if (validHistory.length > 2) {
      // Reference previous conversation
      const previousUserMsg = validHistory[validHistory.length - 3]?.content || "";
      fallbackText = `Got it! Following up on what you mentioned earlier about "${previousUserMsg.slice(0, 30)}...", here's what I think: ${rawQuery} makes a lot of sense. Tell me more so we can keep going!`;
    } else {
      fallbackText = `I hear you! Regarding "${rawQuery}", let me know what direction you'd like to take and I'm right here with you.`;
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
