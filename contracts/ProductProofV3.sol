
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductProofV3 is ERC721, ERC721URIStorage, Ownable {
    uint256 private nextTokenId;

    struct Product {
        string brand;
        string model;
        string storageCapacity;
        string color;
        string condition;
        uint256 registrationDate;
        bool exists;
    }

    struct ServiceRecord {
        string providerName;
        string serviceType;
        string description;
        uint256 serviceDate;
        address recordedBy;
    }

    struct ConditionRecord {
        string condition;
        string reason;
        uint256 updateDate;
        address updatedBy;
    }

    mapping(uint256 => Product) private products;
    mapping(uint256 => ServiceRecord[]) private serviceHistory;
    mapping(uint256 => ConditionRecord[]) private conditionHistory;

    mapping(address => bool) public authorizedRegistrars;
    mapping(address => bool) public authorizedProviders;
    mapping(address => string) public serviceProviderNames;

    // Fingerprint is an off-chain generated HMAC, not a raw IMEI.
    mapping(bytes32 => bool) private usedFingerprints;

    event RegistrarAuthorizationChanged(
        address indexed registrar,
        bool authorized
    );

    event ServiceProviderAuthorizationChanged(
        address indexed provider,
        bool authorized,
        string providerName
    );

    event ProductRegistered(
        uint256 indexed tokenId,
        string brand,
        string model,
        address indexed owner
    );

    event ServiceRecordAdded(
        uint256 indexed tokenId,
        address indexed provider,
        string providerName,
        string serviceType,
        uint256 serviceDate
    );

    event ProductConditionUpdated(
        uint256 indexed tokenId,
        string newCondition,
        address indexed updatedBy,
        uint256 updateDate
    );

    modifier onlyRegistrar() {
        require(
            authorizedRegistrars[msg.sender],
            "Not authorized registrar"
        );
        _;
    }

    constructor()
        ERC721("ProductProof Passport", "PPASS")
        Ownable(msg.sender)
    {
        authorizedRegistrars[msg.sender] = true;
    }

    function authorizeRegistrar(address registrar) external onlyOwner {
        require(registrar != address(0), "Invalid registrar");

        authorizedRegistrars[registrar] = true;

        emit RegistrarAuthorizationChanged(registrar, true);
    }

    function revokeRegistrar(address registrar) external onlyOwner {
        authorizedRegistrars[registrar] = false;

        emit RegistrarAuthorizationChanged(registrar, false);
    }

    function authorizeServiceProvider(
        address provider,
        string calldata providerName
    ) external onlyOwner {
        require(provider != address(0), "Invalid provider");
        require(bytes(providerName).length > 0, "Name required");

        authorizedProviders[provider] = true;
        serviceProviderNames[provider] = providerName;

        emit ServiceProviderAuthorizationChanged(
            provider,
            true,
            providerName
        );
    }

    function revokeServiceProvider(address provider) external onlyOwner {
        authorizedProviders[provider] = false;

        emit ServiceProviderAuthorizationChanged(
            provider,
            false,
            serviceProviderNames[provider]
        );
    }

    function registerProduct(
        address to,
        string calldata brand,
        string calldata model,
        string calldata storageCapacity,
        string calldata color,
        string calldata condition,
        bytes32 deviceFingerprint,
        string calldata metadataURI
    ) external onlyRegistrar returns (uint256) {
        require(to != address(0), "Invalid wallet address");
        require(bytes(brand).length > 0, "Brand required");
        require(bytes(model).length > 0, "Model required");
        require(bytes(condition).length > 0, "Condition required");
        require(deviceFingerprint != bytes32(0), "Fingerprint required");
        require(!usedFingerprints[deviceFingerprint], "Device already registered");
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        uint256 tokenId = nextTokenId++;

        products[tokenId] = Product({
            brand: brand,
            model: model,
            storageCapacity: storageCapacity,
            color: color,
            condition: condition,
            registrationDate: block.timestamp,
            exists: true
        });

        usedFingerprints[deviceFingerprint] = true;

        conditionHistory[tokenId].push(
            ConditionRecord({
                condition: condition,
                reason: "Initial registration",
                updateDate: block.timestamp,
                updatedBy: msg.sender
            })
        );

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit ProductRegistered(tokenId, brand, model, to);

        return tokenId;
    }

    function getProduct(
        uint256 tokenId
    ) external view returns (Product memory) {
        require(products[tokenId].exists, "Product not found");
        return products[tokenId];
    }

    function isFingerprintRegistered(
        bytes32 deviceFingerprint
    ) external view returns (bool) {
        return usedFingerprints[deviceFingerprint];
    }

    function addServiceRecord(
        uint256 tokenId,
        string calldata serviceType,
        string calldata description
    ) external {
        require(authorizedProviders[msg.sender], "Not authorized provider");
        require(products[tokenId].exists, "Product not found");
        require(bytes(serviceType).length > 0, "Service type required");

        string memory providerName = serviceProviderNames[msg.sender];

        serviceHistory[tokenId].push(
            ServiceRecord({
                providerName: providerName,
                serviceType: serviceType,
                description: description,
                serviceDate: block.timestamp,
                recordedBy: msg.sender
            })
        );

        emit ServiceRecordAdded(
            tokenId,
            msg.sender,
            providerName,
            serviceType,
            block.timestamp
        );
    }

    function getServiceHistory(
        uint256 tokenId
    ) external view returns (ServiceRecord[] memory) {
        require(products[tokenId].exists, "Product not found");
        return serviceHistory[tokenId];
    }

    function updateProductCondition(
        uint256 tokenId,
        string calldata newCondition,
        string calldata reason
    ) external onlyRegistrar {
        require(products[tokenId].exists, "Product not found");
        require(bytes(newCondition).length > 0, "Condition required");

        products[tokenId].condition = newCondition;

        conditionHistory[tokenId].push(
            ConditionRecord({
                condition: newCondition,
                reason: reason,
                updateDate: block.timestamp,
                updatedBy: msg.sender
            })
        );

        emit ProductConditionUpdated(
            tokenId,
            newCondition,
            msg.sender,
            block.timestamp
        );
    }

    function getConditionHistory(
        uint256 tokenId
    ) external view returns (ConditionRecord[] memory) {
        require(products[tokenId].exists, "Product not found");
        return conditionHistory[tokenId];
    }

    function tokenURI(
    uint256 tokenId
)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
{
    return super.tokenURI(tokenId);
}

function supportsInterface(
    bytes4 interfaceId
)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (bool)
{
    return super.supportsInterface(interfaceId);
}

}