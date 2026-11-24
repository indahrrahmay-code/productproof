
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Contract, JsonRpcProvider } from "ethers";
import ProductProofABI from "../abi/ProductProof.json";
import { CONTRACT_ADDRESS } from "../contractConfig";

type ProductData = {
  brand: string;
  model: string;
  storageCapacity: string;
  color: string;
  condition: string;
  registrationDate: string;
};

type ServiceRecord = {
  providerName: string;
  serviceType: string;
  description: string;
  serviceDate: string;
  recordedBy: string;
};

const provider = new JsonRpcProvider(
  "https://ethereum-sepolia-rpc.publicnode.com"
);

const contract = new Contract(
  CONTRACT_ADDRESS,
  ProductProofABI,
  provider
);

export default function VerifyProduct() {
  const [passportId, setPassportId] = useState("");
  const [product, setProduct] = useState<ProductData | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyTokenId(tokenId: number) {
    setProduct(null);
    setServiceHistory([]);
    setMessage("");
    setLoading(true);

    try {
      const result = await contract.getProduct(tokenId);

      const registrationTimestamp = Number(result.registrationDate);

      setProduct({
        brand: result.brand,
        model: result.model,
        storageCapacity: result.storageCapacity,
        color: result.color,
        condition: result.condition,
        registrationDate: new Date(
          registrationTimestamp * 1000
        ).toLocaleString("en-GB"),
      });

      try {
        const records = await contract.getServiceHistory(tokenId);

        const formattedRecords: ServiceRecord[] = records.map(
          (record: any) => ({
            providerName: record.providerName,
            serviceType: record.serviceType,
            description: record.description,
            serviceDate: new Date(
              Number(record.serviceDate) * 1000
            ).toLocaleString("en-GB"),
            recordedBy: record.recordedBy,
          })
        );

        setServiceHistory(formattedRecords);
      } catch (historyError) {
        console.error("Service history error:", historyError);
      }
    } catch (error) {
      console.error(error);
      setMessage(
        "Passport not found. Please check the Token ID or try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const tokenId = Number(passportId.trim());

    if (
      !Number.isSafeInteger(tokenId) ||
      tokenId < 0 ||
      passportId.trim() === ""
    ) {
      setProduct(null);
      setServiceHistory([]);
      setMessage("Please enter a valid numeric Token ID.");
      return;
    }

    await verifyTokenId(tokenId);
  }

  // Automatically verify when a Token ID is provided in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id !== null && id.trim() !== "") {
      const tokenId = Number(id);

      if (Number.isSafeInteger(tokenId) && tokenId >= 0) {
        setPassportId(id);
        void verifyTokenId(tokenId);
      }
    }
  }, []);

  // QR destination for the currently verified product
  const qrUrl =
    product && typeof window !== "undefined"
      ? `${window.location.origin}/verify?id=${passportId}`
      : "";

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white px-8 py-5">
        <Link href="/" className="text-2xl font-bold text-blue-700">
          ProductProof.
        </Link>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/dashboard"
          className="text-sm text-blue-700 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-8 text-center">
          <p className="text-sm font-semibold tracking-widest text-blue-700">
            PRODUCT VERIFICATION
          </p>

          <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Verify Your Smartphone
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Check a smartphone's product passport and service history
            directly from the Ethereum Sepolia blockchain.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-10 rounded-2xl border bg-white p-6 shadow-sm sm:p-8"
        >
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Product Passport Token ID
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="number"
              min="0"
              step="1"
              required
              value={passportId}
              onChange={(e) => {
                setPassportId(e.target.value);
                setProduct(null);
                setServiceHistory([]);
                setMessage("");
              }}
              placeholder="e.g. 0"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify Product"}
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Try Token ID 0 or 1.
          </p>
        </form>

        {loading && (
          <div className="mt-6 rounded-xl border bg-white p-5 text-center text-gray-500">
            Checking blockchain records...
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl border border-red-200 bg-white p-5">
            <h2 className="font-semibold text-red-700">
              Verification Unsuccessful
            </h2>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </div>
        )}

        {product && (
          <div className="mt-6 space-y-6">
            {/* Product Information */}
            <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                  ✓
                </div>

                <div>
                  <h2 className="font-semibold text-green-800">
                    Blockchain Passport Verified
                  </h2>
                  <p className="text-sm text-gray-500">
                    Product record retrieved from Ethereum Sepolia.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-medium text-gray-400">
                  PASSPORT TOKEN ID
                </p>

                <h3 className="mt-1 text-xl font-bold text-gray-900">
                  #{passportId}
                </h3>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Brand</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {product.brand}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Model</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {product.model}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Storage</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {product.storageCapacity}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {product.color || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Condition</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {product.condition}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Registration Date
                    </p>
                    <p className="mt-1 font-medium text-gray-900">
                      {product.registrationDate}
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${passportId}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-block text-sm font-medium text-blue-700 hover:underline"
              >
                View NFT on Etherscan ↗
              </a>
            </div>

            {/* Service History */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-blue-700">
                    MAINTENANCE RECORDS
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    Service History
                  </h2>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {serviceHistory.length} Record(s)
                </span>
              </div>

              {serviceHistory.length === 0 ? (
                <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">
                  <div className="text-3xl">🛠️</div>
                  <h3 className="mt-2 font-semibold text-gray-800">
                    No Service Records
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No repairs or maintenance have been recorded on this
                    blockchain passport yet.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {serviceHistory.map((record, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="font-bold text-gray-900">
                          {record.serviceType}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {record.serviceDate}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium text-blue-700">
                        {record.providerName}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {record.description}
                      </p>

                      <div className="mt-4 border-t pt-3">
                        <p className="text-xs text-gray-400">
                          RECORDED BY WALLET
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-gray-500">
                          {record.recordedBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-5 text-xs leading-5 text-gray-400">
                Service history is retrieved directly from the blockchain.
                Records cannot be edited or deleted after being registered.
                Blockchain records do not independently guarantee that the
                described service was actually performed.
              </p>
            </div>

            {/* QR Code */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="text-center">
                <p className="text-xs font-semibold tracking-widest text-blue-700">
                  DIGITAL PRODUCT PASSPORT
                </p>
                <h2 className="mt-2 text-xl font-bold text-gray-900">
                  Scan to Verify
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Scan this QR code to open this product's verification page.
                </p>

                <div className="mt-6 inline-block rounded-2xl border bg-white p-4">
                  <QRCodeSVG
                    value={qrUrl}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <p className="mt-4 break-all text-xs text-gray-400">
                  {qrUrl}
                </p>

                <p className="mt-3 text-xs text-gray-500">
                  This QR code links to the product passport verification page.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Have a smartphone to register?
          </p>
          <Link
            href="/register"
            className="mt-2 inline-block font-medium text-blue-700 hover:underline"
          >
            Create a Product Passport →
          </Link>
        </div>
      </div>
    </main>
  );
}
