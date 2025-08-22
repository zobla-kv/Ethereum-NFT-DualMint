// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "../interfaces/NFT.sol";

contract DualMint is NFT {
    address public owner;

    mapping(address => uint256) private _collection;

    event Minted(address _owner, uint256 _amount);

    function mint() external returns (uint256) {
        // mint new token
    }

    function balanceOf(address _owner) external view returns (uint256) {}
    function ownerOf(uint256 _tokenId) external view returns (address) {}
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes calldata data
    ) external payable {}
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable {}
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable {}
    function approve(address _approved, uint256 _tokenId) external payable {}
    function setApprovalForAll(address _operator, bool _approved) external {}
    function getApproved(uint256 _tokenId) external view returns (address) {}
    function isApprovedForAll(
        address _owner,
        address _operator
    ) external view returns (bool) {}
}
