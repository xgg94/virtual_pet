import React, { useState, useEffect} from 'react';
import "./App.css";
import { DrizzleContext } from "@drizzle/react-plugin";
import { Drizzle,generateStore} from "@drizzle/store";

import AllPets from "./components/AllPets";
import UserDetails from "./components/UserDetails";
import ErrorLogger from './components/ErrorLogger';
import AllTrades from './components/AllTrades';
import SearchPet from './components/SearchPet';
import EventListener from './components/EventListener';
import StringStore from "./abi/StringStore.json";
import ATM from "./abi/ATM.json";

const options = {
  contracts: [ATM],
  events: {
    ATM: ["Bought", "Sold", "Burned", "TradeRequest", "TradeFinished", "TradeDeclined", "PetCreated"],
  },
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:7545", //"http://127.0.0.1:8546"
    },
  },
};

// setup the drizzle store and drizzle
const drizzleStore = generateStore(options);
const drizzle = new Drizzle(options, drizzleStore);

const App = () => {
  
  const [userAddress, setUserAddress] = useState(null);
  const [textbox, setTextbox] = useState(null);

  

  return (
    <DrizzleContext.Provider drizzle={drizzle}>
      <DrizzleContext.Consumer>
        {drizzleContext => {
          const {drizzle, drizzleState, initialized} = drizzleContext;
          if(!initialized) {
            return "Loading..."
          }

          return (
            <div>
                <div className='userContainer'>
                    <div className='inputTitle'>Provide your address!</div>
                    <div className='inputContainer'>
                        <input className='input' type="text" onChange={(e) => {setTextbox(e.target.value)}} />
                        <button className='button grow grow:hover' onClick={(e) => {setUserAddress(textbox)}}>SET ADDRESS</button>
                    </div>  
                </div>
                
                <UserDetails
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  setUserAddress={setUserAddress}
                  userAddress={userAddress}
                />
                <AllPets
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  user={userAddress}
                />
                <AllTrades
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  user={userAddress}
                />
                <ErrorLogger
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                />
                {/* <EventListener
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  user={userAddress}
                /> */}
                <SearchPet
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  user={userAddress}
                />
                
            </div>
          )
        }}
      </DrizzleContext.Consumer>
    </DrizzleContext.Provider>
  );
}

export default App;


