// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VirtualPet.sol";

contract PetFactory {

    address private owner;

    modifier isOwner() {
        require(owner == msg.sender, "Permission denied!");
        _;
    }

    function setPetFactoryOwner() external returns (address newOwner) {
	    require(owner == address(0), "Owner already set!");
        owner = msg.sender;
        return owner;
    }

    function createPet (address _owner, string memory _petName, uint _race) public isOwner returns (address petAddress) {
        VirtualPet pet;
        if(_race == 1){
            pet = new PetRat(_owner, string(_petName), msg.sender);
        }
        else if(_race == 2){
            pet = new PetDog(_owner, string(_petName), msg.sender);
        }
        else if(_race == 3){
            pet = new PetSheep(_owner, string(_petName), msg.sender);
        }
        else{
            revert("No such pet available!");
        }
        return address(pet);
    }

}