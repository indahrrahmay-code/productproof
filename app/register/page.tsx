
"use client";

import Link from "next/link";
import { useState } from "react";
import { BrowserProvider } from "ethers";
import {
  getProductProofV3Contract,
  registerProductV3,
} from "../contractV3";

export default function RegisterSmartphone() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState("");


async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setLoading(true);
  setMessage("");
  setTxHash("");

  try {
    if (!window.ethereum) {
      throw new Error("MetaMask belum terdeteksi.");
    }

    const formData = new FormData(e.currentTarget);

    const brand = String(formData.get("brand"));
    const model = String(formData.get("model"));
    const storage = String(formData.get("storage"));
    const color = String(formData.get("color"));
    const condition = String(formData.get("condition"));
    const imei = String(formData.get("imei")).trim();

    if (!/^[0-9]{15}$/.test(imei)) {
      throw new Error("IMEI harus terdiri dari 15 digit angka.");
    }

    const contract = await getProductProofV3Contract();
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const walletAddress = await signer.getAddress();

    const isRegistrar = await contract.authorizedRegistrars(walletAddress);

    if (!isRegistrar) {
      throw new Error(
        "Wallet ini belum memiliki izin registrar untuk kontrak V3."
      );
    }

    setMessage("Membuat device fingerprint secara aman...");

    const fingerprintResponse = await fetch("/api/fingerprint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imei }),
    });

    const fingerprintData = await fingerprintResponse.json();

    if (!fingerprintResponse.ok) {
      throw new Error(
        fingerprintData.error || "Gagal membuat fingerprint."
      );
    }

    const deviceFingerprint = fingerprintData.fingerprint;

    setMessage("Menunggu konfirmasi transaksi di MetaMask...");

    const receipt = await registerProductV3(
      walletAddress,
      brand,
      model,
      storage,
      color,
      condition,
      deviceFingerprint,
      "https://example.com/productproof/metadata"
    );

    if (!receipt || receipt.status !== 1) {
      throw new Error("Transaksi gagal.");
    }

    setTxHash(receipt.hash);
    setMessage(
      "Product Passport V3 berhasil didaftarkan ke blockchain Sepolia!"
    );

  } catch (error: unknown) {
    console.error(error);

    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan.";

    setMessage(errorMessage);
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white px-8 py-5">
        <Link href="/dashboard" className="text-2xl font-bold text-blue-700">
          ProductProof.
        </Link>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-blue-700 hover:underline">
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold text-blue-700">
            DIGITAL PRODUCT PASSPORT
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Register New Smartphone
          </h1>
          <p className="mt-2 text-gray-500">
            Register a smartphone and create its blockchain-based product passport.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border bg-white p-8 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Device Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the smartphone details.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Brand
              </label>
              <select name="brand" required defaultValue="" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900">
                <option value="" disabled>Select brand</option>
                {["Apple", "Samsung", "Xiaomi", "OPPO", "vivo", "Huawei", "Realme", "Google", "Other"].map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Model
              </label>
              <input name="model" required type="text" placeholder="e.g. iPhone 13" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Storage Capacity
              </label>
              <select name="storage" required defaultValue="" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900">
                <option value="" disabled>Select storage</option>
                {["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "Other"].map((storage) => (
                  <option key={storage} value={storage}>{storage}</option>
                ))}
              </select>
            </div>

            <div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Device IMEI
  </label>
  <input
    name="imei"
    required
    type="text"
    inputMode="numeric"
    maxLength={15}
    pattern="[0-9]{15}"
    placeholder="Enter 15-digit IMEI"
    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
  />
  <p className="mt-1 text-xs text-gray-500">
    Used only to generate a private device fingerprint. The raw IMEI
    is not stored on the blockchain.
  </p>
</div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Color
              </label>
              <input
                name="color"
                required
                type="text"
                placeholder="e.g. Black"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Device Condition
              </label>
              <select name="condition" required defaultValue="" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900">
                <option value="" disabled>Select condition</option>
                {["Like New", "Good", "Fair", "Needs Repair"].map((condition) => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>Privacy notice:</strong> Your IMEI is used only to
              generate a secure device fingerprint to prevent duplicate
              registrations. The raw IMEI is not stored on the blockchain.
              Other submitted device information will be recorded on the
              Sepolia test blockchain.
            </p>
          </div>

          {message && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">{message}</p>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-blue-700 underline"
                >
                  View transaction on Etherscan ↗
                </a>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Processing..." : "Create Product Passport"}
            </button>

            <Link href="/dashboard" className="rounded-lg border px-5 py-3 text-center font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
