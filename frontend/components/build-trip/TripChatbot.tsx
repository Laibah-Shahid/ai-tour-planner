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
  CHATBOT_TYPING_DELAY,
  CHATBOT_WELCOME_MESSAGE,
  CHATBOT_REQUIRED_FIELDS,
  CHATBOT_FIELD_PROMPTS,
  CHATBOT_FIELD_LABELS,
} from "@/config/site";
import type { ChatMessage, GatheredTripDetails } from "@/types";

// ── Field extraction ──────────────────────────────────────────────────────────

function extractFields(text: string): Partial<GatheredTripDetails> {
  const result: Partial<GatheredTripDetails> = {};

  const peopleMatch =
    text.match(/(\d+)\s*(?:people|persons?|friends?|travelers?|pax|of us)/i) ??
    text.match(/(?:we are|there are|group of|party of)\s*(\d+)/i);
  if (peopleMatch) result.people = peopleMatch[1];

  const budgetMatch =
    text.match(/(?:PKR|Rs\.?|rupees?)\s*([\d,]+)/i) ??
    text.match(/([\d,]+)\s*(?:PKR|Rs\.?|rupees?)/i) ??
    text.match(/budget\s+(?:is|of|around)?\s*([\d,]+)/i);
  if (budgetMatch) result.budget = budgetMatch[1].replace(/,/g, "");

  const sourceMatch = text.match(
    /(?:from|starting from|departing from|leaving from|based in)\s+([A-Za-z]+(?:\s[A-Za-z]+)?)/i
  );
  if (sourceMatch) result.source = sourceMatch[1];

  const destMatch = text.match(
    /(?:visit|going to|travel to|trip to|heading to|destination is|want to go to|planning to visit)\s+([A-Za-z]+(?:\s[A-Za-z]+)?)/i
  );
  if (destMatch) result.destination = destMatch[1];
  
  const spotsMatch = text.match(
    /(?:see|visit|like to see|want to see|check out)\s+(.+?)(?:\.|$)/i
  );
  if (spotsMatch && spotsMatch[1].length > 3) result.spots = spotsMatch[1].trim();

  return result;
}

function getNextMissingField(
  details: Partial<GatheredTripDetails>
): string | null {
  return (
    (CHATBOT_REQUIRED_FIELDS as readonly string[]).find(
      (f) => !details[f as keyof GatheredTripDetails]
    ) ?? null
  );
}

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
        {(
          Object.entries(CHATBOT_FIELD_LABELS) as [string, string][]
        ).map(([key, label]) => {
          const value = details[key as keyof GatheredTripDetails];
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
  const [gatheredDetails, setGatheredDetails] = useState<
    Partial<GatheredTripDetails>
  >({});
  const [confirmedDetails, setConfirmedDetails] =
    useState<GatheredTripDetails | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Holds the pending setTimeout so we can clear it on unmount
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, confirmedDetails]);

  // Cleanup pending timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

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

  const handleSend = useCallback(() => {
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

    const extracted = extractFields(text);
    const updated = { ...gatheredDetails, ...extracted };
    setGatheredDetails(updated);

    setIsTyping(true);

    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);

      const nextField = getNextMissingField(updated);
      if (nextField) {
        addBotMessage(CHATBOT_FIELD_PROMPTS[nextField]);
      } else {
        const complete: GatheredTripDetails = {
          destination: updated.destination ?? "",
          source: updated.source ?? "",
          people: updated.people ?? "",
          budget: updated.budget ?? "",
          spots: updated.spots ?? "",
          notes: updated.notes ?? "",
        };
        setConfirmedDetails(complete);
        addBotMessage(
          "I have all the details I need! Here's a summary of your trip. Click Generate My Itinerary to create your personalized plan."
        );
        onDetailsGathered(complete);
      }
    }, CHATBOT_TYPING_DELAY);
  }, [
    input,
    isTyping,
    confirmedDetails,
    gatheredDetails,
    addBotMessage,
    onDetailsGathered,
  ]);

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
    if (isTyping) return "AI is typing...";
    return "Tell me your plan…";
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
