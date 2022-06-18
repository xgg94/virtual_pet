// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; //safe math not needed

import "./IERC20.sol";

contract PetToken is IERC20 {

    string  private tokenName;
    string  private tokenSymbol;
    uint8   private tokenDecimals;
    address private owner;

    mapping(address => uint256) public balances;
    mapping(address => mapping (address => uint256)) allowed;

    uint256 totalSupply_ = 0;
    
    constructor() {
        tokenName = "Petcoin";
        tokenSymbol = "^_^";
        tokenDecimals = 0;
    }

    modifier isOwner() {
        require(owner == msg.sender, "Permission denied!");
        _;
    }

    function setTokenOwner() external returns (address newOwner) {
	    require(owner == address(0), "Owner already set!");
        owner = msg.sender;
        return owner;
    }

    function totalSupply() external view returns (uint256) {
	    return totalSupply_;
    }

    function name() external view returns (string memory) {
        return tokenName;
    }

    function symbol() external view returns (string memory) {
        return tokenSymbol;
    }

    function decimals() external view returns (uint8) {
        return tokenDecimals;
    }

    function balanceOf(address tokenOwner) external view returns (uint256) {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens) external returns (bool success){
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender] - numTokens;
        balances[receiver] = balances[receiver] + numTokens;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens) external returns (bool success) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
	}

    function allowance(address _owner, address _delegate) external view returns (uint) {
	    return allowed[_owner][_delegate];
	}

    function transferFrom(address _owner, address buyer, uint256 numTokens) external isOwner returns (bool) {
        require(numTokens <= balances[_owner], "Not enough Token!");
        balances[_owner] = balances[_owner]-numTokens;
        balances[buyer] = balances[buyer]+numTokens;
        emit Transfer(_owner, buyer, numTokens);
        return true;
	}

    function mintToken (address account, uint256 value) external isOwner returns (bool success){
      balances[account] += value;
      totalSupply_ = totalSupply_ + value; 
      return true;
   }

   function burnToken (address account, uint256 value) external isOwner returns (bool success){
      require(balances[account] >= value, "Not enough Token!");
      balances[account] -= value;
      totalSupply_ = totalSupply_ - value; 
      return true;
   }


}
