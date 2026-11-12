"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Globe, Puzzle, Square, Sparkles } from "lucide-react";
import { PluginMeta } from "@/types";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isLoading: boolean;
  activePlugins: PluginMeta[];
  onOpenPluginModal: () => void;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
}

export function ChatInput({
  onSend,
  onStop,
  isLoading,
  activePlugins,
  onOpenPluginModal,
  webSearchEnabled,
  onToggleWebSearch,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const enabledPlugins = activePlugins.filter((p) => p.enabled && p.id !== "web-search");

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Active Plugins Pills */}
      {enabledPlugins.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto py-1 text-xs">
          <span className="text-[11px] text-gray-400">Active tools:</span>
          {enabledPlugins.map((plugin) => (
            <span
              key={plugin.id}
              className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>{plugin.name}</span>
            </span>
          ))}
        </div>
      )}

      {/* Input container */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#1E1F20] border border-[#3C4043] focus-within:border-purple-500/60 rounded-3xl p-3 shadow-lg transition"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask MIRA anything across the internet, code, or astrology..."
          rows={1}
          className="w-full bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none resize-none max-h-48 px-2 py-1 scrollbar-thin"
        />

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2D2F31]/60 px-1">
          {/* Left tools: Search & Plugins */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleWebSearch}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                webSearchEnabled
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                  : "text-gray-400 hover:text-white hover:bg-[#2D2F31]"
              }`}
              title="Toggle Live Web Grounding"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-[11px]">Search</span>
            </button>

            <button
              type="button"
              onClick={onOpenPluginModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-400 hover:text-white hover:bg-[#2D2F31] transition"
              title="Manage Plugins"
            >
              <Puzzle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">Plugins</span>
            </button>
          </div>

          {/* Right: Send or Stop button */}
          <div>
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition shadow"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow ${
                  input.trim()
                    ? "bg-gradient-to-tr from-purple-600 to-blue-500 hover:opacity-90 text-white"
                    : "bg-[#2D2F31] text-gray-500 cursor-not-allowed"
                }`}
                title="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>
      <div className="text-center text-[10px] text-gray-500 mt-2">
        MIRA uses real-time web retrieval and specialized plugins. Verify crucial information.
      </div>
    </div>
  );
}
