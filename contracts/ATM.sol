// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; //safe math not needed

import "./IERC20.sol";
import "./PetToken.sol";
import "./VirtualPet.sol";
import "./PetFactory.sol";
import "./Trades.sol";

contract ATM {
	
    IERC20 public token;
    Trades public trades;
    PetFactory public petFactory;

    address private owner;

    //100 token = 1 ether
    uint public constant TOKEN_PRICE_BUY = 100;
    uint public constant TOKEN_PRICE_SELL = 100;
    //1/10 ether minimum
    uint public constant TOKEN_DECIMAL = 10;
    uint public constant ETHER = 1000000000000000000;
    uint public constant BASIC_PET_PRICE = 10;

    enum TradeState{NONE, REQUEST, DONE}

    struct Trade { 
        address tradePartner;
        address pet;
        uint price;
    }
    //USER - PET ARRAY
    mapping(address => address[]) public pets;
    mapping(address => mapping (address => bool)) private petOfUser;
    //PET - Bool
    mapping(address => bool) private petTradeLock;

    //TO - FROM (Buyer - Seller) to avoid multiple offers
    mapping(address =>  mapping(address => bool)) private activeTrade;
    
    mapping(address => mapping (address => mapping (address => mapping (uint => TradeState)))) private petTrade;

    event Bought(uint256 amount);
    event PetCreated(address user);
    event Sold(uint256 amount);
    event Burned(uint256 amount);
    event TradeRequest(address from, address to, address pet, uint value);
    event TradeFinished(address from, address to);
    event TradeDeclined(address from, address to, address pet, uint value);

    constructor(address _token, address _petFactory) {
        trades = new Trades();
        token = PetToken(_token);
        token.setTokenOwner();
        petFactory = PetFactory(_petFactory);
        petFactory.setPetFactoryOwner();
    }

    function setATMOwner(address test) public {
        require(owner == address(0), "Owner already set!");
	    owner = test;
    }

    function getOwner () external view returns(address) {
        return(owner);
    }

    function getTradeContract () external view returns(address) {
        return(address(trades));
    }

    function buyToken() payable public {
        uint256 amountToBuy = msg.value;
        //can spend 1/10 ether
        require(amountToBuy % (ETHER/TOKEN_DECIMAL) == 0, "No Division!");
	    require(amountToBuy > 0, "You need to send some ether");
	    token.mintToken(msg.sender, TOKEN_PRICE_BUY*amountToBuy/ETHER);
	    emit Bought(TOKEN_PRICE_BUY*amountToBuy/ETHER);
    }

    function sellToken (uint256 amount) public {
        require(amount > 0, "You need to send some ether");
        require(amount % TOKEN_DECIMAL == 0, "No Division!");
	    token.burnToken(msg.sender, amount);
	    payable(msg.sender).transfer(amount*ETHER/TOKEN_PRICE_SELL);
	    emit Sold(amount/TOKEN_PRICE_SELL*ETHER);
    }

    function burnToken (uint256 amount, address user) public {
        require(amount > 0, "You need to send some ether");
        require((amount/TOKEN_PRICE_SELL*ETHER) % (ETHER/TOKEN_DECIMAL) == 0, "No Division!");

        //called from ATM or pet owner
        if(msg.sender == address(this) || petOfUser[user][msg.sender] == true || user == msg.sender){
            token.burnToken(user, amount);
            emit Burned(amount);
        }
        else{
            revert("You don't have access to burn tokens of user!");
        }
    }

    function getTokenAmount () external view returns(uint256) {
        return(token.balanceOf(msg.sender));
    }

    function buyPet(string memory _petName, uint _race) external {
        require(token.balanceOf(msg.sender) >= BASIC_PET_PRICE, "You don't have enough token!");
        token.burnToken(msg.sender, BASIC_PET_PRICE);
        address petAddress;
        petAddress = petFactory.createPet(msg.sender, string(_petName), _race);
        pets[msg.sender].push(petAddress);
        petOfUser[msg.sender][petAddress] = true;
    }

    function updatePet(address _pet) external {
        VirtualPet(_pet).update();
    }

    function getPetLevel(address  _pet) external view returns(uint) {
        require(petOfUser[msg.sender][address(_pet)] == true);
        return VirtualPet(_pet).petLevel();
    }

    function getAllPets() external view returns(address[] memory) {
        return pets[msg.sender];
    }

    function removePet (address _pet) external {
        require(petOfUser[msg.sender][address(_pet)] == true, "You don't own this pet!");
        if(VirtualPet(_pet).getPetStatus() == false){
            petOfUser[msg.sender][address(_pet)] = false;
            this.deletePet(msg.sender, _pet);
        }
    }

    function sellPet(address _pet, address _to, uint _value) external {
        require(petOfUser[msg.sender][address(_pet)] == true, "You don't own this pet!");
        require(activeTrade[_to][msg.sender] == false, "You already have an active trade with user!");
        require(petTradeLock[_pet] == false, "You already have an active trade request with pet!");
        VirtualPet(_pet).update();
        if(VirtualPet(_pet).getPetStatus() == false){
            revert("Don't trade dead pets!");
        }
        activeTrade[_to][msg.sender] = true;
        petTradeLock[_pet] = true;
        trades.pushNewSellerTrade(msg.sender, _to, _pet, _value);
        trades.pushNewBuyerTrade(_to, msg.sender, _pet, _value);

        petTrade[msg.sender][_to][_pet][_value] = TradeState.REQUEST;
        emit TradeRequest(msg.sender, _to, _pet, _value);
    }

    function acceptPetTrade (address _pet, address _seller, uint _value) external returns(bool) {
        require(token.balanceOf(msg.sender) >= _value, "You don't have enough token!");
        require(petTrade[_seller][msg.sender][_pet][_value] == TradeState.REQUEST, "Trade doesn't exist or in wrong state!");
        VirtualPet(_pet).update();
        if(VirtualPet(_pet).getPetStatus() == false){
            revert("Don't trade dead pets!");
        }
        token.transferFrom(msg.sender, _seller, _value);
        petTrade[_seller][msg.sender][_pet][_value] = TradeState.DONE;
        activeTrade[msg.sender][_seller] = false;
        petTradeLock[_pet] = false;

        address newOwner = VirtualPet(_pet).changeOwner(msg.sender);

        this.deletePet(_seller, _pet);

        trades.deleteSellerTrade(_seller, msg.sender);

        trades.deleteBuyerTrade(_seller, msg.sender);

        //set new pet owner
        petOfUser[_seller][_pet] = false;
        pets[msg.sender].push(_pet);
        petOfUser[msg.sender][_pet] = true;
        if(newOwner == msg.sender){
            emit TradeFinished(_seller, msg.sender);
        }
        return true;
    }

    function declinePetTrade (address _pet, address _seller, uint _value) external {
        require(petTrade[_seller][msg.sender][_pet][_value] == TradeState.REQUEST, "Trade doesn't exist or in wrong state!");
        require(activeTrade[msg.sender][_seller] == true, "No active trade found!");
        petTrade[_seller][msg.sender][_pet][_value] = TradeState.DONE;
        activeTrade[msg.sender][_seller] = false;
        petTradeLock[_pet] = false;
        
        trades.deleteSellerTrade(_seller, msg.sender);

        trades.deleteBuyerTrade(_seller, msg.sender);

        emit TradeDeclined(_seller, msg.sender, _pet, _value);
    }

    function payout() external {
        require(msg.sender == owner);
        //require(_amount <= address(this).balance);
        payable(owner).transfer(address(this).balance);
    }

    function deletePet(address _user, address _pet) external {
        require(msg.sender == address(this), "access denied!");
        for (uint i = 0; i < pets[_user].length; i++) {
            if (pets[_user][i] == _pet) {
                pets[_user][i] = pets[_user][pets[_user].length - 1];
                pets[_user].pop();
                break;
            }
        }
    }
}
