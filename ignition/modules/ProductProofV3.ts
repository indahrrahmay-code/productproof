
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProductProofV3Module", (m) => {
  const productProofV3 = m.contract("ProductProofV3");

  return { productProofV3 };
});
