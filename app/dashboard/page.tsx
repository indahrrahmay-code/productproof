
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import ProductProofV3Artifact from "../abi/ProductProofV3.json";
import { CONTRACT_V3_ADDRESS } from "../contractConfig";

const RPC_URL = "https:" + "//" + "ethereum-sepolia-rpc.publicnode.com";

type Product = {
  id: number;
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: string;
  registrationDate: string;
};

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const provider = new JsonRpcProvider(RPC_URL);

        const contract = new Contract(
          CONTRACT_V3_ADDRESS,
          ProductProofV3Artifact.abi,
          provider
        );

        const foundProducts: Product[] = [];

        for (let id = 0; id < 100; id++) {
          try {
            const result = await contract.getProduct(id);

            foundProducts.push({
              id,
              brand: result.brand,
              model: result.model,
              storage: result.storageCapacity,
              color: result.color,
              condition: result.condition,
              registrationDate: new Date(
                Number(result.registrationDate) * 1000
              ).toLocaleString("en-GB"),
            });
          } catch {
            break;
          }
        }

        setProducts(foundProducts);
      } catch (err) {
        console.error(err);
        setError("Unable to load blockchain data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const latestProduct =
    products.length > 0 ? products[products.length - 1] : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between border-b bg-white px-8 py-5">
        <Link href="/" className="text-2xl font-bold text-blue-700">
          ProductProof.
        </Link>
        <Link
          href="/signin"
          className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Sign Out
        </Link>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div>
          <p className="text-sm font-medium text-blue-700">
            PRODUCTPROOF WORKSPACE
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-500">
            Manage your smartphone product passports in one place.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm text-gray-500">
              Registered Smartphones
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {loading ? "..." : products.length}
            </h2>
            <p className="mt-2 text-xs text-green-600">
              Live blockchain data
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm text-gray-500">
              Product Passports
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {loading ? "..." : products.length}
            </h2>
            <p className="mt-2 text-xs text-green-600">
              ERC-721 passports on Sepolia
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm text-gray-500">
              Latest Token ID
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {loading ? "..." : latestProduct ? `#${latestProduct.id}` : "-"}
            </h2>
            <p className="mt-2 text-xs text-gray-400">
              Most recently registered passport
            </p>
          </div>
        </div>

        <section className="mt-10 rounded-xl border bg-white p-7">
          <h2 className="text-xl font-bold text-gray-900">
            Quick Actions
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Choose what you want to do next.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/register"
              className="rounded-lg bg-blue-700 p-5 text-white transition hover:bg-blue-800"
            >
              <h3 className="font-semibold">
                Register New Smartphone
              </h3>
              <p className="mt-2 text-sm text-blue-100">
                Create a new digital product passport.
              </p>
            </Link>

            <Link
              href="/verify"
              className="rounded-lg border border-gray-200 p-5 transition hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">
                Verify a Product
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Check a smartphone product passport.
              </p>
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-7">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Registrations
          </h2>

          {loading ? (
            <p className="mt-5 text-sm text-gray-500">
              Loading blockchain records...
            </p>
          ) : error ? (
            <p className="mt-5 text-sm text-red-600">{error}</p>
          ) : products.length === 0 ? (
            <p className="mt-5 text-sm text-gray-500">
              No product passports found.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {[...products].reverse().map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col justify-between gap-3 rounded-lg bg-slate-50 p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="text-xs font-semibold text-blue-700">
                      PASSPORT #{product.id}
                    </p>
                    <h3 className="mt-1 font-semibold text-gray-900">
                      {product.brand} {product.model}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.storage} · {product.color || "-"} · {product.condition}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {product.registrationDate}
                    </p>
                  </div>

                  <Link
                    href={`/verify?id=${product.id}`}
                    className="text-sm font-medium text-blue-700 hover:underline"
                  >
                    Verify Passport →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-gray-400">
          ProductProof © 2026. Connected to Ethereum Sepolia Testnet.
        </p>
      </div>
    </main>
  );
}
