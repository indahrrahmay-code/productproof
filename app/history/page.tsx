
"use client";

import { useState } from "react";
import { JsonRpcProvider, Contract } from "ethers";
import ProductProofABI from "../abi/ProductProof.json";
import { CONTRACT_ADDRESS } from "../contractConfig";

const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

export default function HistoryPage() {
  const [tokenId, setTokenId] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchHistory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProduct(null);
    setRecords([]);

    try {
      const provider = new JsonRpcProvider(RPC_URL);
      const contract = new Contract(
        CONTRACT_ADDRESS,
        ProductProofABI,
        provider
      );

      const id = Number(tokenId);
      const productData = await contract.getProduct(id);
      const historyData = await contract.getServiceHistory(id);

      setProduct(productData);
      setRecords(Array.from(historyData));
    } catch (err: any) {
      setError(
        err?.reason ||
        err?.shortMessage ||
        "Product not found or unable to read blockchain data."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(timestamp: any) {
    return new Date(Number(timestamp) * 1000).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const inputStyle =
    "w-full rounded-xl border border-white/10 bg-[#111c32] px-4 py-3 text-white outline-none focus:border-blue-500";

  return (
    <main className="min-h-screen bg-[#080f20] px-5 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <a
          href="/dashboard"
          className="mb-8 inline-block text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Dashboard
        </a>

        <div className="mb-8">
          <p className="mb-3 text-sm font-medium tracking-[0.2em] text-blue-400">
            BLOCKCHAIN RECORDS
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">
            Service History
          </h1>
          <p className="mt-3 text-gray-400">
            Explore recorded smartphone repairs and maintenance
            stored on Ethereum Sepolia.
          </p>
        </div>

        <form
          onSubmit={searchHistory}
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0e1930] p-6 sm:flex-row"
        >
          <input
            type="number"
            min="0"
            required
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Enter Token ID (e.g. 0)"
            className={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Searching..." : "View History"}
          </button>
        </form>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {product && (
          <section className="mb-8 rounded-2xl border border-white/10 bg-[#0e1930] p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Product Passport</h2>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                Token #{tokenId}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">Brand</p>
                <p className="mt-1">{product.brand}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Model</p>
                <p className="mt-1">{product.model}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Storage</p>
                <p className="mt-1">{product.storageCapacity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Color</p>
                <p className="mt-1">{product.color}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Condition</p>
                <p className="mt-1">{product.condition}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Registered</p>
                <p className="mt-1">
                  {formatDate(product.registrationDate)}
                </p>
              </div>
            </div>
          </section>
        )}

        {product && (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Service Records</h2>
              <span className="text-sm text-gray-400">
                {records.length} record(s)
              </span>
            </div>

            {records.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0e1930] p-8 text-center text-gray-400">
                No service history has been recorded for this device.
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record, index) => (
                  <article
                    key={index}
                    className="rounded-2xl border border-white/10 bg-[#0e1930] p-6"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                        {record.serviceType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(record.serviceDate)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold">
                      {record.providerName}
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                      {record.description || "No description provided."}
                    </p>

                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="text-xs text-gray-500">
                        Recorded by wallet
                      </p>
                      <p className="mt-1 break-all font-mono text-xs text-blue-300">
                        {record.recordedBy}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <p className="mt-8 text-xs leading-6 text-gray-500">
          Service history is retrieved directly from the ProductProof
          smart contract on Ethereum Sepolia. Blockchain records are
          permanent and cannot be edited or deleted.
        </p>
      </div>
    </main>
  );
}
