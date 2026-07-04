import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { buttonVariants } from "@/components/ui/button";

export function ProofStrip() {
  return (
    <section className="mx-auto mt-28 max-w-5xl px-4">
      <Reveal>
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Verify it yourself
          </span>
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight md:text-3xl">
            Every hub, pad, and delivery lives on Solana Devnet — not just in this page
          </h2>
          <p className="max-w-lg text-muted-foreground">
            Each booking, assignment, and delivery confirmation is a real signed transaction.
            The proof page lists the recent ones with direct links to check them yourself.
          </p>
          <Link href="/proof" className={buttonVariants({ variant: "outline" })}>
            Open the proof page
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
