"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const OPENING: Msg = {
  role: "assistant",
  content:
    "Ask about pricing, coverage, delivery codes, or how the Devnet proof works.",
};

export function DispatchAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([OPENING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.ok ? data.reply : "The assistant is offline right now — the booking and proof pages still cover most questions.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Connection dropped. Try again in a moment." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-[420px] w-[min(92vw,360px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-medium">Dispatch assistant</p>
              <p className="text-xs text-muted-foreground">
                Answers from the live network data. It can be wrong — the proof page is the record.
              </p>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {busy && (
                <div className="w-fit rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Thinking…
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2 border-t border-border p-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How much for 2 kg to a housing pad?"
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={busy || !input.trim()}>
                Send
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close dispatch assistant" : "Open dispatch assistant"}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
