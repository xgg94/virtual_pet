import React, { useState, useEffect, useRef } from 'react';
import "./searchPet.css"
import VirtualPet from "../abi/VirtualPet.json";
import {EstimationLevel, EstimationHealth} from './Estimation';

export default function SearchPet({drizzle, drizzleState, user}) {

    const {web3} = drizzle;
    
    const [currentLevel, setCurrentLevel] = useState(null);
    const [currentHealth, setCurrentHealth] = useState(null);
    const [currentName, setCurrentName] = useState(null);
    const [currentAlive, setCurrentAlive] = useState(null);
    const [currentRace, setCurrentRace] = useState(null);

    const [textbox, setTextbox] = useState("");
    const [activePet, setActivePet] = useState(null);

    const handleShowPet = (pet) => {
        if(!pet || pet === ""){
            setActivePet(null);
            setTextbox("");
        }
        else{
            setActivePet(pet);
            let contractName = "Pet"
            let web3Contract = new web3.eth.Contract(VirtualPet.abi, pet) //second argument is new contract's address                                          
            let contractConfig = { contractName, web3Contract }
            let events = ['PetDied'];
    
            console.log("NEW ACTIVE");
    
            //setContractActive(false);
            
            if(!drizzle.contracts.Pet){
                drizzle.addContract(contractConfig, events);
            }
            if(drizzle.contracts.Pet.address != pet){
                drizzle.deleteContract("Pet");
                drizzle.addContract(contractConfig, events);
            }
    
            updatePet();
            storeAllParameters();
        }
    }


    const storeAllParameters = () => {
        console.log("NEU WERTE");
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

    const updatePet = () => {
        drizzle.contracts.Pet.methods.update()
            .send({from: user})
            .then((data) => {
                console.log("los");
                storeAllParameters();
        });
    }

    const petRaceAsString = () => {
        console.log(currentRace)
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
        if(currentAlive){
            return(
                <div>
                    <div className='searchPetPictureContainer'>{renderPetImage()}</div>
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
                            <EstimationLevel 
                                level={currentLevel}
                            />
                            <EstimationHealth
                                health={currentHealth}
                            />
                        </div>
                        <div className='petActionContainer'>
                            <button className='buttonUpdatePet grow hover' onClick={updatePet}>UPDATE</button>
                        </div>
                    </div>
                </div>
            )
        }
        else if(currentAlive == false){
            return(
                <div>
                    <div className='searchPetPictureContainer'>
                        <img src="/pet_grave.png" alt="image" height={200}/>
                    </div>
                    <div className='petDetailHorizontalContainer'>
                        <div className='petDetailContainer'>
                            <div className='petDeadAttribute'> ✝ {currentName} is dead ✝ </div>
                        </div>
                    </div>
                </div>
            )
        }
    }

    return (
            <div> 
                <div className='searchContainer'>
                    <div className='searchPetTitle'>Discover other user's pet</div>
                    <div className="searchPetContainer">
                        <input className='input' 
                            type={"text"} 
                            onChange={(e) => {setTextbox(e.target.value)}} 
                            value={textbox} 
                            placeholder='Address of PET you want to see' 
                            style={{ width: '350px' }}
                        />
                        <button className='buttonSearchPet grow hover' onClick={(e) => {handleShowPet(textbox)}}>SHOW PET</button>
                        <button className='buttonSearchPet grow hover' onClick={(e) => {handleShowPet(null)}}>HIDE PET</button>
                    </div>
                    
                </div>
                {activePet && renderPet()}
            </div>
        )
}
