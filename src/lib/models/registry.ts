import { AIModel } from "@/types";

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "qwen-2.5-72b",
    name: "Qwen 2.5 72B Instruct",
    provider: "Hugging Face",
    description: "Flagship open-weights model with cutting-edge reasoning and tool-calling.",
    contextWindow: "128k",
    badge: "Recommended",
    hfModelId: "Qwen/Qwen2.5-72B-Instruct",
  },
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B Instruct",
    provider: "Hugging Face",
    description: "Meta's most capable open-weights conversational intelligence.",
    contextWindow: "128k",
    badge: "Meta",
    hfModelId: "meta-llama/Llama-3.3-70B-Instruct",
  },
  {
    id: "qwen-2.5-coder-32b",
    name: "Qwen 2.5 Coder 32B",
    provider: "Hugging Face",
    description: "Specialized model for code generation, CS plugins, and algorithmic debugging.",
    contextWindow: "128k",
    badge: "Coding",
    hfModelId: "Qwen/Qwen2.5-Coder-32B-Instruct",
  },
  {
    id: "mistral-small-24b",
    name: "Mistral Small 24B",
    provider: "Hugging Face",
    description: "High-speed, low-latency reasoning powerhouse from Mistral AI.",
    contextWindow: "32k",
    badge: "Fast",
    hfModelId: "mistralai/Mistral-Small-24B-Instruct-2501",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    description: "Google's next-generation multimodal model with real-time speed.",
    contextWindow: "1M",
    badge: "Ultra-Fast",
  },
];
