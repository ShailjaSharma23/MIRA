"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { MessageItem } from "@/components/MessageItem";
import { ChatInput } from "@/components/ChatInput";
import { PluginModal } from "@/components/PluginModal";
import { AuthModal } from "@/components/AuthModal";
import { Conversation, Message, PluginMeta, AIModel, UserProfile } from "@/types";
import { AVAILABLE_MODELS } from "@/lib/models/registry";
import { DEFAULT_PLUGINS } from "@/lib/plugins/registry";
import { generateId } from "@/lib/utils";
import { Sparkles, Globe, Terminal, Compass, ArrowRight } from "lucide-react";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AVAILABLE_MODELS[0]);
  const [plugins, setPlugins] = useState<PluginMeta[]>(DEFAULT_PLUGINS);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isPluginModalOpen, setIsPluginModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserProfile>({
    id: "user-1",
    name: "Shailja Sharma",
    email: "shailjasharma2307@gmail.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shailja",
    isLoggedIn: true,
  });

  const syncConversationToDb = async (conv: Conversation) => {
    if (!user.isLoggedIn || !user.id) return;
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: conv.id,
          userId: user.id,
          title: conv.title,
          messages: conv.messages,
          activePlugins: conv.activePlugins || [],
          pinned: conv.pinned || false,
        }),
      });
    } catch (e) {
      console.warn("Background cloud sync skipped:", e);
    }
  };

  // Load conversations from cloud / localStorage
  useEffect(() => {
    async function loadData() {
      if (user.isLoggedIn && user.id) {
        try {
          const res = await fetch(`/api/history?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.conversations && data.conversations.length > 0) {
              setConversations(data.conversations);
              setActiveId(data.conversations[0].id);
              return;
            }
          }
        } catch (e) {
          console.warn("Failed to fetch cloud history, falling back to local storage:", e);
        }
      }

      try {
        const saved = localStorage.getItem("mira_conversations");
        if (saved) {
          const parsed = JSON.parse(saved);
          setConversations(parsed);
          if (parsed.length > 0) {
            setActiveId(parsed[0].id);
          }
        } else {
          createNewChat();
        }
      } catch {
        createNewChat();
      }
    }

    loadData();
  }, [user.id]);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("mira_conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeId, isLoading]);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation?.messages || [];

  const createNewChat = () => {
    const newChat: Conversation = {
      id: generateId(),
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
  };

  const deleteChat = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        setActiveId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });

    if (user.isLoggedIn && user.id) {
      fetch(`/api/history?id=${id}&userId=${user.id}`, { method: "DELETE" }).catch(() => {});
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    let currentChatId = activeId;
    if (!currentChatId) {
      const newChat: Conversation = {
        id: generateId(),
        title: content.slice(0, 30),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations((prev) => [newChat, ...prev]);
      setActiveId(newChat.id);
      currentChatId = newChat.id;
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      createdAt: Date.now(),
    };

    // Retrieve fresh conversation messages to guarantee full multi-turn memory
    const targetConv = conversations.find((c) => c.id === currentChatId);
    const existingMessages = targetConv ? targetConv.messages : [];
    const fullConversation = [...existingMessages, userMessage];

    // Update conversation with user message
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === currentChatId) {
          const isFirstMessage = conv.messages.length === 0;
          return {
            ...conv,
            title: isFirstMessage ? content.slice(0, 32) : conv.title,
            messages: fullConversation,
            updatedAt: Date.now(),
          };
        }
        return conv;
      })
    );

    setIsLoading(true);

    const activePluginIds = plugins.filter((p) => p.enabled).map((p) => p.id);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: fullConversation,
          activePlugins: activePluginIds,
          model: selectedModel.id,
          webSearchEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.content || "No response received",
        createdAt: Date.now(),
        model: selectedModel.name,
        pluginName: data.pluginName,
        citations: data.citations || [],
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === currentChatId) {
            const updated = {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              updatedAt: Date.now(),
            };
            syncConversationToDb(updated);
            return updated;
          }
          return conv;
        })
      );
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: "Sorry, I encountered an issue processing your request. Please check your network or try again.",
          createdAt: Date.now(),
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === currentChatId) {
              return {
                ...conv,
                messages: [...conv.messages, errorMessage],
              };
            }
            return conv;
          })
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const addCustomPlugin = (newPlugin: PluginMeta) => {
    setPlugins((prev) => [...prev, newPlugin]);
  };

  const starterSuggestions = [
    {
      title: "Live Internet Research",
      desc: "Latest AI breakthroughs & real-time news",
      prompt: "What are the latest AI and tech breakthroughs reported this week? Search the web and provide sources.",
      icon: Globe,
    },
    {
      title: "Astrology Birth Chart",
      desc: "Calculate planetary houses, Sun, Moon & Rising",
      prompt: "Calculate my Sun, Moon, and Rising sign for July 23, 1998, 4:15 PM in New Delhi, and give me a full reading.",
      icon: Sparkles,
      pluginId: "astrology",
    },
    {
      title: "Computer Science Deep Dive",
      desc: "Trie data structure with Big-O complexity",
      prompt: "Implement a production Trie data structure in TypeScript with prefix search, and analyze its time and space complexity.",
      icon: Terminal,
      pluginId: "computer-science",
    },
    {
      title: "Full-Stack Architecture",
      desc: "Next.js 16, Google OAuth, and Postgres DB",
      prompt: "Explain how PostgreSQL MVCC works internally and how to design optimal database indexes for chat applications.",
      icon: Compass,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#131314] overflow-hidden text-gray-200">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => setActiveId(id)}
        onNewChat={createNewChat}
        onDelete={deleteChat}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main chat column */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          activePlugins={plugins}
          onOpenPluginModal={() => setIsPluginModalOpen(true)}
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Messages viewport */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white mb-4 shadow-xl shadow-purple-500/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Hello, {user.name.split(" ")[0]}
              </h1>
              <p className="text-gray-400 text-sm mt-1 max-w-md">
                What would you like to explore today? MIRA has access to live web knowledge, open-source Hugging Face models, and modular plugins.
              </p>

              {/* Starter prompt cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full text-left">
                {starterSuggestions.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (item.pluginId) {
                          setPlugins((prev) =>
                            prev.map((p) => (p.id === item.pluginId ? { ...p, enabled: true } : p))
                          );
                        }
                        handleSendMessage(item.prompt);
                      }}
                      className="p-3.5 rounded-xl bg-[#1E1F20] hover:bg-[#252628] border border-[#2D2F31] hover:border-purple-500/40 transition group flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-semibold text-white">{item.title}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="py-5 px-4 md:px-8 bg-[#1E1F20]/50 border-t border-[#28292A]/40 flex gap-4">
                  <div className="max-w-3xl w-full flex gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-[11px] font-mono text-purple-300">Searching global web knowledge & executing plugins...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          onSend={handleSendMessage}
          onStop={handleStop}
          isLoading={isLoading}
          activePlugins={plugins}
          onOpenPluginModal={() => setIsPluginModalOpen(true)}
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
        />
      </div>

      {/* Plugin Modal */}
      <PluginModal
        isOpen={isPluginModalOpen}
        onClose={() => setIsPluginModalOpen(false)}
        plugins={plugins}
        onTogglePlugin={togglePlugin}
        onSelectPrompt={(p) => handleSendMessage(p)}
        onAddCustomPlugin={addCustomPlugin}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onLogin={(profile) => setUser((prev) => ({ ...prev, ...profile, isLoggedIn: true }))}
        onLogout={() =>
          setUser({
            id: "",
            name: "Guest",
            email: "",
            avatar: "",
            isLoggedIn: false,
          })
        }
      />
    </div>
  );
}
