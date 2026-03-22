import { motion, type Variants, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageCircleQuestion,
  BookOpen,
  Atom,
  Calculator,
  Lightbulb,
  Zap,
  Brain,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0 } },
};

type Message = { id: number; role: "user" | "ai"; content: string; time: string; xpAwarded?: boolean };

const getTime = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

const initialMessages: Message[] = [
  {
    id: 1,
    role: "ai",
    content: "Hi! I'm your AI study assistant 🧠\n\nAsk me any doubt — whether it's Physics, Chemistry, Math, or Biology. I'll break it down step by step with clear explanations.\n\nWhat would you like to learn today?",
    time: getTime(),
  },
];

const suggestions = [
  { text: "Explain Newton's 3rd Law", icon: Atom },
  { text: "Solve: ∫ x² dx", icon: Calculator },
  { text: "What is mitosis?", icon: BookOpen },
  { text: "Tips for JEE preparation", icon: Lightbulb },
];

export default function AISolver() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: msg, time: getTime(), xpAwarded: true };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const data = await apiRequest<{ answer: string }>(
        "/api/v1/doubts",
        {
          method: "POST",
          body: JSON.stringify({ question: msg })
        },
        true
      );

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: data.answer || "No answer returned.",
        time: getTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: error instanceof Error ? error.message : "Failed to solve doubt.",
        time: getTime()
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      // Handle inline code
      const parts = line.split(/(`[^`]+`)/).map((part, j) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={j} className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
              {part.slice(1, -1)}
            </code>
          );
        }
        // Handle bold
        return part.split("**").map((seg, k) =>
          k % 2 === 1 ? <strong key={`${j}-${k}`} className="font-bold text-cyan-50">{seg}</strong> : seg
        );
      });
      return (
        <p key={i} className={i > 0 ? "mt-2" : ""}>
          {parts}
        </p>
      );
    });
  };

  const showSuggestions = messages.length <= 1 && !isTyping;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto"
    >

      {/* Chat Container */}
      <motion.div
        variants={fadeUp}
        className="glass-card flex-1 flex flex-col overflow-hidden rounded-3xl border border-cyan-500/30 shadow-xl shadow-black/10"
      >
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style]:none [overflow-y-property]:scroll">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* XP Animation */}
                {msg.xpAwarded && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -50, scale: [0, 1, 1, 0.5] }}
                    transition={{ duration: 2.5, times: [0, 0.1, 0.7, 1], ease: "easeOut" }}
                    className="absolute -top-8 right-16 z-20 font-black text-lg flex items-center gap-1 drop-shadow-xl"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-cyan-400">+15 XP</span>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5 }}>
                      <Sparkles className="h-5 w-5 text-lime-400" />
                    </motion.div>
                  </motion.div>
                )}

                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-lg ${
                    msg.role === "ai"
                      ? "bg-gradient-to-br from-cyan-500 to-lime-500 text-black shadow-cyan-500/30"
                      : "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-slate-600/30"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <Bot className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </motion.div>

                {/* Message Bubble */}
                <div className={`max-w-[75%] md:max-w-[65%] space-y-2 ${msg.role === "user" ? "items-end flex flex-col" : ""}`}>
                  <div
                    className={`px-5 py-3.5 text-sm leading-relaxed rounded-2xl transition-all ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-cyan-500 to-lime-500 text-black rounded-br-sm font-semibold shadow-lg shadow-cyan-500/20"
                        : "bg-muted/50 border border-cyan-500/30 text-muted-foreground rounded-bl-sm backdrop-blur-sm shadow-md shadow-black/5"
                    }`}
                  >
                    {renderContent(msg.content)}
                  </div>
                  <p
                    className={`text-xs text-muted-foreground/60 px-2 font-medium ${
                      msg.role === "user" ? "text-right" : ""
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3"
              >
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-lime-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-black">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-muted/50 border border-cyan-500/30 rounded-2xl rounded-bl-sm px-5 py-3.5 flex items-center gap-2 backdrop-blur-sm h-fit">
                  <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }} className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                  <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestion Cards */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.4 }}
                className="pt-4 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-lime-400" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Try asking about</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s.text}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => sendMessage(s.text)}
                      className="relative flex items-start gap-3 p-4 rounded-2xl border border-border/60 text-left group overflow-hidden hover:border-cyan-500/40 transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-lime-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-lime-500/20 flex items-center justify-center shrink-0 border border-cyan-500/30 group-hover:border-cyan-500/60 transition-all relative z-10">
                        <s.icon className="h-5 w-5 text-cyan-400" />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors relative z-10 leading-snug">
                        {s.text}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-cyan-500/20 bg-gradient-to-t from-muted/30 to-transparent backdrop-blur-md p-4 md:p-5 space-y-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 to-lime-500 opacity-0 group-focus-within:opacity-20 blur transition-opacity pointer-events-none" />
              <div className="relative flex items-end gap-2 bg-background border-2 border-border/60 rounded-2xl px-4 py-2 group-focus-within:border-cyan-500/60 group-focus-within:ring-4 group-focus-within:ring-cyan-500/10 transition-all shadow-sm">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground/50 font-medium leading-relaxed"
                  disabled={isTyping}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: input.trim() ? 1.05 : 1 }}
              whileTap={{ scale: input.trim() ? 0.95 : 1 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className={`h-[44px] w-[44px] rounded-2xl shrink-0 flex items-center justify-center font-bold transition-all duration-300 ${
                input.trim()
                  ? "bg-gradient-to-r from-cyan-500 to-lime-500 text-black shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                  : "bg-muted text-muted-foreground border-2 border-border/50 cursor-not-allowed"
              }`}
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-[11px] text-muted-foreground/60 text-center font-medium">
            AI can make mistakes. Check important info. • Earn +15 XP per doubt
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
