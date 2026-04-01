// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IEmberToken { function mint(address to, uint256 amount) external; }

contract RewardDistributor is AccessControl, Pausable {
    using ECDSA for bytes32;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    IEmberToken public immutable token;
    address public signer;
    mapping(bytes32 => bool) public usedClaims;

    event Claimed(address indexed user, uint256 amount, bytes32 indexed claimId, uint256 dayIndex);

    constructor(address token_, address admin, address signer_) {
        token = IEmberToken(token_);
        signer = signer_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
    }

    function setSigner(address signer_) external onlyRole(OPERATOR_ROLE) { signer = signer_; }

    function claim(uint256 amount, uint256 dayIndex, bytes32 claimId, bytes calldata sig) external whenNotPaused {
        require(!usedClaims[claimId], "claim-used");
        bytes32 digest = keccak256(abi.encodePacked(msg.sender, amount, dayIndex, claimId, address(this))).toEthSignedMessageHash();
        require(digest.recover(sig) == signer, "bad-signature");
        usedClaims[claimId] = true;
        token.mint(msg.sender, amount);
        emit Claimed(msg.sender, amount, claimId, dayIndex);
    }

    function pause() external onlyRole(OPERATOR_ROLE) { _pause(); }
    function unpause() external onlyRole(OPERATOR_ROLE) { _unpause(); }
}
