import Link from "next/link";

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
          <div className="space-y-2">
            <p className="font-medium text-foreground">Network</p>
            <Link href="/network" className="block hover:text-foreground">
              Hubs &amp; pads
            </Link>
            <Link href="/book" className="block hover:text-foreground">
              Book a delivery
            </Link>
            <Link href="/orders" className="block hover:text-foreground">
              Track an order
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Verify</p>
            <Link href="/proof" className="block hover:text-foreground">
              Proof on Devnet
            </Link>
            <a
              href="https://github.com/nayrbryanGaming/veritair"
              target="_blank"
              rel="noreferrer"
              className="block hover:text-foreground"
            >
              Source on GitHub
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        Every price on this site is quoted in Devnet SOL — a test asset with no real-world value.
      </div>
    </footer>
  );
}
