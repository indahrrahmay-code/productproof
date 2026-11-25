
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductProof is ERC721, Ownable {
    uint256 private _nextTokenId;

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

    mapping(uint256 => Product) private products;
    mapping(uint256 => ServiceRecord[]) private serviceHistory;
    mapping(address => bool) public authorizedProviders;

    event ProductRegistered(
        uint256 indexed tokenId,
        string brand,
        string model,
        address indexed owner
    );

    event ServiceProviderAuthorized(
        address indexed provider,
        bool authorized
    );

    event ServiceRecordAdded(
        uint256 indexed tokenId,
        address indexed provider,
        string serviceType,
        uint256 serviceDate
    );

    constructor()
        ERC721("ProductProof Passport", "PPASS")
        Ownable(msg.sender)
    {
        authorizedProviders[msg.sender] = true;
    }

    function registerProduct(
        address to,
        string memory brand,
        string memory model,
        string memory storageCapacity,
        string memory color,
        string memory condition
    ) public onlyOwner {
        require(to != address(0), "Invalid wallet address");
        require(bytes(brand).length > 0, "Brand is required");
        require(bytes(model).length > 0, "Model is required");

        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);

        products[tokenId] = Product({
            brand: brand,
            model: model,
            storageCapacity: storageCapacity,
            color: color,
            condition: condition,
            registrationDate: block.timestamp,
            exists: true
        });

        emit ProductRegistered(tokenId, brand, model, to);
    }

    function getProduct(uint256 tokenId)
        public
        view
        returns (Product memory)
    {
        require(products[tokenId].exists, "Product not found");
        return products[tokenId];
    }

    function authorizeServiceProvider(address provider)
        public
        onlyOwner
    {
        require(provider != address(0), "Invalid provider address");

        authorizedProviders[provider] = true;

        emit ServiceProviderAuthorized(provider, true);
    }

    function revokeServiceProvider(address provider)
        public
        onlyOwner
    {
        authorizedProviders[provider] = false;

        emit ServiceProviderAuthorized(provider, false);
    }

    function addServiceRecord(
        uint256 tokenId,
        string memory providerName,
        string memory serviceType,
        string memory description
    ) public {
        require(authorizedProviders[msg.sender], "Not authorized provider");
        require(products[tokenId].exists, "Product not found");
        require(bytes(providerName).length > 0, "Provider name required");
        require(bytes(serviceType).length > 0, "Service type required");

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
            serviceType,
            block.timestamp
        );
    }

    function getServiceHistory(uint256 tokenId)
        public
        view
        returns (ServiceRecord[] memory)
    {
        require(products[tokenId].exists, "Product not found");

        return serviceHistory[tokenId];
    }
}
