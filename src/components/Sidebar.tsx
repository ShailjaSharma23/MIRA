"use client";

import React from "react";
import { Plus, MessageSquare, Trash2, ChevronLeft, LogIn, LogOut, Sparkles, Cloud, Lock } from "lucide-react";
import { Conversation, UserProfile } from "@/types";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  isOpen,
  onToggle,
  user,
  onOpenAuth,
}: SidebarProps) {
  const isLoggedIn = Boolean(user && user.isLoggedIn);

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-[#1E1F20] border-r border-[#2D2F31] transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-0 -translate-x-full md:w-0 md:translate-x-0"
      } overflow-hidden`}
    >
      <div className="p-3 flex items-center justify-between border-b border-[#2D2F31]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            MIRA
          </span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-[#2D2F31] transition cursor-pointer"
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#2A2B2D] hover:bg-[#333538] text-white text-sm font-medium transition border border-[#3C4043] shadow-sm hover:shadow cursor-pointer"
        >
          <Plus className="w-4 h-4 text-purple-400" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Guest Mode Callout */}
      {!isLoggedIn && (
        <div className="mx-3 mb-2 p-2.5 rounded-xl bg-purple-900/20 border border-purple-500/30 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-purple-300">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Temporary Mode</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-snug">
            Chats are temporary. Sign in with Google to save your history permanently.
          </p>
          <button
            onClick={onOpenAuth}
            className="mt-1 w-full py-1 px-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition text-center"
          >
            Sign in to Save
          </button>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-700">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
          <span>{isLoggedIn ? "MongoDB Cloud Chats" : "Recent Chats (Temporary)"}</span>
          {isLoggedIn && (
            <span title="Connected to MongoDB">
              <Cloud className="w-3.5 h-3.5 text-green-400" />
            </span>
          )}
        </div>
        {conversations.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-gray-500">
            {isLoggedIn ? "No saved chats in MongoDB yet." : "No active chats."}
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                  isActive
                    ? "bg-[#28292A] text-white font-medium"
                    : "text-gray-300 hover:bg-[#252628] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-purple-400" : "text-gray-400"}`} />
                  <span className="truncate">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition rounded"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* User Auth Section */}
      <div className="p-3 border-t border-[#2D2F31] bg-[#1A1A1C]">
        {isLoggedIn && user ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#252628]">
            <div className="flex items-center gap-2.5 truncate min-w-0">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-purple-500/40 object-cover"
              />
              <div className="truncate">
                <div className="text-xs font-medium text-white truncate">{user.name}</div>
                <div className="text-[10px] text-gray-400 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-[#2D2F31] transition"
              title="Logout / Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-medium transition shadow cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>
        )}
      </div>
    </aside>
  );
}
