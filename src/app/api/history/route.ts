import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { verifySessionToken } from "@/lib/auth-session";

function getAuthenticatedUserId(req: NextRequest): string | null {
  const sessionCookie = req.cookies.get("mira_session")?.value;
  if (!sessionCookie) return null;
  const session = verifySessionToken(sessionCookie);
  return session ? session.userId : null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const sessionUserId = getAuthenticatedUserId(req);

    const userId = queryUserId || sessionUserId;

    if (!userId) {
      return NextResponse.json({ error: "Authentication or userId required" }, { status: 401 });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ conversations: [], offline: true });
    }

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ conversations, offline: false });
  } catch (error) {
    console.error("GET /api/history error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, messages, activePlugins = [], pinned = false } = body;
    const sessionUserId = getAuthenticatedUserId(req);
    const userId = body.userId || sessionUserId;

    if (!id || !userId) {
      return NextResponse.json({ error: "id and userId are required" }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: true, offline: true });
    }

    // Auto-generate title from first user message if title is default
    let chatTitle = title;
    if ((!chatTitle || chatTitle === "New Conversation") && Array.isArray(messages) && messages.length > 0) {
      const firstUserMsg = messages.find((m: { role: string; content: string }) => m.role === "user");
      if (firstUserMsg && firstUserMsg.content) {
        chatTitle = firstUserMsg.content.slice(0, 32);
      }
    }

    const updated = await Conversation.findOneAndUpdate(
      { id, userId },
      {
        id,
        userId,
        title: chatTitle || "New Conversation",
        messages: messages || [],
        activePlugins,
        pinned,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, conversation: updated, offline: false });
  } catch (error) {
    console.error("POST /api/history error:", error);
    return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const sessionUserId = getAuthenticatedUserId(req);
    const userId = searchParams.get("userId") || sessionUserId;

    if (!id || !userId) {
      return NextResponse.json({ error: "id and userId are required" }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: true, offline: true });
    }

    await Conversation.deleteOne({ id, userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/history error:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
