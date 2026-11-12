import { NextRequest, NextResponse } from "next/server";
import { searchInternet } from "@/lib/plugins/search-engine";
import { computeAstrologyInsights } from "@/lib/plugins/astrology-engine";
import { analyzeCSQuery } from "@/lib/plugins/cs-engine";
import { DEFAULT_PLUGINS } from "@/lib/plugins/registry";
import { Citation, Message } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { messages, activePlugins = [], model = "qwen-2.5-72b", webSearchEnabled = true } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content || "";

    let citations: Citation[] = [];
    let pluginAdditions = "";
    let activePluginName: string | undefined = undefined;

    // 1. Web Search Grounding
    if (webSearchEnabled || activePlugins.includes("web-search")) {
      const searchRes = await searchInternet(query);
      citations = searchRes.citations;
      pluginAdditions += `\n\n[Live Internet Search Grounding Data]:\n${searchRes.synthesizedContext}\nSources:\n` +
        citations.map(c => `[${c.id}] ${c.title} (${c.url})`).join("\n");
    }

    // 2. Astrology Plugin
    if (activePlugins.includes("astrology")) {
      activePluginName = "Astrology & Celestial Insights";
      const astroInsight = computeAstrologyInsights(query);
      if (astroInsight) {
        pluginAdditions += `\n\n${astroInsight}`;
      }
    }

    // 3. Computer Science Plugin
    if (activePlugins.includes("computer-science")) {
      activePluginName = "Computer Science & Code Sandbox";
      const csInsight = analyzeCSQuery(query);
      if (csInsight) {
        pluginAdditions += `\n\n${csInsight}`;
      }
    }

    // Check for HF_TOKEN
    const hfToken = process.env.HF_TOKEN;

    if (hfToken) {
      try {
        // Hugging Face OpenAI-compatible API
        const hfResponse = await fetch("https://api-inference.huggingface.co/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model.includes("llama") ? "meta-llama/Llama-3.3-70B-Instruct" : "Qwen/Qwen2.5-72B-Instruct",
            messages: [
              {
                role: "system",
                content: "You are MIRA, a world-class AI assistant with access to real-time internet knowledge and specialized plugins. Format all responses with clean markdown, LaTeX math formulas, and syntax-highlighted code." + pluginAdditions,
              },
              ...messages.map((m: Message) => ({ role: m.role, content: m.content })),
            ],
            stream: false,
            max_tokens: 1500,
          }),
        });

        if (hfResponse.ok) {
          const hfData = await hfResponse.json();
          const assistantReply = hfData.choices?.[0]?.message?.content || "";
          return NextResponse.json({
            content: assistantReply,
            citations,
            pluginName: activePluginName,
            model,
          });
        }
      } catch (err) {
        console.warn("Hugging Face API call encountered error, providing fallback response", err);
      }
    }

    // High quality intelligent response generator (fallback & immediate testing without API key block)
    let responseText = "";

    if (pluginAdditions.trim()) {
      responseText = `I processed your request using MIRA's active capabilities:\n\n${pluginAdditions.trim()}\n\n`;
      responseText += `Feel free to ask follow-up questions, run code, or test another query across our plugins!`;
    } else {
      responseText = `I have analyzed your query: **"${query}"**.\n\n` +
        `As MIRA, I am configured to answer across global knowledge domains, live internet data, and modular plugins.\n\n` +
        `### 🚀 Next Steps to Connect Live Hugging Face Inference:\n` +
        `1. Add your Hugging Face User Access Token to \`.env.local\`:\n` +
        `   \`\`\`env\n   HF_TOKEN=hf_your_huggingface_token_here\n   \`\`\`\n` +
        `2. For Google Gemini inference, set:\n` +
        `   \`\`\`env\n   GEMINI_API_KEY=your_gemini_key_here\n   \`\`\`\n` +
        `3. For real-time web crawling, set:\n` +
        `   \`\`\`env\n   TAVILY_API_KEY=your_tavily_key_here\n   \`\`\`\n\n` +
        `Try turning on the **Astrology** or **Computer Science** plugins in the plugin drawer above, or ask me for an algorithm or birth chart calculation!`;
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
