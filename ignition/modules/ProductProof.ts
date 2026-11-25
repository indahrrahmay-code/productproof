
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProductProofV2Module", (m) => {
  const productProof = m.contract("ProductProof");

  return { productProof };
});
