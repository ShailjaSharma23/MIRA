export type Role = "user" | "assistant" | "system" | "tool";

export interface Citation {
  id: number;
  title: string;
  url: string;
  snippet: string;
  sourceName?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  model?: string;
  pluginName?: string;
  citations?: Citation[];
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  pinned?: boolean;
  activePlugins?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PluginMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "General" | "Esoteric" | "Engineering" | "Research";
  enabled: boolean;
  systemPrompt: string;
  samplePrompts: string[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: "Hugging Face" | "Google" | "OpenAI";
  description: string;
  contextWindow: string;
  badge?: string;
  hfModelId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
}
