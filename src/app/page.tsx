import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { PricingCalculator } from "@/components/pricing-calculator";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { ProofStrip } from "@/components/proof-strip";
import { NetworkStats } from "@/components/network-stats";

const SCENES = [
  {
    title: "The road stops, the footpath doesn't",
    body: "A village three kilometers past the last paved road isn't unreachable — it's just unreachable by anything with wheels. A drone flying from the nearest hub to a public pad at the village hall skips the footpath entirely.",
  },
  {
    title: "A closed road isn't a closed sky",
    body: "A protest or an accident can shut down a city's main artery for hours. Everything that depends on that road sits and waits. A drone was never using the road in the first place.",
  },
  {
    title: "The alley the map got wrong",
    body: "A gang too narrow for a bike, mismapped by consumer map software — couriers either give up or circle the block for twenty minutes. A pad at the entrance, inside the block's own security perimeter, fixes it permanently instead of once.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />

      <NetworkStats />

      <section className="mx-auto mt-28 max-w-5xl px-4">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Three ways a delivery gets stuck on the ground
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SCENES.map((scene, i) => (
            <Reveal key={scene.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-mono text-sm text-primary">
                  0{i + 1}
                </div>
                <h3 className="font-medium">{scene.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{scene.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <HowItWorks />

      <section className="mx-auto mt-28 max-w-5xl px-4">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Weight sets the price. Nothing else does, yet.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Move the slider — this mirrors the price table an order is checked against before
            it&apos;s accepted.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-8">
          <PricingCalculator />
        </Reveal>
      </section>

      <ProofStrip />

      <section className="mx-auto mt-28 max-w-3xl px-4 pb-24 text-center">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Book the first delivery yourself
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Connect a Devnet wallet, pick a hub, and watch the order move from booked to
            delivered — with a real transaction signature at every step.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/book" className={buttonVariants({ size: "lg" })}>
              Book a delivery
            </Link>
            <Link href="/network" className={buttonVariants({ size: "lg", variant: "outline" })}>
              See the network
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
