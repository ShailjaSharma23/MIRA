import { PluginMeta } from "@/types";

export const DEFAULT_PLUGINS: PluginMeta[] = [
  {
    id: "web-search",
    name: "Live Web Search & Grounding",
    description: "Connects MIRA to the live internet to retrieve up-to-the-minute data, news, prices, and facts with clickable citations.",
    icon: "Globe",
    category: "Research",
    enabled: false,
    systemPrompt: `You are equipped with the Live Web Search & Grounding tool. When the user asks about real-time, recent events, market prices, or current internet knowledge, reference the latest retrieved web facts and supply structured markdown citations.`,
    samplePrompts: [
      "What are the latest AI breakthroughs this week?",
      "Search the web for Next.js 16 updates and features.",
      "What is the current status of space exploration missions in 2026?",
    ],
  },
  {
    id: "astrology",
    name: "Astrology & Celestial Insights",
    description: "Calculates natal birth charts, Sun/Moon/Rising signs, planetary transits, ephemeris data, and Vedic & Western astrological readings.",
    icon: "Sparkles",
    category: "Esoteric",
    enabled: false,
    systemPrompt: `You are an expert Astrologer trained in both Western Tropical and Vedic (Sidereal) astrology.
When this plugin is active:
1. Calculate and interpret birth charts based on date, time, and birthplace (Sun, Moon, Ascendant, and House placements).
2. Detail current planetary transits (e.g. Saturn returns, Mercury retrograde, Jupiter expansions) with dates and impacts.
3. Provide insightful, grounded horoscope synthesis, planetary ruler analyses, and zodiac compatibility assessments.`,
    samplePrompts: [
      "Calculate my Sun, Moon, and Rising sign for July 23, 1998, 4:15 PM in New Delhi.",
      "What are the major planetary transits happening this month and their significance?",
      "Analyze the astrological compatibility between Aries and Scorpio.",
    ],
  },
  {
    id: "computer-science",
    name: "Computer Science & Code Sandbox",
    description: "Deep technical analysis, Big-O algorithm evaluation, sandbox code execution simulation, design patterns, and debugging.",
    icon: "Terminal",
    category: "Engineering",
    enabled: false,
    systemPrompt: `You are a Principal Computer Scientist and Systems Architect.
When this plugin is active:
1. Write clean, idiomatic, production-ready code with complete type safety.
2. Provide precise Time and Space Complexity (Big-O notation) analysis with mathematical justifications.
3. Run step-by-step code simulations, memory layout breakdowns, and algorithmic traces.
4. Suggest architectural design patterns and best software engineering practices.`,
    samplePrompts: [
      "Write a Trie data structure in TypeScript with prefix search and analyze its Big-O complexity.",
      "How does PostgreSQL MVCC (Multi-Version Concurrency Control) work internally?",
      "Debug this recursive backtracking algorithm and optimize it with memoization.",
    ],
  },
];
