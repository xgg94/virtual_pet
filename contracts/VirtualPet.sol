// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ATM.sol";

abstract contract VirtualPet {

    address internal atmAddress;
    address public owner;
    string public petName;
    uint256 public petLevel;
    uint256 public petHealth;
    uint256 public creationTime;
    uint256 public lastModTime;
    bool public alive;

    uint256 public restPetHealth;
    uint256 public restPetLevel;

    //level up every 10 seconds
    uint256 internal constant levelDownTime = 10;
    //level up every 60 seconds
    uint256 internal constant healthDownTime = 60;

    //interactions costs & values
    uint256 internal constant feedCost = 5;
    uint256 internal constant feedHealth = 20;

    uint256 internal constant damageCost = 5;
    uint256 internal constant damageValue = 20;

    enum PetRace{NONE,RAT, DOG, SHEEP}
    PetRace public petRace;

    event PetDied(address pet);

    modifier isOwner(address _owner) {
        require(owner == _owner, "permission denied!");
        _;
    }

    modifier isAlive() {
        require(alive == true, "pet is dead!");
        _;
    }

    function changeOwner(address _owner) external returns (address newOwner){
        require(msg.sender == atmAddress, "Only ATM can change pet owner!");
        owner = _owner;
        return owner;
    }

    function getPetLevel() external view returns(uint256 level) {
        return petLevel;
    }

    function getPetHealth() external view returns(uint256 health) {
        return petHealth;
    }

    function getPetOwner() external view returns(address) {
        return owner;
    }

    function getPetStatus() external view returns(bool) {
        return alive;
    }

    function getPetRace() external view returns(PetRace) {
        return petRace;
    }

    function update() external virtual;

    function feed() external virtual;

    function damage() external virtual returns (bool success);

    function play(uint number) external virtual;

}


contract PetRat is VirtualPet {

    constructor(address _owner, string memory _petName, address _atm) {
        owner = _owner;
        petName = string(_petName);
        lastModTime = block.timestamp;
        creationTime = block.timestamp;
        petLevel = 1;
        petHealth = 100;
        alive = true;
        atmAddress = _atm;
        petRace = PetRace.RAT;
    }


    function update() external override {
        if(alive){
            uint stamp = block.timestamp;
            uint deltaTime = stamp - lastModTime;
            lastModTime = stamp;

            //updating level
            restPetLevel += (deltaTime % levelDownTime);
            if(restPetLevel > levelDownTime){
                petLevel += restPetLevel/levelDownTime;
                restPetLevel = (restPetLevel % levelDownTime);
            }
            petLevel += (deltaTime/levelDownTime);

            //updating health
            //rest adding
            restPetHealth += (deltaTime % healthDownTime);
            if((restPetHealth > healthDownTime) && (petHealth >= restPetHealth/healthDownTime)){
                petHealth -= restPetHealth/healthDownTime;
                restPetHealth = (restPetHealth % healthDownTime);
            }
            //division adding
            if(petHealth <= (deltaTime/healthDownTime)){
                petHealth = 0;
                alive = false;
                emit PetDied(address(this));
            }
            else{
                petHealth -= (deltaTime/healthDownTime);
            }
        }
        else{
            petHealth = 0;
        }
	}

    function feed() external override isOwner(msg.sender) isAlive {
        this.update();
        ATM(atmAddress).burnToken(feedCost, msg.sender);
        if((petHealth + feedHealth) >= 100){
            petHealth = 100;
        }
        else{
            petHealth += feedHealth;
        }
    }

    function damage() external override isOwner(msg.sender) returns (bool success) {
        this.update();
        ATM(atmAddress).burnToken(damageCost, msg.sender);
        if(petHealth <= damageValue){
            petHealth = 0;
            alive = false;
            emit PetDied(address(this));
        }
        else{
            petHealth -= damageValue;
        }
        return true;
    }

    //pseudo random gamble health
    function play(uint number) external override {
        require(number>=0 && number <=100);
        uint result = uint(keccak256(abi.encodePacked(block.timestamp,block.difficulty, msg.sender))) % (number*2);
        this.update();
        if(result >= number){
            if((petHealth + (result-number)) >= 100){
                petHealth = 100;
            }
            else{
                petHealth += (result-number);
            }
        }
        else{
            if(petHealth <= (number-result)){
                petHealth = 0;
                alive = false;
                emit PetDied(address(this));
            }
            else{
                petHealth -= (number-result);
            }
        }
    }
}



