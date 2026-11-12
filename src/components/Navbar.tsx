"use client";

import React, { useState } from "react";
import { Menu, ChevronDown, Sparkles, Puzzle, Globe, LogIn } from "lucide-react";
import { AIModel, PluginMeta, UserProfile } from "@/types";
import { AVAILABLE_MODELS } from "@/lib/models/registry";

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  selectedModel: AIModel;
  onSelectModel: (model: AIModel) => void;
  activePlugins: PluginMeta[];
  onOpenPluginModal: () => void;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  user: UserProfile;
  onOpenAuth: () => void;
}

export function Navbar({
  onToggleSidebar,
  isSidebarOpen,
  selectedModel,
  onSelectModel,
  activePlugins,
  onOpenPluginModal,
  webSearchEnabled,
  onToggleWebSearch,
  user,
  onOpenAuth,
}: NavbarProps) {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const activeCount = activePlugins.filter((p) => p.enabled).length;

  return (
    <header className="h-14 border-b border-[#2D2F31] bg-[#1E1F20]/90 backdrop-blur px-4 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-gray-300 hover:text-white rounded-md hover:bg-[#2D2F31] transition"
            title="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#28292A] hover:bg-[#323335] text-white text-xs font-medium border border-[#3C4043] transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{selectedModel.name}</span>
            {selectedModel.badge && (
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                {selectedModel.badge}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-[#252628] border border-[#3C4043] rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-[#333538]">
                Select AI Model (Hugging Face / Gemini)
              </div>
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model);
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-[#303134] transition ${
                    selectedModel.id === model.id ? "bg-purple-900/20 border-l-2 border-purple-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between text-white font-medium">
                    <span>{model.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{model.provider}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 line-clamp-1">{model.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right controls: Web Search, Plugins, Profile */}
      <div className="flex items-center gap-2">
        {/* Web Search toggle */}
        <button
          onClick={onToggleWebSearch}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition border ${
            webSearchEnabled
              ? "bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-500/10"
              : "bg-[#28292A] text-gray-400 border-[#3C4043] hover:text-white"
          }`}
          title={webSearchEnabled ? "Live Web Search Grounding Active" : "Enable Web Search Grounding"}
        >
          <Globe className={`w-3.5 h-3.5 ${webSearchEnabled ? "text-blue-400" : ""}`} />
          <span className="hidden sm:inline">Web Grounding</span>
        </button>

        {/* Plugin Manager trigger */}
        <button
          onClick={onOpenPluginModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#28292A] hover:bg-[#323335] text-white text-xs font-medium border border-[#3C4043] transition"
        >
          <Puzzle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Plugins</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
            {activeCount}
          </span>
        </button>

        {/* User Profile / Auth */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-[#28292A] hover:bg-[#323335] text-xs font-medium border border-[#3C4043] transition"
        >
          {user.isLoggedIn ? (
            <>
              <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" />
              <span className="text-white hidden md:inline truncate max-w-[100px]">{user.name.split(" ")[0]}</span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-400">Login</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
