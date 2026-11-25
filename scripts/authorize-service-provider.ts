import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [signer] = await ethers.getSigners();

  const contractAddress =
    "0x70E5e20710b3508b454De814fD6407743bD91a2A";

  const abi = [
    "function owner() view returns (address)",
    "function authorizedProviders(address) view returns (bool)",
    "function authorizeServiceProvider(address provider, string providerName)",
  ];

  const contract = new ethers.Contract(
    contractAddress,
    abi,
    signer
  );

  const owner = await contract.owner();

  console.log("Wallet:", signer.address);
  console.log("Contract owner:", owner);

  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error("Wallet bukan owner kontrak.");
  }

  const authorized = await contract.authorizedProviders(signer.address);

  if (authorized) {
    console.log("Wallet sudah terotorisasi sebagai service provider.");
    return;
  }

  const tx = await contract.authorizeServiceProvider(
    signer.address,
    "ProductProof Service Center"
  );

  console.log("Transaction:", tx.hash);
  await tx.wait();

  console.log("Service provider berhasil diotorisasi!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
