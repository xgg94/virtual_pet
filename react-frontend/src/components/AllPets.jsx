import React, { useState, useEffect } from 'react';
import "./allPets.css";
import PetDetails from './PetDetails';
import VirtualPet from "../abi/VirtualPet.json";

export default function AllPets({drizzle, drizzleState, user}) {

    const [allPets, setAllPets] = useState([]);

    const [currentPet, setCurrentPet] = useState(null);
    const [currentPetInput, setCurrentPetInput] = useState("");

    useEffect(() => {
        
        storePetAddress();
        
    }, [drizzleState.contracts.ATM.getAllPets, user]);
      //maybe also watch "drizzle"
      

    const storePetAddress = (petKey) => {

        //get ATM contract
        const contractATM = drizzle.contracts.ATM;

        // let drizzle know we want to watch the `all Pets` method
        const getPetKey = contractATM.methods["getAllPets"].cacheCall({
            //from: drizzleState.accounts[0]
            from: user
            });
        
        drizzle.contracts.ATM.methods.getAllPets()
            .call({from: user})
            .then((data) => {
                setAllPets(data);
                if(!data.length){
                    setCurrentPet(null);
                }
                if(!data.includes(currentPet)){
                    setCurrentPet(null);
                }
            });    

    }
    const arraysEqual = (a1,a2) => {
        return JSON.stringify(a1)==JSON.stringify(a2);
    }


    const handleSetActivePet = (e) => {
        //simple promise
        //const lvl = drizzle.contracts.Test.methods.getPetLevel().call();
        //setCurrentPet(petAddress);
        if(currentPet === ""){
            setCurrentPet(null)
        }
        else{
            setCurrentPet(currentPetInput);
        }
    };

    const handlePrevPet = () => {
        const ind = allPets.indexOf(currentPet, 0);
        if(ind === null) return;
        if(ind === 0){
            setCurrentPet(allPets[allPets.length -1]);
        }
        if((ind-1) in allPets){
            setCurrentPet(allPets[ind-1]);
        }
    }

    const handleNextPet = () => {
        const ind = allPets.indexOf(currentPet, 0);
        if(ind === null) return;
        if(ind === (allPets.length-1)){
            setCurrentPet(allPets[0]);
        }
        if((ind+1) in allPets){
            setCurrentPet(allPets[ind+1]);
        }
    }

    const renderPetAddresses = () => {
        if(!allPets.length){
            return(<div className='noPet'>Currently you don't own pets! - let's buy one! </div>)
        }
        return (allPets.map((u, index) =>
            <div key={index}>
                <div className={currentPet === u ? 'choosenPet' : 'singlePet'}>{u}</div>
            </div>
        ));
    }
    return (
        <div>
            <div className='chooseActivePetContainer'>
                <input className='input' type={"text"} onChange={(e) => {setCurrentPetInput(e.target.value)}} placeholder="Address of ACTIVE pet"></input>
                <button className='buttonChoosePet hover grow' onClick={handleSetActivePet} >CHOOSE ACTIVE PET</button>
            </div>
            
            <div className='allPetsContainer'>{renderPetAddresses()} </div>

            <div className='nextPetContainer'>
                <button className='buttonNextPet grow2 hover' onClick={handlePrevPet}>PREV PET</button>
                <button className='buttonNextPet grow2 hover' onClick={handleNextPet} >NEXT PET</button>
            </div>

            {currentPet &&
                <PetDetails 
                    drizzle={drizzle}
                    drizzleState={drizzleState}
                    activePet={currentPet}
                    user={user}
                />
            }
        </div>
    )
}
