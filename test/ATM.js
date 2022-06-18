const ATM = artifacts.require("./ATM.sol");
const truffleAssert = require('truffle-assertions');
const PetToken = artifacts.require("./PetToken.sol");
const PetFactory = artifacts.require("./PetFactory.sol");
const PetDog = artifacts.require("./VirtualPet.sol");

const web3 = ATM.web3;

const assertEvent = async function (transactionHash, eventSignatureString) {
    assert.equal(
      await containsEvent(transactionHash, eventSignatureString),
      true,
      "Expected to contain event + eventSignatureString"
    );
};

const containsEvent = async function (transactionHash, eventSignatureString) {
    let tx = await web3.eth.getTransactionReceipt(transactionHash);
    let eventHash = web3.utils.sha3(eventSignatureString);
  
    let eventFound = false;
    for (var i = 0; i < tx.logs.length; i++) {
      var topic = tx.logs[i].topics[0];
      if (topic === eventHash) {
        eventFound = true;
        break;
      }
    }
    return eventFound;
  };

contract("ATM test", accounts => {
  
    let atm;
    let petToken;
    let petFactory;

    let user1 = accounts[1];
    let user2 = accounts[2];

    async function deployAndInit() {
        
        petToken = await PetToken.new();
        petFactory = await PetFactory.new();

        atm = await ATM.new(petToken.address, petFactory.address);
    }

    beforeEach("deploy and init", async () => {
        await deployAndInit();
    });


    it("PetToken should be set", async () => {
        assert.equal(await atm.token.call(), petToken.address);
    });

    it("PetFactory should be set", async () => {
        assert.equal(await atm.petFactory.call(), petFactory.address);
    });

    it("Trades contract should be created", async () => {
        assert.notEqual(await atm.getTradeContract.call(), "0x0000000000000000000000000000000000000000");
    });

    it("User is able to buy tokens", async () => {
        //await truffleAssert.reverts(instance.mint(owner, 100, {'from': partygoer}));
        let txTokenBuy = await atm.buyToken({'from': user1, 'value': 100000000000000000});
        await assertEvent(txTokenBuy.receipt.transactionHash, 'Bought(uint256)');
        assert.equal(await atm.getTokenAmount.call({'from': user1}), 10);
    });

    it("User can't buy tokens with wrong decimals", async () => {
        await truffleAssert.reverts(atm.buyToken({'from': user1, 'value': 10000000000000000}));
    });


    it("User is able to sell tokens", async () => {
        await atm.buyToken({'from': user1, 'value': 100000000000000000});
        let balanceBefore = await atm.getTokenAmount.call({'from': user1})
        let txTokenSell = await atm.sellToken(10,{'from': user1});
        await assertEvent(txTokenSell.receipt.transactionHash, 'Sold(uint256)');
        let balanceAfter= await atm.getTokenAmount.call({'from': user1})
        assert.equal(balanceAfter, balanceBefore-10);
    });

    it("User has not enough token to sell", async () => {
        await truffleAssert.reverts(atm.sellToken(10,{'from': user1}));
    });

    it("User can't buy tokens with wrong decimals", async () => {
        await truffleAssert.reverts(atm.sellToken(5,{'from': user1}));
    });

    it("User can burn tokens", async () => {
        await atm.buyToken({'from': user1, 'value': 100000000000000000});
        let balanceBefore = await atm.getTokenAmount.call({'from': user1})
        let txTokenBurn = await atm.burnToken(10,user1,{'from': user1});
        await assertEvent(txTokenBurn.receipt.transactionHash, 'Burned(uint256)');
        let balanceAfter= await atm.getTokenAmount.call({'from': user1})
        assert.equal(balanceAfter, balanceBefore-10);
    });

    it("User can't burn other user's token", async () => {
        await atm.buyToken({'from': user1, 'value': 100000000000000000});
        await truffleAssert.reverts(atm.burnToken(10,user1,{'from': user2}));
    });

    it("User is able to buy a pet", async () => {
        await atm.buyToken({'from': user1, 'value': 100000000000000000});
        let balanceBefore = await atm.getTokenAmount.call({'from': user1});
        let petArrayBefore = await atm.getAllPets.call({'from': user1});
        await atm.buyPet("testpet", 1, {'from': user1});
        let balanceAfter= await atm.getTokenAmount.call({'from': user1})
        assert.equal(balanceAfter, balanceBefore-10);
        let petArrayAfter = await atm.getAllPets.call({'from': user1});
        assert.notEqual(petArrayBefore.length, petArrayAfter.length);
    });

    it("User is not able to buy a pet", async () => {
        await truffleAssert.reverts(atm.buyPet("testpet", 1, {'from': user1}));
    });


    it("User can't remove alive pet", async () => {
        await atm.buyToken({'from': user1, 'value': 100000000000000000});
        await atm.buyPet("testpet", 1, {'from': user1});
        let petArrayBefore = await atm.getAllPets.call({'from': user1});
        await atm.removePet.call(petArrayBefore[0],{'from': user1});
        let petArrayAfter = await atm.getAllPets.call({'from': user1});
        assert.equal(petArrayBefore.length, petArrayAfter.length);
    });

    it("User can trade pet with other user", async () => {
        await atm.buyToken({'from': user1, 'value': 100000000000000000});
        await atm.buyPet("testpet", 1, {'from': user1});
        let petArrayBeforeUser1 = await atm.getAllPets.call({'from': user1});
        let petArrayBeforeUser2 = await atm.getAllPets.call({'from': user2});
        await atm.sellPet(petArrayBeforeUser1[0], user2, 20, {'from': user1});
        await atm.buyToken({'from': user2, 'value': 200000000000000000});
        await atm.acceptPetTrade(petArrayBeforeUser1[0], user1, 20, {'from': user2, 'gas': 3000000});
        let petArrayAfterUser1 = await atm.getAllPets.call({'from': user1});
        let petArrayAfterUser2 = await atm.getAllPets.call({'from': user2});
        assert.notEqual(petArrayBeforeUser1.length, petArrayAfterUser1.length);
        assert.notEqual(petArrayBeforeUser2.length, petArrayAfterUser2.length);
    });

    it("Buyer has not enough token for trade", async () => {
        await atm.buyToken({'from': user1, 'value': 100000000000000000});
        await atm.buyPet("testpet", 1, {'from': user1});
        let petArrayBefore = await atm.getAllPets.call({'from': user1});

        await atm.sellPet(petArrayBefore[0], user2, 20, {'from': user1});
        await atm.buyToken({'from': user2, 'value': 100000000000000000});
        await truffleAssert.reverts(atm.acceptPetTrade(petArrayBefore[0], user1, 20, {'from': user2}));
    });

    it("User already has an open trade with other user", async () => {
        await atm.buyToken({'from': user1, 'value': 100000000000000000});
        await atm.buyPet("testpet", 1, {'from': user1});
        let petArrayBefore = await atm.getAllPets.call({'from': user1});

        await atm.sellPet(petArrayBefore[0], user2, 20, {'from': user1});
        await truffleAssert.reverts(atm.sellPet(petArrayBefore[0], user2, 20, {'from': user1}));
    });

    it("User can't accept not existing trade", async () => {
        await atm.buyToken({'from': user1, 'value': 100000000000000000});
        await atm.buyPet("testpet", 1, {'from': user1});
        let petArrayBeforeUser1 = await atm.getAllPets.call({'from': user1});
        await truffleAssert.reverts(atm.acceptPetTrade(petArrayBeforeUser1[0], user1, 20, {'from': user2}));
    });

    it("User is able to decline pet trade", async () => {
        await atm.buyToken({'from': user1, 'value': 100000000000000000});
        await atm.buyPet("testpet", 1, {'from': user1});
        let petArrayBeforeUser1 = await atm.getAllPets.call({'from': user1});
        let petArrayBeforeUser2 = await atm.getAllPets.call({'from': user2});
        await atm.sellPet(petArrayBeforeUser1[0], user2, 20, {'from': user1});
        await atm.buyToken({'from': user2, 'value': 200000000000000000});

        await atm.declinePetTrade(petArrayBeforeUser1[0], user1, 20, {'from': user2});
        let petArrayAfterUser1 = await atm.getAllPets.call({'from': user1});
        let petArrayAfterUser2 = await atm.getAllPets.call({'from': user2});
        assert.equal(petArrayBeforeUser1.length, petArrayAfterUser1.length);
        assert.equal(petArrayBeforeUser2.length, petArrayAfterUser2.length);
    });
    
});