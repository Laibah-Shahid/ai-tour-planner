"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CHATBOT_WELCOME_MESSAGE,
  CHATBOT_FIELD_LABELS,
} from "@/config/site";
import { sendChatMessage } from "@/lib/api";
import type { ChatMessage, GatheredTripDetails } from "@/types";

// ── TypingIndicator ───────────────────────────────────────────────────────────

const DOT_DELAYS = [0, 0.2, 0.4] as const;

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xs">
        AI
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {DOT_DELAYS.map((delay) => (
            <motion.span
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-gray-400 block"
              animate={{ y: [0, -4, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// ── MessageBubble ─────────────────────────────────────────────────────────────

const MessageBubble = memo(function MessageBubble({
  message,
}: {
  message: ChatMessage;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
          isUser ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700"
        }`}
      >
        {isUser ? "You" : "AI"}
      </div>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-emerald-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
});

// ── DetailsMiniCard ───────────────────────────────────────────────────────────

const DetailsMiniCard = memo(function DetailsMiniCard({
  details,
}: {
  details: GatheredTripDetails;
}) {
  const displayFields: [string, string, string][] = [
    ["destination", "Destinations", Array.isArray(details.destination) ? details.destination.join(", ") : details.destination],
    ["source", "Starting Point", details.source],
    ["adults", "Adults", details.adults],
    ["kids", "Kids", details.kids],
    ["budget", "Budget (PKR)", details.budget],
    ["days", "Days", details.days],
    ["start_date", "Start Date", details.start_date],
    ["end_date", "End Date", details.end_date],
    ["transport_type", "Transport", details.transport_type],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mt-2"
    >
      <p className="text-sm font-semibold text-emerald-700 mb-3">
        Trip details confirmed
      </p>
      <div className="grid grid-cols-2 gap-2">
        {displayFields.map(([key, label, value]) => {
          if (!value) return null;
          return (
            <div
              key={key}
              className="bg-white rounded-lg px-3 py-2 border border-emerald-100"
            >
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-medium text-gray-800 truncate">
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
});

// ── TripChatbot ───────────────────────────────────────────────────────────────

interface TripChatbotProps {
  onDetailsGathered: (details: GatheredTripDetails) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "bot",
    content: CHATBOT_WELCOME_MESSAGE,
    timestamp: 0,
  },
];

export default function TripChatbot({ onDetailsGathered }: TripChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [confirmedDetails, setConfirmedDetails] =
    useState<GatheredTripDetails | null>(null);
  const [sessionId] = useState(() => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, confirmedDetails]);

  const addBotMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        role: "bot",
        content,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping || confirmedDetails) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage({
        message: text,
        session_id: sessionId,
      });

      setIsTyping(false);
      addBotMessage(response.reply);

      if (response.trip_complete && response.extracted_details) {
        const details = response.extracted_details;
        const segments = (details.segments as { city: string; number_of_days?: number; preferences?: string[]; transport_from_previous?: string }[]) || [];

        const gathered: GatheredTripDetails = {
          destination: segments.map((s) => s.city),
          source: (details.starting_city as string) || "",
          budget: String((details.budget as { amount?: number })?.amount || ""),
          spots: segments.flatMap((s) => s.preferences || []),
          notes: "",
          start_date: (details.total_start_date as string) || "",
          end_date: (details.total_end_date as string) || "",
          days: String(segments.reduce((sum: number, s) => sum + (s.number_of_days || 0), 0)),
          kids: String(details.kids || "0"),
          adults: String(details.adults || "1"),
          transport_type: segments[0]?.transport_from_previous || "car",
        };

        setConfirmedDetails(gathered);
        onDetailsGathered(gathered);
      }
    } catch (err) {
      setIsTyping(false);
      addBotMessage("Sorry, I encountered an error. Please try again.");
      console.error("Chat error:", err);
    }
  }, [input, isTyping, confirmedDetails, sessionId, addBotMessage, onDetailsGathered]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSend();
    },
    [handleSend]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value),
    []
  );

  const isInputDisabled = isTyping || !!confirmedDetails;

  const inputPlaceholder = useMemo(() => {
    if (confirmedDetails) return "All details gathered!";
    if (isTyping) return "AI is thinking...";
    return "Tell me your plan...";
  }, [confirmedDetails, isTyping]);

  const isSendDisabled = !input.trim() || isInputDisabled;

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Chat header */}
      <div className="px-5 py-3 border-b bg-gradient-to-r from-emerald-50 to-white flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-sm font-semibold text-gray-700">
          AI Trip Assistant
        </span>
        <span className="text-xs text-gray-400 ml-1">
          — powered by PakTour AI
        </span>
      </div>

      {/* Chat messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        <AnimatePresence>
          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        {confirmedDetails && <DetailsMiniCard details={confirmedDetails} />}
      </div>

      {/* Input bar */}
      <div className="border-t px-4 py-3 flex gap-2 bg-gray-50">
        <Input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={inputPlaceholder}
          disabled={isInputDisabled}
          className="flex-1 focus-visible:ring-emerald-500 bg-white"
        />
        <Button
          onClick={handleSend}
          disabled={isSendDisabled}
          size="icon"
          aria-label="Send message"
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
