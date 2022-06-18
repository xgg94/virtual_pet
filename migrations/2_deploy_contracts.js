
const ATM = artifacts.require("ATM");
const PetToken = artifacts.require("PetToken");
const PetFactory = artifacts.require("PetFactory");

module.exports = function(deployer) {

  deployer.then(async () => {
    await deployer.deploy(PetToken);
    await deployer.deploy(PetFactory);
    await deployer.deploy(ATM, PetToken.address, PetFactory.address);
    //...
  });
};