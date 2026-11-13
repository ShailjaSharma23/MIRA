import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth-session";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("mira_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const sessionData = verifySessionToken(sessionCookie);
    if (!sessionData) {
      return NextResponse.json({ user: null });
    }

    // Verify user exists in MongoDB
    await connectToDatabase();
    const dbUser = await User.findById(sessionData.userId).lean();

    if (!dbUser) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        avatar: dbUser.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dbUser.name)}`,
        isLoggedIn: true,
      },
    });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ user: null });
  }
}
