"use client";

import React, { useState } from "react";
import { X, Puzzle, Sparkles, Terminal, Globe, Plus, Check } from "lucide-react";
import { PluginMeta } from "@/types";

interface PluginModalProps {
  isOpen: boolean;
  onClose: () => void;
  plugins: PluginMeta[];
  onTogglePlugin: (id: string) => void;
  onSelectPrompt: (prompt: string) => void;
  onAddCustomPlugin: (plugin: PluginMeta) => void;
}

export function PluginModal({
  isOpen,
  onClose,
  plugins,
  onTogglePlugin,
  onSelectPrompt,
  onAddCustomPlugin,
}: PluginModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  if (!isOpen) return null;

  const handleCreatePlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customPrompt) return;

    const newPlugin: PluginMeta = {
      id: "plugin-" + Date.now(),
      name: customName,
      description: customDesc || "Custom domain plugin",
      icon: "Sparkles",
      category: "General",
      enabled: true,
      systemPrompt: customPrompt,
      samplePrompts: [`Analyze using the ${customName} plugin.`],
    };

    onAddCustomPlugin(newPlugin);
    setCustomName("");
    setCustomDesc("");
    setCustomPrompt("");
    setShowAddForm(false);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case "Terminal":
        return <Terminal className="w-5 h-5 text-emerald-400" />;
      case "Globe":
        return <Globe className="w-5 h-5 text-blue-400" />;
      default:
        return <Puzzle className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#1E1F20] border border-[#3C4043] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2D2F31] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Puzzle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">MIRA Plugin Store & Tool Registry</h2>
              <p className="text-xs text-gray-400">
                Activate domain-specific tool engines like Astrology, Computer Science, and Live Web Search.
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

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Installed Plugins ({plugins.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#28292A] hover:bg-[#333538] text-xs font-medium text-purple-400 border border-[#3C4043] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Plugin</span>
            </button>
          </div>

          {/* Add custom plugin form */}
          {showAddForm && (
            <form
              onSubmit={handleCreatePlugin}
              className="p-4 rounded-xl bg-[#252628] border border-purple-500/40 space-y-3"
            >
              <h3 className="text-xs font-semibold text-white">Create New Domain Plugin</h3>
              <div>
                <label className="text-[11px] text-gray-300 block mb-1">Plugin Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Finance & Crypto Analyst"
                  className="w-full bg-[#1A1A1C] border border-[#3C4043] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-300 block mb-1">Description</label>
                <input
                  type="text"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="e.g. Analyzes financial markets, tokenomics, and portfolio risk"
                  className="w-full bg-[#1A1A1C] border border-[#3C4043] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-300 block mb-1">System Instructions / Tool Logic</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. When active, evaluate financial statements and explain Sharpe ratios..."
                  rows={2}
                  className="w-full bg-[#1A1A1C] border border-[#3C4043] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400 resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg shadow"
                >
                  Register Plugin
                </button>
              </div>
            </form>
          )}

          {/* Plugin list */}
          <div className="space-y-3">
            {plugins.map((plugin) => (
              <div
                key={plugin.id}
                className={`p-4 rounded-xl border transition ${
                  plugin.enabled
                    ? "bg-[#252628] border-purple-500/40 shadow-sm"
                    : "bg-[#1E1F20] border-[#3C4043] opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#2E3033] shrink-0 mt-0.5">
                      {renderIcon(plugin.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{plugin.name}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#333538] text-gray-300">
                          {plugin.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{plugin.description}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => onTogglePlugin(plugin.id)}
                    className={`shrink-0 w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                      plugin.enabled ? "bg-purple-600 justify-end" : "bg-gray-700 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                  </button>
                </div>

                {/* Sample prompts */}
                {plugin.samplePrompts && plugin.samplePrompts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#333538] flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-gray-500 block w-full">Sample queries:</span>
                    {plugin.samplePrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectPrompt(prompt);
                          onClose();
                        }}
                        className="text-[11px] text-left px-2.5 py-1 rounded-md bg-[#1C1D1E] hover:bg-[#333538] text-gray-300 hover:text-white border border-[#3C4043] transition line-clamp-1"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2D2F31] bg-[#1A1A1C] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#2D2F31] hover:bg-[#3A3C3F] text-xs font-medium text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
