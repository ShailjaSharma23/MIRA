"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Sparkles, User, Globe, ExternalLink, Terminal } from "lucide-react";
import { Message } from "@/types";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`py-5 px-4 md:px-8 flex gap-4 ${
        isUser ? "bg-transparent justify-end" : "bg-[#1E1F20]/50 border-y border-[#28292A]/40"
      }`}
    >
      <div className={`max-w-3xl w-full flex gap-3.5 ${isUser ? "justify-end" : ""}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        )}

        <div className={`flex flex-col gap-2 min-w-0 ${isUser ? "items-end max-w-xl" : "flex-1"}`}>
          {/* Header tags: Plugin badge & Model name */}
          {!isUser && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-semibold text-white text-sm">MIRA</span>
              {message.model && (
                <span className="px-1.5 py-0.5 rounded bg-[#2D2F31] text-[11px] text-gray-300 font-mono">
                  {message.model}
                </span>
              )}
              {message.pluginName && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-medium border border-purple-500/30">
                  {message.pluginName}
                </span>
              )}
            </div>
          )}

          {/* Content bubble */}
          <div
            className={`leading-[1.75] ${
              isUser
                ? "bg-[#2A2B2D] text-white text-[15px] px-4 py-3 rounded-2xl rounded-tr-sm border border-[#3C4043] shadow-sm"
                : "text-gray-100 text-[16px]"
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <div className="prose prose-invert max-w-none space-y-4 text-[16px] leading-[1.75]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline = !match && !String(children).includes("\n");

                      if (isInline) {
                        return (
                          <code className="bg-[#2D2F31] text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div className="my-3 rounded-lg overflow-hidden border border-[#3C4043] bg-[#161718]">
                          <div className="bg-[#242526] px-3 py-1.5 flex items-center justify-between text-xs text-gray-400 border-b border-[#3C4043]">
                            <div className="flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5 text-purple-400" />
                              <span className="font-mono">{match ? match[1] : "code"}</span>
                            </div>
                            <button
                              onClick={() => navigator.clipboard.writeText(String(children))}
                              className="hover:text-white transition flex items-center gap-1 text-xs"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy code</span>
                            </button>
                          </div>
                          <pre className="p-3.5 text-sm font-mono overflow-x-auto text-gray-200 bg-[#141517]">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-3">
                          <table className="min-w-full divide-y divide-[#3C4043] text-left border border-[#3C4043] rounded-lg">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return <th className="bg-[#252628] px-3.5 py-2 text-sm font-semibold text-gray-200">{children}</th>;
                    },
                    td({ children }) {
                      return <td className="px-3.5 py-2 text-sm border-t border-[#333538] text-gray-300">{children}</td>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Citations Footer (Only shown when live web search was actively used) */}
          {!isUser && message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-[#2D2F31]/60 flex flex-col gap-2">
              <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Web Sources</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.citations.map((cite) => (
                  <a
                    key={cite.id}
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#252628] hover:bg-[#2F3033] border border-[#3C4043] text-xs text-blue-300 hover:text-blue-200 transition"
                  >
                    <span className="truncate max-w-[180px]">{cite.sourceName || cite.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons (Copy) */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleCopy}
                className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#2D2F31] transition flex items-center gap-1 text-[11px]"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white shrink-0 shadow-md">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
