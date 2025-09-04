// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import '../interfaces/IERC721.sol';
import '../interfaces/IERC721Receiver.sol';

contract DualMintNFT is IERC721 {
  uint256 private _tokenCounter = 1;

  mapping(uint256 => address) private _owners;
  mapping(address => uint256) private _balances;
  mapping(uint256 => string) private _tokenURIs;
  mapping(uint256 => address) private _tokenApprovals;
  mapping(address => mapping(address => bool)) private _operatorApprovals;

  // --- Core ---
  function mint(string calldata tokenUri) external returns (uint256) {
    require(bytes(tokenUri).length > 0, 'Token URI cannot be empty');

    uint256 tokenId = _tokenCounter;

    _owners[tokenId] = msg.sender;
    _tokenURIs[tokenId] = tokenUri;
    _balances[msg.sender] = _balances[msg.sender] + 1;

    emit Transfer(address(0), msg.sender, tokenId);

    _tokenCounter += 1;

    return tokenId;
  }

  function balanceOf(address owner) external view returns (uint256) {
    require(owner != address(0), "Can't get balance of zero address");

    return _balances[owner];
  }

  function ownerOf(uint256 tokenId) external view returns (address) {
    address owner = _owners[tokenId];

    require(owner != address(0), 'Invalid token ID');

    return owner;
  }

  function tokenURI(uint256 tokenId) external view returns (string memory) {
    require(_owners[tokenId] != address(0), 'Invalid token ID');
    return _tokenURIs[tokenId];
  }

  function transferFrom(address from, address to, uint256 tokenId) external {
    _transfer(from, to, tokenId);
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId
  ) external {
    _safeTransfer(from, to, tokenId, '');
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes calldata data
  ) external {
    _safeTransfer(from, to, tokenId, data);
  }

  function approve(address to, uint256 tokenId) external payable {
    address owner = _owners[tokenId];

    require(owner == msg.sender, 'Caller is not the owner');

    _tokenApprovals[tokenId] = to;

    emit Approval(owner, to, tokenId);
  }

  function setApprovalForAll(address operator, bool isApproved) external {
    require(operator != msg.sender, "Can't approve the caller");

    _operatorApprovals[msg.sender][operator] = isApproved;

    emit ApprovalForAll(msg.sender, operator, isApproved);
  }

  function getApproved(uint256 tokenId) external view returns (address) {
    require(_owners[tokenId] != address(0), 'Invalid Token ID');

    return _tokenApprovals[tokenId];
  }

  function isApprovedForAll(
    address owner,
    address operator
  ) external view returns (bool) {
    return _operatorApprovals[owner][operator];
  }

  // -- Helpers --
  function _isApprovedOrOwner(
    address sender,
    uint256 tokenId
  ) internal view returns (bool) {
    address owner = _owners[tokenId];

    return (sender == owner ||
      _tokenApprovals[tokenId] == sender ||
      _operatorApprovals[owner][sender]);
  }

  function _checkOnERC721Received(
    address operator,
    address from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) private returns (bool) {
    try
      IERC721Receiver(to).onERC721Received(operator, from, tokenId, data)
    returns (bytes4 retval) {
      return retval == IERC721Receiver.onERC721Received.selector;
    } catch {
      return false;
    }
  }

  function _transfer(address from, address to, uint256 tokenId) internal {
    require(_owners[tokenId] != to, "Can't send token to yourself");
    require(to != address(0), 'Transfer to zero address');
    require(
      _isApprovedOrOwner(msg.sender, tokenId),
      'Caller is not the owner or approved to send a token '
    );

    _balances[from] -= 1;
    _balances[to] += 1;
    _owners[tokenId] = to;

    emit Transfer(from, to, tokenId);
  }

  function _safeTransfer(
    address from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) internal {
    _transfer(from, to, tokenId);

    if (to.code.length > 0) {
      require(
        _checkOnERC721Received(address(this), from, to, tokenId, data),
        'Receiver is not able to handle the token'
      );
    }
  }
}