contract PetDog is VirtualPet {

    constructor(address _owner, string memory _petName, address _atm) {
        owner = _owner;
        petName = string(_petName);
        lastModTime = block.timestamp;
        creationTime = block.timestamp;
        petLevel = 1;
        petHealth = 100;
        alive = true;
        atmAddress = _atm;
        petRace = PetRace.DOG;
    }

    function update() external override {
        if(alive){
            uint stamp = block.timestamp;
            uint deltaTime = stamp - lastModTime;
            lastModTime = stamp;

            //updating level
            restPetLevel += (deltaTime % levelDownTime);
            if(restPetLevel > levelDownTime){
                petLevel += restPetLevel/levelDownTime;
                restPetLevel = (restPetLevel % levelDownTime);
            }
            petLevel += (deltaTime/levelDownTime);

            //updating health
            //rest adding
            restPetHealth += (deltaTime % healthDownTime);
            if((restPetHealth > healthDownTime) && (petHealth >= restPetHealth/healthDownTime)){
                petHealth -= restPetHealth/healthDownTime;
                restPetHealth = (restPetHealth % healthDownTime);
            }
            //division adding
            if(petHealth <= (deltaTime/healthDownTime)){
                petHealth = 0;
                alive = false;
                emit PetDied(address(this));
            }
            else{
                petHealth -= (deltaTime/healthDownTime);
            }
        }
        else{
            petHealth = 0;
        }
	}

    function feed() external override isOwner(msg.sender) isAlive {
        this.update();
        ATM(atmAddress).burnToken(feedCost, msg.sender);
        if((petHealth + feedHealth) >= 100){
            petHealth = 100;
        }
        else{
            petHealth += feedHealth;
        }
    }

    //overflow - because using uint (unsigned) and proof if < 0 ... same problem with update error
    function damage() external override isOwner(msg.sender) returns (bool success) {
        this.update();
        ATM(atmAddress).burnToken(damageCost, msg.sender);
        if(petHealth <= damageValue){
            petHealth = 0;
            alive = false;
            emit PetDied(address(this));
        }
        else{
            petHealth -= damageValue;
        }
        return true;
    }

    function play(uint number) external override {
        require(number>=0 && number <=100);
        uint result = uint(keccak256(abi.encodePacked(block.timestamp,block.difficulty, msg.sender))) % (number*2);
        this.update();
        if(result >= number){
            if((petHealth + (result-number)) >= 100){
                petHealth = 100;
            }
            else{
                petHealth += (result-number);
            }
        }
        else{
            if(petHealth <= (number-result)){
                petHealth = 0;
                alive = false;
                emit PetDied(address(this));
            }
            else{
                petHealth -= (number-result);
            }
        }
    }
}


contract PetSheep is VirtualPet {

    constructor(address _owner, string memory _petName, address _atm) {
        owner = _owner;
        petName = string(_petName);
        lastModTime = block.timestamp;
        creationTime = block.timestamp;
        petLevel = 1;
        petHealth = 100;
        alive = true;
        atmAddress = _atm;
        petRace = PetRace.SHEEP;
    }

    function update() external override {
        if(alive){
            uint stamp = block.timestamp;
            uint deltaTime = stamp - lastModTime;
            lastModTime = stamp;

            //updating level
            restPetLevel += (deltaTime % levelDownTime);
            if(restPetLevel > levelDownTime){
                petLevel += restPetLevel/levelDownTime;
                restPetLevel = (restPetLevel % levelDownTime);
            }
            petLevel += (deltaTime/levelDownTime);

            //updating health
            //rest adding
            restPetHealth += (deltaTime % healthDownTime);
            if((restPetHealth > healthDownTime) && (petHealth >= restPetHealth/healthDownTime)){
                petHealth -= restPetHealth/healthDownTime;
                restPetHealth = (restPetHealth % healthDownTime);
            }
            //division adding
            if(petHealth <= (deltaTime/healthDownTime)){
                petHealth = 0;
                alive = false;
                emit PetDied(address(this));
            }
            else{
                petHealth -= (deltaTime/healthDownTime);
            }
        }
        else{
            petHealth = 0;
        }
	}

    function feed() external override isOwner(msg.sender) isAlive {
        this.update();
        ATM(atmAddress).burnToken(feedCost, msg.sender);
        if((petHealth + feedHealth) >= 100){
            petHealth = 100;
        }
        else{
            petHealth += feedHealth;
        }
    }

    function damage() external override isOwner(msg.sender) returns (bool success) {
        this.update();
        ATM(atmAddress).burnToken(damageCost, msg.sender);
        if(petHealth <= damageValue){
            petHealth = 0;
            alive = false;
            emit PetDied(address(this));
        }
        else{
            petHealth -= damageValue;
        }
        return true;
    }

    function play(uint number) external override {
        require(number>=0 && number <=100, "Gamble must be in range 0 -100");
        uint result = uint(keccak256(abi.encodePacked(block.timestamp,block.difficulty, msg.sender))) % (number*2);
        this.update();
        if(result >= number){
            if((petHealth + (result-number)) >= 100){
                petHealth = 100;
            }
            else{
                petHealth += (result-number);
            }
        }
        else{
            if(petHealth <= (number-result)){
                petHealth = 0;
                alive = false;
                emit PetDied(address(this));
            }
            else{
                petHealth -= (number-result);
            }
        }
    }
}