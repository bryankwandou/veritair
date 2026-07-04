"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";

function shorten(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const { publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (publicKey) {
    return (
      <Button variant="outline" size="sm" onClick={() => disconnect()} className="font-mono">
        {shorten(publicKey.toBase58())}
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={() => setVisible(true)}>
      Connect wallet
    </Button>
  );
}
