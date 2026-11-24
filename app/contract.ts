
import { BrowserProvider, Contract } from "ethers";
import ProductProofABI from "./abi/ProductProof.json";
import {
  CONTRACT_ADDRESS,
  CONTRACT_CHAIN_ID,
} from "./contractConfig";

export async function getProductProofContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask belum terdeteksi.");
  }

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== BigInt(CONTRACT_CHAIN_ID)) {
    throw new Error("Silakan pilih jaringan Ethereum Sepolia.");
  }

  const signer = await provider.getSigner();

  return new Contract(
    CONTRACT_ADDRESS,
    ProductProofABI,
    signer
  );
}

export async function registerProduct(
  to: string,
  brand: string,
  model: string,
  storageCapacity: string,
  color: string,
  condition: string
) {
  const contract = await getProductProofContract();

  const transaction = await contract.registerProduct(
    to,
    brand,
    model,
    storageCapacity,
    color,
    condition
  );

  return await transaction.wait();
}

export async function getProduct(tokenId: number) {
  const contract = await getProductProofContract();

  return await contract.getProduct(tokenId);
}
