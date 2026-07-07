import { Link000, Link001 } from "@/components/ui/skiper-ui/skiper40";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-2">
          <p className="font-medium text-foreground">Veritair</p>
          <p>
            A drone network for the deliveries a courier can&apos;t make — reached by air instead
            of stuck in traffic, on a footpath, or behind a closed road.
          </p>
        </div>

        <div className="flex gap-12">
          <div className="space-y-3">
            <p className="font-medium text-foreground">Network</p>
            <Link000 href="/network" className="block w-fit hover:text-foreground">
              Hubs &amp; pads
            </Link000>
            <Link000 href="/book" className="block w-fit hover:text-foreground">
              Book a delivery
            </Link000>
            <Link000 href="/orders" className="block w-fit hover:text-foreground">
              Track an order
            </Link000>
          </div>
          <div className="space-y-3">
            <p className="font-medium text-foreground">Verify</p>
            <Link000 href="/proof" className="block w-fit hover:text-foreground">
              Proof on Devnet
            </Link000>
            <Link001 href="https://github.com/nayrbryanGaming/veritair" className="block w-fit hover:text-foreground">
              Source on GitHub
            </Link001>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        Every price on this site is quoted in Devnet SOL — a test asset with no real-world value.
      </div>
    </footer>
  );
}
