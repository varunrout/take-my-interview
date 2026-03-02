"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const TRAINING_MODES = [
  { id: 1, label: "Universal Practice", icon: "🌐" },
  { id: 2, label: "Job-Specific Practice", icon: "🎯" },
  { id: 3, label: "CV-Based Practice", icon: "📄" },
  { id: 4, label: "Behavioral Training", icon: "🧠" },
  { id: 5, label: "Technical Training", icon: "⚙️" },
  { id: 6, label: "Mock Interview", icon: "🎤" },
  { id: 7, label: "Stress Interview", icon: "🔥" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cvText, setCvText] = useState("");
  const [jdText, setJdText] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [jdFileName, setJdFileName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "👋 Welcome to **Take My Interview** — your Elite AI Interview Training Coach!\n\nI'm here to transform you into a top-tier interview performer through daily structured practice.\n\nLet's start with your **Daily Check-In**:\n\n1. How many hours will you practice today?\n2. What job roles are you targeting?\n3. Do you have a job description to practice for?\n4. Do you want universal practice or job-specific practice?\n5. Did you practice yesterday?\n\nPlease answer these questions to get your personalized training plan! 💪",
      },
    ]);
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cv" | "jd"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (type === "cv") {
      setCvText(text);
      setCvFileName(file.name);
    } else {
      setJdText(text);
      setJdFileName(file.name);
    }
  };

  const handleModeSelect = (modeId: number) => {
    const mode = TRAINING_MODES.find((m) => m.id === modeId);
    if (!mode) return;
    sendMessage(`I want to start Mode ${modeId}: ${mode.label}`);
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          cvText: cvText || undefined,
          jdText: jdText || undefined,
        }),
      });

      if (!response.ok) throw new Error("API request failed");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please check your API key configuration and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Escape HTML entities first to prevent XSS, then apply markdown-like formatting
    const escaped = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
    return escaped
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 overflow-hidden bg-gray-900 border-r border-gray-800 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Training Modes
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {TRAINING_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode.id)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors flex items-center gap-2.5 text-gray-300 hover:text-white"
            >
              <span className="text-base">{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-gray-800 space-y-2">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
            Upload Documents
          </p>
          <input
            ref={cvInputRef}
            type="file"
            accept=".txt"
            onChange={(e) => handleFileUpload(e, "cv")}
            className="hidden"
          />
          <button
            onClick={() => cvInputRef.current?.click()}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-colors flex items-center gap-2 ${
              cvText
                ? "border-green-700 bg-green-900/30 text-green-400"
                : "border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-300"
            }`}
          >
            <span>📋</span>
            <span className="truncate">
              {cvFileName ? cvFileName : "Upload CV / Resume"}
            </span>
          </button>
          <input
            ref={jdInputRef}
            type="file"
            accept=".txt"
            onChange={(e) => handleFileUpload(e, "jd")}
            className="hidden"
          />
          <button
            onClick={() => jdInputRef.current?.click()}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-colors flex items-center gap-2 ${
              jdText
                ? "border-blue-700 bg-blue-900/30 text-blue-400"
                : "border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-300"
            }`}
          >
            <span>📝</span>
            <span className="truncate">
              {jdFileName ? jdFileName : "Upload Job Description"}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-1.5 rounded-md hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            aria-label="Toggle sidebar"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Take My Interview</h1>
            <p className="text-xs text-gray-400">AI Interview Training Coach</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {cvText && (
              <span className="text-xs bg-green-900/40 text-green-400 border border-green-800 px-2 py-1 rounded-full">
                CV loaded
              </span>
            )}
            {jdText && (
              <span className="text-xs bg-blue-900/40 text-blue-400 border border-blue-800 px-2 py-1 rounded-full">
                JD loaded
              </span>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                  🎓
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-gray-800 text-gray-100 rounded-tl-sm"
                }`}
                dangerouslySetInnerHTML={{
                  __html: formatMessage(msg.content),
                }}
              />
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm ml-2 flex-shrink-0 mt-1">
                  👤
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm mr-2 flex-shrink-0">
                🎓
              </div>
              <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-gray-900 border-t border-gray-800">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer or message... (Enter to send, Shift+Enter for new line)"
              rows={2}
              className="flex-1 resize-none bg-gray-800 text-gray-100 placeholder-gray-500 rounded-xl px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1.5 text-center">
            Powered by GPT-4o · Your responses are sent to OpenAI
          </p>
        </div>
      </div>
    </div>
  );
}
