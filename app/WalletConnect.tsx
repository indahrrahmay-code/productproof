
"use client";

import { useState } from "react";
import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WalletConnect() {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setMessage("MetaMask belum terdeteksi. Silakan aktifkan extension.");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (!accounts.length) {
        setMessage("Wallet belum terhubung.");
        return;
      }

      const network = await provider.getNetwork();

      if (network.chainId !== BigInt(11155111)) {
        setMessage("Silakan pilih jaringan Ethereum Sepolia di MetaMask.");
        return;
      }

      setAddress(accounts[0]);
      setMessage("Wallet berhasil terhubung ke Sepolia!");
    } catch (error) {
      console.error(error);
      setMessage("Koneksi wallet gagal. Silakan coba lagi.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={connectWallet}
        className="rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-400"
      >
        {address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : "Connect Wallet"}
      </button>

      {message && (
        <p className="max-w-48 text-right text-xs text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
}
