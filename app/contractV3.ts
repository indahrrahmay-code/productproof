
import { BrowserProvider, Contract, type InterfaceAbi } from "ethers";
import ProductProofV3ABI from "./abi/ProductProofV3.json";
import { CONTRACT_V3_ADDRESS, CONTRACT_CHAIN_ID } from "./contractConfig";

export async function getProductProofV3Contract() {
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
    CONTRACT_V3_ADDRESS,
    ProductProofV3ABI.abi as InterfaceAbi,
    signer
  );
}

export async function registerProductV3(
  to: string,
  brand: string,
  model: string,
  storageCapacity: string,
  color: string,
  condition: string,
  deviceFingerprint: string,
  metadataURI: string
) {
  const contract = await getProductProofV3Contract();

  const transaction = await contract.registerProduct(
    to,
    brand,
    model,
    storageCapacity,
    color,
    condition,
    deviceFingerprint,
    metadataURI
  );

  return await transaction.wait();
}
