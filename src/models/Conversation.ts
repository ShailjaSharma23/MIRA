import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: number;
  model?: string;
  pluginName?: string;
  citations?: Array<{
    id: number;
    title: string;
    url: string;
    snippet: string;
    sourceName?: string;
  }>;
}

export interface IConversation extends Document {
  id: string;
  userId: string;
  title: string;
  pinned: boolean;
  activePlugins: string[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    id: { type: String, required: true },
    role: { type: String, required: true, enum: ["user", "assistant", "system", "tool"] },
    content: { type: String, required: true },
    createdAt: { type: Number, default: Date.now },
    model: { type: String },
    pluginName: { type: String },
    citations: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, default: "New Conversation" },
    pinned: { type: Boolean, default: false },
    activePlugins: { type: [String], default: [] },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema);
