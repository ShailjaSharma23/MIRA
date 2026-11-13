import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { createSessionToken } from "@/lib/auth-session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = process.env.NEXTAUTH_URL || `${protocol}://${host}`;
    const redirectUri = `${origin}/api/auth/callback/google`;

    if (error || !code) {
      console.warn("Google OAuth callback error:", error);
      return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error || "No code provided")}`);
    }

    const clientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${origin}/?auth_error=OAuth_Credentials_Missing`);
    }

    // 1. Exchange code for Google Access Token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Token exchange failed:", errText);
      return NextResponse.redirect(`${origin}/?auth_error=Token_Exchange_Failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(`${origin}/?auth_error=Failed_To_Fetch_Profile`);
    }

    const profile = await profileRes.json();
    const { sub: googleId, email, name, picture } = profile;

    // 3. Connect to MongoDB and Upsert User
    await connectToDatabase();

    const dbUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        image: picture,
        googleId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const userId = dbUser._id.toString();

    // 4. Create Signed Session Token
    const sessionToken = createSessionToken({
      userId,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.image,
    });

    // 5. Set HttpOnly Cookie and Redirect to Home
    const response = NextResponse.redirect(`${origin}/`);
    response.cookies.set("mira_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || !origin.includes("localhost"),
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err) {
    console.error("Google Auth Callback Exception:", err);
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = process.env.NEXTAUTH_URL || `${protocol}://${host}`;
    return NextResponse.redirect(`${origin}/?auth_error=Server_Exception`);
  }
}
