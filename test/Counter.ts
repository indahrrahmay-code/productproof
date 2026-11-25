
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("ProductProof", function () {
  async function deployProductProof() {
    const [owner, buyer, otherAccount] = await ethers.getSigners();

    const productProof = await ethers.deployContract("ProductProof");

    return { productProof, owner, buyer, otherAccount };
  }

  it("Should deploy with the correct NFT name and symbol", async function () {
    const { productProof } = await deployProductProof();

    expect(await productProof.name()).to.equal("ProductProof Passport");
    expect(await productProof.symbol()).to.equal("PPASS");
  });

  it("Should register a smartphone as an NFT", async function () {
    const { productProof, buyer } = await deployProductProof();

    await expect(
      productProof.registerProduct(
        buyer.address,
        "Apple",
        "iPhone 13",
        "128GB",
        "Midnight",
        "Good"
      )
    )
      .to.emit(productProof, "ProductRegistered")
      .withArgs(BigInt(0), "Apple", "iPhone 13", buyer.address);

    expect(await productProof.ownerOf(BigInt(0))).to.equal(buyer.address);

    const product = await productProof.getProduct(BigInt(0));

    expect(product.brand).to.equal("Apple");
    expect(product.model).to.equal("iPhone 13");
    expect(product.storageCapacity).to.equal("128GB");
    expect(product.color).to.equal("Midnight");
    expect(product.condition).to.equal("Good");
  });

  it("Should prevent non-owners from registering products", async function () {
    const { productProof, buyer, otherAccount } =
      await deployProductProof();

    await expect(
      productProof.connect(otherAccount).registerProduct(
        buyer.address,
        "Samsung",
        "Galaxy S24",
        "256GB",
        "Black",
        "Good"
      )
    ).to.be.revertedWithCustomError(
      productProof,
      "OwnableUnauthorizedAccount"
    );
  });
});
