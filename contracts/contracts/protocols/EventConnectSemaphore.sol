//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IEventConnectSemaphore} from "./IEventConnectSemaphore.sol";
import {IEventConnect} from "../IEventConnect.sol";
import {ISemaphoreVerifier} from "@semaphore-protocol/contracts/interfaces/ISemaphoreVerifier.sol";

/// @title EventConnect
/// @dev This contract is used to verify Semaphore proofs.
contract EventConnectSemaphore is IEventConnectSemaphore {
    ISemaphoreVerifier public verifier;
    IEventConnect public eventConnect;

    /// @dev Gets a group id and a nullifier hash and returns true if it has already been used.
    mapping(uint256 => mapping(uint256 => bool)) internal nullifierHashes;

    /// @dev Initializes the Semaphore verifier used to verify the user's ZK proofs.
    /// @param _verifier: Semaphore verifier address.
    /// @param _eventConnect: Bandada address.
    constructor(ISemaphoreVerifier _verifier, IEventConnect _eventConnect) {
        verifier = _verifier;
        eventConnect = _eventConnect;
    }

    /// @dev See {IEventConnect-verifyProof}.
    function verifyProof(
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 merkleTreeDepth,
        uint256 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    ) external override {
        uint256 currentMerkleTreeRoot = eventConnect.groups(groupId);

        // A proof could have used an old Merkle tree root.
        // https://github.com/semaphore-protocol/semaphore/issues/98
        if (merkleTreeRoot != currentMerkleTreeRoot) {
            uint256 merkleRootCreationDate = eventConnect.getFingerprintCreationDate(
                groupId,
                merkleTreeRoot
            );
            uint256 merkleTreeDuration = eventConnect.fingerprintDuration(groupId);

            if (merkleRootCreationDate == 0) {
                revert EventConnect__MerkleTreeRootIsNotPartOfTheGroup();
            }

            if (block.timestamp > merkleRootCreationDate + merkleTreeDuration) {
                revert EventConnect__MerkleTreeRootIsExpired();
            }
        }

        if (nullifierHashes[groupId][nullifierHash]) {
            revert EventConnect__YouAreUsingTheSameNullifierTwice();
        }

        verifier.verifyProof(
            merkleTreeRoot,
            nullifierHash,
            signal,
            externalNullifier,
            proof,
            merkleTreeDepth
        );

        nullifierHashes[groupId][nullifierHash] = true;

        emit ProofVerified(
            groupId,
            merkleTreeRoot,
            nullifierHash,
            externalNullifier,
            signal
        );
    }
}
