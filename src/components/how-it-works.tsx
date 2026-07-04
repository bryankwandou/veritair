"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/reveal";

const STEPS = [
  { label: "Hub", detail: "Sender pays, parcel is weighed and assigned a drone." },
  { label: "In flight", detail: "The drone leaves the hub bound for a specific pad." },
  { label: "Pad", detail: "It lands at a housing or public pad near the recipient." },
  { label: "Code", detail: "The recipient enters their code — or the last 4 digits of their phone." },
  { label: "Delivered", detail: "Match confirmed, escrow releases, parcel unlocks." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto mt-28 max-w-5xl px-4">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How one delivery moves</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Five steps, each one a separate signed transaction — nothing here happens only in a
          database.
        </p>
      </Reveal>

      <div className="relative mt-12 grid gap-8 md:grid-cols-5">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute top-5 left-0 hidden h-px w-full origin-left bg-border md:block"
        />
        {STEPS.map((step, i) => (
          <Reveal key={step.label} delay={i * 0.08}>
            <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
              <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background font-mono text-sm">
                {i + 1}
              </div>
              <p className="mt-3 font-medium">{step.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
