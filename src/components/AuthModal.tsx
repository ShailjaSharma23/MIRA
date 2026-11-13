"use client";

import React, { useState } from "react";
import { X, LogOut, ShieldCheck, Check, AlertCircle } from "lucide-react";
import { UserProfile } from "@/types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export function AuthModal({ isOpen, onClose, user, onLogout }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRealGoogleLogin = () => {
    setLoading(true);
    setErrorMsg(null);
    // Redirect to legitimate Google OAuth 2.0 flow
    window.location.href = "/api/auth/google";
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onLogout();
      onClose();
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#1E1F20] border border-[#3C4043] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2D2F31] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {user ? "Google Account" : "Sign in to MIRA"}
              </h2>
              <p className="text-xs text-gray-400">
                {user ? "Your chats are synced to MongoDB" : "Sign in to save your chat history permanently"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#2D2F31] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {user && user.isLoggedIn ? (
            <div className="flex flex-col items-center text-center space-y-3">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-16 h-16 rounded-full border-2 border-purple-500 shadow-lg object-cover"
              />
              <div>
                <h3 className="text-base font-semibold text-white">{user.name}</h3>
                <p className="text-xs text-gray-400">{user.email}</p>
                <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[11px] font-medium border border-green-500/30">
                  <Check className="w-3 h-3" />
                  <span>Google Account Linked</span>
                </div>
              </div>

              <div className="w-full pt-4">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{loading ? "Signing out..." : "Sign Out"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                Without logging in, your chats are <strong>temporary</strong>. Sign in with Google to save your conversations to MongoDB and access them across all your devices.
              </p>

              {/* Real Google Sign In Button */}
              <button
                onClick={handleRealGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 text-sm font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {/* Google "G" SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? "Redirecting to Google..." : "Sign in with Google"}</span>
              </button>

              <div className="pt-2 border-t border-[#2D2F31]/80">
                <div className="p-2.5 rounded-lg bg-[#18191A] text-[11px] text-gray-400 font-mono space-y-1">
                  <div className="text-gray-300 font-sans font-medium">Authentication Requirements:</div>
                  <div>• AUTH_GOOGLE_ID</div>
                  <div>• AUTH_GOOGLE_SECRET</div>
                  <div className="text-[10px] text-gray-500 font-sans mt-1">
                    Redirect URI: /api/auth/callback/google
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
