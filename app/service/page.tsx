
"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import ProductProofV3Artifact from "../abi/ProductProofV3.json";
import { CONTRACT_V3_ADDRESS, CONTRACT_CHAIN_ID } from "../contractConfig";

export default function ServicePage() {
  const [tokenId, setTokenId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setTxHash("");

    try {
      setLoading(true);

      const ethereum = (window as any).ethereum;

      if (!ethereum) {
        throw new Error("MetaMask belum terdeteksi.");
      }

      const provider = new BrowserProvider(ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== BigInt(CONTRACT_CHAIN_ID)) {
        throw new Error("Silakan pindah ke jaringan Ethereum Sepolia.");
      }

      const signer = await provider.getSigner();

      const contract = new Contract(
        CONTRACT_V3_ADDRESS,
        ProductProofV3Artifact.abi,
        signer
      );

      const tx = await contract.addServiceRecord(
        Number(tokenId),
        serviceType,
        description
      );

      setMessage("Transaksi terkirim! Menunggu konfirmasi blockchain...");

      const receipt = await tx.wait();

      if (receipt.status !== 1) {
        throw new Error("Transaksi gagal.");
      }

      setTxHash(tx.hash);
      setMessage("Service record berhasil ditambahkan ke blockchain!");

      setTokenId("");
      setServiceType("");
      setDescription("");
    } catch (error: any) {
      setMessage(
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle =
    "w-full rounded-xl border border-white/10 bg-[#111c32] px-4 py-3 text-white outline-none focus:border-blue-500";

  return (
    <main className="min-h-screen bg-[#080f20] px-5 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <a
          href="/dashboard"
          className="mb-8 inline-block text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Dashboard
        </a>

        <div className="mb-8">
          <p className="mb-3 text-sm font-medium tracking-[0.2em] text-blue-400">
            DIGITAL PRODUCT PASSPORT
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Add Service Record
          </h1>

          <p className="mt-3 text-gray-400">
            Record a smartphone repair or maintenance history
            on the blockchain.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-white/10 bg-[#0e1930] p-6 md:p-8"
        >
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Smartphone Token ID
            </label>
            <input
              type="number"
              min="0"
              required
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Example: 0"
              className={inputStyle}
            />
          </div>


          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Service Type
            </label>
            <input
              required
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="Example: Battery Replacement"
              className={inputStyle}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Service Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the repair or maintenance performed..."
              className={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Processing Transaction..." : "Add Service Record"}
          </button>

          {message && (
            <div className="break-words rounded-xl border border-white/10 bg-[#080f20] p-4 text-sm">
              {message}
            </div>
          )}

          {txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-blue-400 underline"
            >
              View Transaction on Etherscan ↗
            </a>
          )}
        </form>

        <p className="mt-5 text-xs leading-6 text-gray-500">
          Only authorized service providers can submit service records.
          Records submitted to the blockchain cannot be edited or deleted.
        </p>
      </div>
    </main>
  );
}
