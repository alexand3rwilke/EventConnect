//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IEventConnect} from "./IEventConnect.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title EventConnect
/// @dev This contract is used to save the groups fingerprints.
contract EventConnect is IEventConnect, Ownable {
    /// @dev See {IEventConnect-groups}.
    mapping(uint256 => uint256) public override groups;

    mapping(uint256 => mapping(uint256 => uint256))
        public fingerprintCreationDates;

    /// @dev See {IEventConnect-fingerprintDuration}.
    mapping(uint256 => uint256) public override fingerprintDuration;

    /// @dev See {IEventConnect-updateGroups}.
    function updateGroups(
        Group[] calldata _groups
    ) external override {
        for (uint256 i = 0; i < _groups.length; ) {
            groups[_groups[i].id] = _groups[i].fingerprint;

            fingerprintCreationDates[_groups[i].id][
                _groups[i].fingerprint
            ] = block.timestamp;

            emit GroupUpdated(_groups[i].id, _groups[i].fingerprint);

            unchecked {
                ++i;
            }
        }
    }

    /// @dev See {IEventConnect-getFingerprintCreationDate}.
    function getFingerprintCreationDate(
        uint256 groupId,
        uint256 fingerprint
    ) external view override returns (uint256) {
        return fingerprintCreationDates[groupId][fingerprint];
    }

    /// @dev See {IEventConnect-updateFingerprintDuration}.
    function updateFingerprintDuration(
        uint256 groupId,
        uint256 durationSeconds
    ) external override {
        fingerprintDuration[groupId] = durationSeconds;
    }
}
