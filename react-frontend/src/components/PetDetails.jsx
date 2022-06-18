import React, { useState, useEffect, useRef } from 'react';
import "./petDetails.css";
import VirtualPet from "../abi/VirtualPet.json";
import {EstimationLevel, EstimationHealth} from './Estimation';

export default function PetDetails({drizzle, drizzleState, activePet, user}) {

    const {web3} = drizzle;
    // const [petLevelKey, setPetLevelKey] = useState(null);
    // const [petHealthKey, setPetHealthKey] = useState(null);
    // const [petNameKey, setPetNameKey] = useState(null);
    const [verify, setVerify] = useState(false);

    //const [test, setTest] = useState(null);

    //timer
    //const [timer, setTimer] = useState(0);
    // const [isRunning, setIsRunning] = useState(false);
    // const [delay, setDelay] = useState(10000);

    // const [estimatedLevel, setEstimatedLevel] = useState(0);
    
    const [currentLevel, setCurrentLevel] = useState(null);
    const [currentHealth, setCurrentHealth] = useState(null);
    const [currentName, setCurrentName] = useState(null);
    const [currentAlive, setCurrentAlive] = useState(null);
    const [currentRace, setCurrentRace] = useState(null);

    const [gamble, setGamble] = useState("");

    useEffect(() => {
        let contractName = "Pet"
        let web3Contract = new web3.eth.Contract(VirtualPet.abi, activePet) //second argument is new contract's address                                          
        let contractConfig = { contractName, web3Contract }
        let events = ['PetDied'];

        //setContractActive(false);
        
        if(!drizzle.contracts.Pet){
            drizzle.addContract(contractConfig, events);
        }
        if(drizzle.contracts.Pet.address != activePet){
            drizzle.deleteContract("Pet");
            drizzle.addContract(contractConfig, events);
        }
        
        verifyUser();
        
    }, [activePet]);


    const storeAllParameters = () => {
        storePetName();
        storePetLevel();
        storePetHealth();
        storePetAlive();
        storePetRace();
    }

    //store pet alive status
    const storePetAlive = () => {
        //get ATM contract
        const contractPet = drizzle.contracts.Pet;

        // let drizzle know we want to watch the `all Pets` method
        const tokenKey = contractPet.methods["getPetStatus"].cacheCall({
            //from: drizzleState.accounts[0]
            from: user
        });

        drizzle.contracts.Pet.methods.getPetStatus()
            .call({from: user})
            .then((data) => {
                console.log("alive" +data);
                setCurrentAlive(data);
        });
    }
    
    //store pet level
    const storePetLevel = () => {
        //get ATM contract
        const contractPet = drizzle.contracts.Pet;

        // let drizzle know we want to watch the `all Pets` method
        const tokenKey = contractPet.methods["getPetLevel"].cacheCall({
            //from: drizzleState.accounts[0]
            from: user
        });

        drizzle.contracts.Pet.methods.getPetLevel()
            .call({from: user})
            .then((data) => {
                console.log("level" +data);
                setCurrentLevel(data);
        });
    }

    //store pet health
    const storePetHealth = () => {
        //get ATM contract
        const contractPet = drizzle.contracts.Pet;

        // let drizzle know we want to watch the `all Pets` method
        const tokenKey = contractPet.methods["getPetHealth"].cacheCall({
            //from: drizzleState.accounts[0]
            from: user
        });

        drizzle.contracts.Pet.methods.getPetHealth()
            .call({from: user})
            .then((data) => {
                setCurrentHealth(data);
        });
    }

    //store pet health
    const storePetName = () => {
        //get ATM contract
        const contractPet = drizzle.contracts.Pet;

        // let drizzle know we want to watch the `all Pets` method
        const tokenKey = contractPet.methods["petName"].cacheCall({
            //from: drizzleState.accounts[0]
            from: user
        });

        drizzle.contracts.Pet.methods.petName()
            .call({from: user})
            .then((data) => {
                setCurrentName(data);
        });
    }

    //store pet race
    const storePetRace = () => {
        //get ATM contract
        const contractPet = drizzle.contracts.Pet;

        // let drizzle know we want to watch the `all Pets` method
        const tokenKey = contractPet.methods["getPetRace"].cacheCall({
            //from: drizzleState.accounts[0]
            from: user
        });

        drizzle.contracts.Pet.methods.getPetRace()
            .call({from: user})
            .then((data) => {
                setCurrentRace(data);
        });
    }

    const verifyUser = () => {
        drizzle.contracts.Pet.methods.getPetOwner()
            .call({from: user})
            .then((data) => {
                if(data === user){
                    setVerify(true);
                    updatePet();
                    storeAllParameters();
                    return true;
                }
                else{
                    setVerify(false);
                    drizzle.deleteContract("Pet");
                    console.log("NOT VERIFIED")
                }
        });
    }

    const updatePet = () => {
        drizzle.contracts.Pet.methods.update()
            .send({from: user})
            .then((data) => {
                storeAllParameters();
        });
    }

    const handleFeed = () => {
        drizzle.contracts.Pet.methods["feed"].cacheSend({
            from: user,
        });
        updatePet();
    }

    const handleDamage = () => {
        drizzle.contracts.Pet.methods["damage"].cacheSend({
            from: user,
        });
        updatePet();
    }

    const handlePlay = () => {
        drizzle.contracts.Pet.methods["play"].cacheSend(gamble,{
            from: user,
            //gas: 3000000
        });
        updatePet();
    }

    const handleRemovePet = () => {
        if(!currentAlive){
            const contractATM = drizzle.contracts.ATM;
            const stackId = contractATM.methods["removePet"].cacheSend(activePet,{
                //from: drizzleState.accounts[0]
                from: user
            });
        }
    }


    const petRaceAsString = () => {
        switch (Number(currentRace)) {
            case 1:
                return ("Rat")
            case 2:
                return ("Dog")
            case 3:
                return ("Sheep")
            default:
                return ("UNKNOWN")
        }
    }

    const renderPetImage = () => {
        switch (Number(currentRace)) {
            case 1:
                return (<img src="/pet_rat.png" alt="image" height={200}/>)
            case 2:
                return (<img src="/pet_dog.png" alt="image" height={200}/>)
            case 3:
                return (<img src="/pet_sheep.png" alt="image" height={200}/>)
            default:
                return (<div></div>)
        }
    }

    const renderPet = () => {
        if(!verify){
            return(<div></div>)
        }
        if(currentAlive){
            return(
                <div>
                    <div className='petPictureContainer'>{renderPetImage()}</div>
                    <div className='petDetailHorizontalContainer'>
                        <div className='petDetailContainer'>
                            <div className='petAttribute'>
                                <div>Name: </div>
                                <div>{currentName}</div>
                            </div>
                            <div className='petAttribute'>
                                <div>Race: </div>
                                <div>{petRaceAsString()} </div>
                            </div>
                            {/* <div className='petAttribute'>Level of PET: {currentLevel} </div>
                            <div className='petAttribute'>Health of PET: {currentHealth} </div> */}
                            <EstimationLevel 
                                level={currentLevel}
                            />
                            <EstimationHealth
                                health={currentHealth}
                            />
                        </div>
                        <div className='petActionContainer'>
                            <div className="petActionFirstContainer">
                                <button className='buttonUpdatePet grow hover' onClick={updatePet}>UPDATE</button>
                                <div className='gambleActionPetContainer'>
                                    <button className='buttonActionPet grow3 hover' onClick={handlePlay} >PLAY</button>
                                    <input className='inputGamble' 
                                        type={"number"} 
                                        onChange={(e) => {setGamble(e.target.value)}}
                                        placeholder='1-100'
                                    />
                                </div>
                            </div>
                            <button className='buttonActionPet grow3 hover' onClick={handleFeed} >FEED</button>
                            <button className='buttonActionPet grow3 hover' onClick={handleDamage} >DAMAGE</button>
                        </div>
                    </div>
                </div>
            )
        }
        else if(currentAlive == false){
            return(
                <div>
                    <div className='petPictureContainer'>
                        <img src="/pet_grave.png" alt="image" height={200}/>
                    </div>
                    <div className='petDetailHorizontalContainer'>
                        <div className='petDetailContainer'>
                            <div className='petDeadAttribute'> ✝ {currentName} is dead ✝ </div>
                        </div>
                        <div className='petActionContainer'>
                            <button className='buttonUpdatePet grow hover' onClick={handleRemovePet} >Remove pet</button>
                        </div>
                    </div>
                </div>
            )
        }

        
    }

    return (renderPet())
}
