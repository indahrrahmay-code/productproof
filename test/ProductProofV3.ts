
import { expect } from "chai";
import { network } from "hardhat";

describe("ProductProofV3", function () {
  async function deployFixture() {
    const { ethers } = await network.connect();
    const [owner, registrar, provider, buyer, stranger] =
      await ethers.getSigners();

    const factory = await ethers.getContractFactory("ProductProofV3");
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    return {
      contract,
      owner,
      registrar,
      provider,
      buyer,
      stranger,
    };
  }

  const fingerprint = ethersZeroHash();

  function ethersZeroHash() {
    return "0x" + "11".repeat(32);
  }

  async function registerSample(contract: any, owner: any, buyer: any) {
    await contract.connect(owner).registerProduct(
      buyer.address,
      "Apple",
      "iPhone 13",
      "128 GB",
      "Midnight",
      "Good",
      fingerprint,
      "ipfs://productproof-test-metadata"
    );
  }

  it("allows the owner to authorize a registrar", async function () {
    const { contract, owner, registrar } = await deployFixture();

    await contract.connect(owner).authorizeRegistrar(registrar.address);

    expect(await contract.authorizedRegistrars(registrar.address)).to.equal(true);
  });

  it("rejects product registration by an unauthorized wallet", async function () {
    const { contract, stranger, buyer } = await deployFixture();

    await expect(
      contract.connect(stranger).registerProduct(
        buyer.address,
        "Apple",
        "iPhone 13",
        "128 GB",
        "Midnight",
        "Good",
        fingerprint,
        "ipfs://productproof-test-metadata"
      )
    ).to.be.revertedWith("Not authorized registrar");
  });

  it("allows an authorized registrar to register a product", async function () {
    const { contract, owner, buyer } = await deployFixture();

    await registerSample(contract, owner, buyer);

    const product = await contract.getProduct(0);

    expect(product.brand).to.equal("Apple");
    expect(product.model).to.equal("iPhone 13");
    expect(await contract.ownerOf(0)).to.equal(buyer.address);
  });

  it("prevents registering the same device fingerprint twice", async function () {
    const { contract, owner, buyer } = await deployFixture();

    await registerSample(contract, owner, buyer);

    await expect(
      registerSample(contract, owner, buyer)
    ).to.be.revertedWith("Device already registered");
  });

  it("records the authorized provider name automatically", async function () {
    const { contract, owner, provider, buyer } = await deployFixture();

    await registerSample(contract, owner, buyer);

    await contract.connect(owner).authorizeServiceProvider(
      provider.address,
      "PhoneFix Bandung"
    );

    await contract.connect(provider).addServiceRecord(
      0,
      "Battery Replacement",
      "Battery replaced and tested"
    );

    const history = await contract.getServiceHistory(0);

    expect(history[0].providerName).to.equal("PhoneFix Bandung");
    expect(history[0].recordedBy).to.equal(provider.address);
  });

  it("allows an authorized registrar to update product condition", async function () {
    const { contract, owner, buyer } = await deployFixture();

    await registerSample(contract, owner, buyer);

    await contract.connect(owner).updateProductCondition(
      0,
      "Fair",
      "Visible scratches found during inspection"
    );

    const product = await contract.getProduct(0);
    const history = await contract.getConditionHistory(0);

    expect(product.condition).to.equal("Fair");
    expect(history.length).to.equal(2);
    expect(history[1].reason).to.equal(
      "Visible scratches found during inspection"
    );
  });

  it("stores and returns the NFT metadata URI", async function () {
    const { contract, owner, buyer } = await deployFixture();

    await registerSample(contract, owner, buyer);

    expect(await contract.tokenURI(0)).to.equal(
      "ipfs://productproof-test-metadata"
    );
  });
});
