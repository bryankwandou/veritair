"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const farY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const nearY = useTransform(scrollYProgress, [0, 1], [0, 340]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={ref} className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden">
      <motion.div style={{ y: farY, opacity: fade }} className="pointer-events-none absolute inset-0 -z-30">
        <svg viewBox="0 0 1200 600" className="h-full w-full opacity-[0.35]" preserveAspectRatio="xMidYMax slice">
          <path d="M0 520 L180 380 L340 460 L520 300 L720 430 L900 260 L1060 380 L1200 320 L1200 600 L0 600 Z" fill="currentColor" className="text-muted" />
        </svg>
      </motion.div>

      <motion.div style={{ y: midY, opacity: fade }} className="pointer-events-none absolute inset-0 -z-20">
        <svg viewBox="0 0 1200 600" className="h-full w-full opacity-[0.5]" preserveAspectRatio="xMidYMax slice">
          <path d="M0 560 L220 430 L400 500 L600 360 L820 470 L1000 340 L1200 400 L1200 600 L0 600 Z" fill="currentColor" className="text-border" />
        </svg>
      </motion.div>

      <motion.div
        style={{ y: nearY, opacity: fade }}
        className="pointer-events-none absolute right-[8%] top-[18%] -z-10 hidden md:block"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="120" height="60" viewBox="0 0 120 60" className="text-primary">
          <ellipse cx="60" cy="30" rx="30" ry="8" fill="currentColor" opacity="0.15" />
          <circle cx="30" cy="18" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="90" cy="18" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="30" cy="42" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="90" cy="42" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="46" y="24" width="28" height="12" rx="3" fill="currentColor" />
        </svg>
      </motion.div>

      <div className="relative mx-auto w-full max-w-3xl px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Live on Solana Devnet
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-4xl font-semibold tracking-tight md:text-6xl"
        >
          Delivery for the places
          <br />a courier can&apos;t get to
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground"
        >
          Hubs launch the drones. Pads receive them. A code at the door releases the parcel — and
          every step of that chain is a transaction you can look up yourself.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/book" className={buttonVariants({ size: "lg" })}>
            Book a delivery
          </Link>
          <Link href="/network" className={buttonVariants({ size: "lg", variant: "outline" })}>
            See the network
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
