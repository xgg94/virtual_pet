// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; //safe math not needed

import "./IERC20.sol";
import "./PetToken.sol";
import "./VirtualPet.sol";

contract Trades {

    struct Trade { 
            address tradePartner;
            address pet;
            uint price;
    }

    address private owner;

    //store all trades
    mapping(address => Trade[]) public sellerTrades;
    mapping(address => Trade[]) public buyerTrades;


    constructor(){
        owner = msg.sender;
    }

    modifier isOwner() {
        require(owner == msg.sender, "permission denied!");
        _;
    }

    function getTradeRequests () external view returns(Trade[] memory) {
        return(buyerTrades[msg.sender]);
    }

    function pushNewSellerTrade (address _from, address _to, address _pet, uint _value) external isOwner {
        sellerTrades[_from].push(Trade(_to, _pet, _value));
    }
    function pushNewBuyerTrade (address _from, address _to, address _pet, uint _value) external isOwner {
        buyerTrades[_from].push(Trade(_to, _pet, _value));
    }

    function deleteSellerTrade (address _seller, address _buyer) external isOwner {
        //delete Seller Trade
        for (uint i = 0; i < sellerTrades[_seller].length; i++) {
            if (sellerTrades[_seller][i].tradePartner == _buyer) {
                sellerTrades[_seller][i] = sellerTrades[_seller][sellerTrades[_seller].length - 1];
                sellerTrades[_seller].pop();
                break;
            }
        }
    }

    function deleteBuyerTrade (address _seller, address _buyer) external isOwner {
        //delete Buyer Trade
        for (uint i = 0; i < buyerTrades[_buyer].length; i++) {
            if (buyerTrades[_buyer][i].tradePartner == _seller) {
                buyerTrades[_buyer][i] = buyerTrades[_buyer][buyerTrades[_buyer].length - 1];
                buyerTrades[_buyer].pop();
                break;
            }
        }
    }
    
}