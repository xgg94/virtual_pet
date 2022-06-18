import "./userDetails.css";
import React, { useState, useEffect } from 'react';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {getBoughtEvents, getTradeRequestEvents, getTradeDeclinedEvents} from './EventListener';

export default function UserDetails({drizzle, drizzleState, setUserAddress, userAddress}) {

    const {web3} = drizzle;
    //const [getTokenKey, setGetTokenKey] = useState("0xb559af5651a8817f6e8f63469c6a8f5284a0348a29b1e159426700e4f2d30699");

    const [user, setUser] = useState(drizzleState.accounts[1]);
    const [buyToken, setBuyToken] = useState(0);
    const [sellToken, setSellToken] = useState(0);
    const [newPetName, setNewPetName] = useState("");
    const [tokenAmount, setTokenAmount] = useState(0);
    const [buyerAdress, setBuyerAdress] = useState("");
    const [tradePet, setTradePet] = useState("");
    const [petPrice, setPetPrice] = useState(0);
    const [petRace, setPetRace] = useState(1);
    //events
    const [lastBoughtEvent, setLastBoughtEvent] = useState(null);
    const [lastTradeRequestEvent, setLastTradeRequestEvent] = useState(null);
    const [lastTradeDeclinedEvent, setLastTradeDeclinedEvent] = useState(null);

    //trade received
    const [receivedTrade, setReceivedTrade] = useState(null);

    
    useEffect(() => {
        //called 2 times
        storeTokenAmount();
        
    }, [drizzleState.contracts.ATM.getTokenAmount, userAddress]);

    //get events fired
    useEffect(() => {
        storeTokenAmount();

        const boughtEvents = getBoughtEvents(drizzleState.contracts.ATM.events, lastBoughtEvent, setLastBoughtEvent);
        boughtEvents.map((e, ind) => {
            console.log("event: " + e.event + " | return value: " + JSON.stringify(e.returnValues));
        });

        const requestEvents = getTradeRequestEvents(drizzleState.contracts.ATM.events, lastTradeRequestEvent, setLastTradeRequestEvent);
        requestEvents.map((e, ind) => {
            console.log("event: " + e.event + " | return value: " + e.returnValues);
            if(e.returnValues.to === userAddress){
                NotificationManager.success('Scroll down to accept or decline trade request','Incoming TRADE request!', 6000);
                // alert("NEW TRADE REQUEST RESEIVED: " + "\n" + 
                //     "FROM: " + e.returnValues.from + "\n" +
                //     "TO: " + e.returnValues.to + "\n" +
                //     "PET: " + e.returnValues.pet + "\n" +
                //     "PRICE: " + e.returnValues.value
                // );
                setReceivedTrade({
                    from: e.returnValues.from,
                    to: e.returnValues.to,
                    pet: e.returnValues.pet,
                    price: e.returnValues.value
                });
            }
        });

        const declinedEvents = getTradeDeclinedEvents(drizzleState.contracts.ATM.events, lastTradeDeclinedEvent, setLastTradeDeclinedEvent);
        declinedEvents.map((e, ind) => {
            console.log("event: " + e.event + " | return value: " + JSON.stringify(e.returnValues));
            if(e.returnValues.from === userAddress){
                NotificationManager.error('','TRADE request declined!', 6000);
                // alert("TRADE DECLINED! " + "\n" + 
                //         "FROM: " + e.returnValues.from + "\n" +
                //         "TO: " + e.returnValues.to + "\n" +
                //         "PET: " + e.returnValues.pet + "\n" +
                //         "PRICE: " + e.returnValues.value
                // );
            }
        });
        
    }, [drizzleState.contracts.ATM.events]);


    //store token amount
    const storeTokenAmount = () => {

        //get ATM contract
        const contractATM = drizzle.contracts.ATM;

        // let drizzle know we want to watch the `all Pets` method
        const tokenKey = contractATM.methods["getTokenAmount"].cacheCall({
            //from: drizzleState.accounts[0]
            from: userAddress
        });

        drizzle.contracts.ATM.methods.getTokenAmount()
            .call({from: userAddress})
            .then((data) => {
                setTokenAmount(data);
        });
        
        // const { ATM } = drizzleState.contracts;
        

        // const key = ATM.getTokenAmount[tokenKey];
        // if(key){
        //     if(key.value !== null  && key.value !== tokenAmount){
        //         console.log(key);
        //         setTokenAmount(key.value);
        //     }
        // }
    }

    //render level
    const renderTokenAmount = () => {
        return tokenAmount;
    }

    
    // const handleUserAddress = (e) => {
    //     setUser(e.target.value);
    // }

    // const handleSetUser = (e) => {
    //     setUserAddress(user);
    // }

    const handleTokenAmountChange = (e) => {
        setBuyToken(e.target.value);
    }

    const handleTokenSell = (e) => {
        if(sellToken % 1 === 0){
            const contractATM = drizzle.contracts.ATM;
            const stackId = contractATM.methods["sellToken"].cacheSend(sellToken,{
                from: userAddress
            });
        }
        else{
            NotificationManager.error('','Please provide integer values!', 6000);
        }
    }

    const handleTokenBuy = (e) => {
        const contractATM = drizzle.contracts.ATM;
        const stackId = contractATM.methods["buyToken"].cacheSend({
            //from: drizzleState.accounts[0]
            from: userAddress,
            value: amountToSend(buyToken)
        });
    }

    const handleCreatePetName = (e) => {
        setNewPetName(e.target.value);
    }

    const handlePetBuy = (e) => {
        drizzle.contracts.ATM.methods["buyPet"].cacheSend(newPetName, petRace, {
            //from: drizzleState.accounts[0]
            from: userAddress,
            gas: 3000000
        });
    }

    const handleStartPetTrade = (e) => {
        console.log(tradePet, buyerAdress, petPrice)
        drizzle.contracts.ATM.methods["sellPet"].cacheSend(tradePet, buyerAdress, petPrice,{
            from: userAddress,
            gas: 3000000
        });
    }

    const amountToSend = (amount) =>{
        return(web3.utils.toWei(amount.toString(), "ether")) // Convert to wei value)
    } 


    return (
        <div className="userDetailContainer">
            <div className="userDetailCoinContainer">
                <div className="testContainer">
                    <div className="exchangeInfoContainer">
                        <div className="exchangeTitle">EXCHANGE</div>
                        <div className="exchangeAttribute">1 eth = 100 coins</div>
                        <div className="exchangeAttribute">BUY multiples: 0.1 eth</div>
                        <div className="exchangeAttribute">SELL multiples: 10 coins</div>
                    </div>
                    <div className="activeDetailContainer">
                        <div className="activeUserTitle">Logged in with address:</div>
                        {userAddress && <div className="activeUser">{userAddress}</div>}
                    </div>
                </div>
                
                <div className="userDetailCoinDisplay" >COIN BALANCE: {renderTokenAmount()} </div>
                <div className="tokenInputContainer">
                    <div className="infoText">In Ether ➞ </div>
                    <input className="inputToken" type={"number"} onChange={handleTokenAmountChange} value={buyToken} step="0.1"/>
                    <button className="buttonToken grow hover" onClick={handleTokenBuy}>BUY COINS</button>
                </div>
                <div className="tokenInputContainer">
                    <div className="infoText">In Coins ➞ </div>
                    <input className="inputToken" type={"number"} onChange={(e) => {setSellToken(e.target.value)}} value={sellToken} step="10"/>
                    <button className="buttonToken grow hover" onClick={handleTokenSell}>SELL COINS</button>
                </div>
                
                
            </div>
            <div className="userDetailPetContainer">
                <div className="petTitle">Buy a new pet and choose which species you like!</div>
                <div className="buyPetContainer">
                    <input className="petNameInput" type={"text"} onChange={handleCreatePetName} value={newPetName} placeholder='Pet Name'/>
                    <select className="petRaceSelector" value={petRace} onChange={(e) => {setPetRace(e.target.value)}}>
                        <option value="1">RAT</option>
                        <option value="2">DOG</option>
                        <option value="3">SHEEP</option>
                    </select>
                    <button className="buttonBuyPet grow hover" onClick={handlePetBuy}>BUY PET</button>
                </div>
                <div className="petTitle">Trade your pets with other user!</div>
                <div className="tradePetContainer">
                    <div className="tradePetAdressContainer">
                        <input className="inputAddress" type={"text"} 
                            onChange={(e) => {setBuyerAdress(e.target.value)}} 
                            value={buyerAdress} 
                            placeholder='Address of BUYER' 
                        />
                        <input className="inputAddress" type={"text"} 
                            onChange={(e) => {setTradePet(e.target.value)}} 
                            value={tradePet} 
                            placeholder='Address of PET' 
                        />
                    </div>
                    <div className="tradePetInputButtonContainer">
                        <div className="tradePriceContainer">
                            <div className="infoText">Trade price</div>
                            <input className="inputTrade" type={"number"} 
                                onChange={(e)=>{setPetPrice(e.target.value)}} 
                                step="10" value={petPrice} 
                                placeholder='Pet price'
                            />
                        </div>
                        <button className="buttonTrade grow hover" onClick={handleStartPetTrade}>TRADE PET</button>
                    </div>
                </div>
            </div>
            <NotificationContainer/>
        </div>
    )
}


