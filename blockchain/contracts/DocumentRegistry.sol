// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentRegistry {
    struct DocumentVersion {
        string docId;
        string fileHash;
        string merkleRoot;
        uint256 versionNumber;
        address issuer;
        uint256 timestamp;
        bool isRevoked;
    }

    struct RevocationDetails {
        string docId;
        string reason;
        address revokedBy;
        uint256 revokedAt;
        bool isRevoked;
    }

    mapping(string => DocumentVersion[]) private documentVersions;
    mapping(string => RevocationDetails) private revocations;
    mapping(string => mapping(uint256 => RevocationDetails)) private versionRevocations;
    mapping(string => uint256) private latestVersionNumbers;
    mapping(string => bool) private revokedDocuments;

    event DocumentVersionRegistered(
        string docId,
        string fileHash,
        string merkleRoot,
        uint256 versionNumber,
        address indexed issuer,
        uint256 timestamp
    );

    event DocumentRevoked(
        string docId,
        string reason,
        address indexed revokedBy,
        uint256 revokedAt
    );

    event DocumentVersionRevoked(
        string docId,
        uint256 versionNumber,
        string reason,
        address indexed revokedBy,
        uint256 revokedAt
    );

    function registerDocumentVersion(
        string memory docId,
        string memory fileHash,
        string memory merkleRoot,
        uint256 versionNumber
    ) external {
        require(bytes(docId).length > 0, "docId is required");
        require(bytes(fileHash).length > 0, "fileHash is required");
        require(bytes(merkleRoot).length > 0, "merkleRoot is required");
        require(versionNumber > 0, "versionNumber must be greater than zero");
        require(!revokedDocuments[docId], "Document is revoked");

        uint256 expectedVersionNumber = latestVersionNumbers[docId] + 1;
        require(versionNumber == expectedVersionNumber, "Invalid version number");

        documentVersions[docId].push(
            DocumentVersion({
                docId: docId,
                fileHash: fileHash,
                merkleRoot: merkleRoot,
                versionNumber: versionNumber,
                issuer: msg.sender,
                timestamp: block.timestamp,
                isRevoked: false
            })
        );

        latestVersionNumbers[docId] = versionNumber;

        emit DocumentVersionRegistered(
            docId,
            fileHash,
            merkleRoot,
            versionNumber,
            msg.sender,
            block.timestamp
        );
    }

    function getTotalVersions(string memory docId) external view returns (uint256) {
        return documentVersions[docId].length;
    }

    function getLatestVersionNumber(string memory docId) external view returns (uint256) {
        return latestVersionNumbers[docId];
    }

    function getVersionDetails(
        string memory docId,
        uint256 versionNumber
    )
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            address,
            uint256,
            bool
        )
    {
        require(versionNumber > 0, "versionNumber must be greater than zero");
        require(versionNumber <= documentVersions[docId].length, "Version not found");

        DocumentVersion memory documentVersion = documentVersions[docId][versionNumber - 1];

        return (
            documentVersion.docId,
            documentVersion.fileHash,
            documentVersion.merkleRoot,
            documentVersion.versionNumber,
            documentVersion.issuer,
            documentVersion.timestamp,
            documentVersion.isRevoked
        );
    }

    function revokeDocument(string memory docId, string memory reason) external {
        require(bytes(docId).length > 0, "docId is required");
        require(bytes(reason).length > 0, "reason is required");
        require(documentVersions[docId].length > 0, "Document not registered");
        require(!revokedDocuments[docId], "Document already revoked");

        revokedDocuments[docId] = true;
        revocations[docId] = RevocationDetails({
            docId: docId,
            reason: reason,
            revokedBy: msg.sender,
            revokedAt: block.timestamp,
            isRevoked: true
        });

        for (uint256 i = 0; i < documentVersions[docId].length; i++) {
            documentVersions[docId][i].isRevoked = true;
        }

        emit DocumentRevoked(docId, reason, msg.sender, block.timestamp);
    }

    function revokeDocumentVersion(string memory docId, uint256 versionNumber, string memory reason) external {
        require(bytes(docId).length > 0, "docId is required");
        require(bytes(reason).length > 0, "reason is required");
        require(versionNumber > 0, "versionNumber must be greater than zero");
        require(versionNumber <= documentVersions[docId].length, "Version not found");
        require(!documentVersions[docId][versionNumber - 1].isRevoked, "Version already revoked");

        documentVersions[docId][versionNumber - 1].isRevoked = true;
        
        versionRevocations[docId][versionNumber] = RevocationDetails({
            docId: docId,
            reason: reason,
            revokedBy: msg.sender,
            revokedAt: block.timestamp,
            isRevoked: true
        });

        emit DocumentVersionRevoked(docId, versionNumber, reason, msg.sender, block.timestamp);
    }

    function getRevocationDetails(
        string memory docId
    )
        external
        view
        returns (
            string memory,
            string memory,
            address,
            uint256,
            bool
        )
    {
        RevocationDetails memory details = revocations[docId];

        return (
            details.docId,
            details.reason,
            details.revokedBy,
            details.revokedAt,
            details.isRevoked
        );
    }

    function isDocumentRevoked(string memory docId) external view returns (bool) {
        return revokedDocuments[docId];
    }

    function getVersionRevocationDetails(
        string memory docId,
        uint256 versionNumber
    )
        external
        view
        returns (
            string memory,
            string memory,
            address,
            uint256,
            bool
        )
    {
        RevocationDetails memory details = versionRevocations[docId][versionNumber];

        return (
            details.docId,
            details.reason,
            details.revokedBy,
            details.revokedAt,
            details.isRevoked
        );
    }

    function verifyDocument(
        string memory docId,
        string memory fileHash
    )
        external
        view
        returns (
            bool,
            uint256,
            bool,
            string memory
        )
    {
        bool globallyRevoked = revokedDocuments[docId];

        for (uint256 i = 0; i < documentVersions[docId].length; i++) {
            bool hashMatches =
                keccak256(bytes(documentVersions[docId][i].fileHash)) ==
                keccak256(bytes(fileHash));

            if (hashMatches) {
                bool isVersionRevoked = globallyRevoked || documentVersions[docId][i].isRevoked;
                string memory revocationReason = "";
                
                if (isVersionRevoked) {
                    if (documentVersions[docId][i].isRevoked && versionRevocations[docId][documentVersions[docId][i].versionNumber].isRevoked) {
                        revocationReason = versionRevocations[docId][documentVersions[docId][i].versionNumber].reason;
                    } else if (globallyRevoked) {
                        revocationReason = revocations[docId].reason;
                    }
                }

                return (
                    true,
                    documentVersions[docId][i].versionNumber,
                    isVersionRevoked,
                    revocationReason
                );
            }
        }

        string memory globalRevocationReason = globallyRevoked ? revocations[docId].reason : "";
        return (false, 0, globallyRevoked, globalRevocationReason);
    }
}
