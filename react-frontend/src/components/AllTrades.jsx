import React, { useState, useEffect } from 'react';
import "./allTrades.css";
import Trades from "../abi/Trades.json";

export default function AllTrades({drizzle, drizzleState, user}) {

    const {web3} = drizzle;
    const [allTrades, setAllTrades] = useState([]);
    const [contractActive, setContractActive] = useState(false);

    useEffect(() => {
        drizzle.contracts.ATM.methods.getTradeContract()
            .call({from: user})
            .then((data) => {
                let tradesAddress = data;
                let contractName = "Trades"
                let web3Contract = new web3.eth.Contract(Trades.abi, tradesAddress) //second argument is new contract's address                                          
                let contractConfig = { contractName, web3Contract }

                if(!drizzle.contracts.Trades){
                    drizzle.addContract(contractConfig);
                }
                setContractActive(true);
                storeTradeRequests();
        });
    }, []);

    useEffect(() => {
        if(contractActive){
            storeTradeRequests();
        }
    
    }, [drizzleState.contracts.ATM.events, user]);

    const storeTradeRequests = () => {
        //get ATM contract
        const contractTrades = drizzle.contracts.Trades;

        // let drizzle know we want to watch the `all Pets` method
        const tradeRequestKey = contractTrades.methods["getTradeRequests"].cacheCall({
            //from: drizzleState.accounts[0]
            from: user
        });

        drizzle.contracts.Trades.methods.getTradeRequests()
            .call({from: user})
            .then((data) => {
                console.log(data);
                setAllTrades(data);
        });
    }

    const handleAcceptOffer = (trade) => (e) => {
        
        const stackId = drizzle.contracts.ATM.methods["acceptPetTrade"].cacheSend(trade.pet, trade.tradePartner, trade.price, {
            from: user,
            gas: 3000000
        });
        //setAllTrades(allTrades.filter(item => item === trade));


        // drizzle.contracts.ATM.methods.acceptPetTrade(trade.pet, trade.tradePartner, trade.price)
        //     .send({from: user})
        //     .then((data) => {
        //         console.log(data);
        //         console.log(allTrades.length);
        //         if(data){
        //             setAllTrades(allTrades.filter(item => item === trade));
        //         }
        // });
    }

    const handleDeclineOffer = (trade) => (e) => {
        console.log("decline " + trade);
        setAllTrades(allTrades.filter(item => item === trade));
        drizzle.contracts.ATM.methods["declinePetTrade"].cacheSend(trade.pet, trade.tradePartner, trade.price, {
            from: user,
            gas: 3000000
        });
    }

    const renderAllTradeRequests = () => {
        return (allTrades.map((trade, index) =>
            <div className='tradeInfoContainer' key={index}>
                <div className='test'>
                    <div className='tradeTitle'> TRADE request: [{index +1}] </div>
                    <div className='tradeAttribute'> 
                        <div className="tradeAttributeTitle">FROM:</div>
                        <div className="tradeAttributeValue">{trade.tradePartner}</div>
                    </div>
                    <div className='tradeAttribute'> 
                        <div className="tradeAttributeTitle">PET:</div>
                        <div className="tradeAttributeValue">{trade.pet}</div>
                    </div>
                    <div className='tradeAttribute'> 
                        <div className="tradeAttributeTitle">TOKEN PRICE:</div>
                        <div className="tradeAttributeValue">{trade.price}</div>
                    </div>
                </div>
                <div className='tradeButtonContainer'>
                    <button className='tradeButtonAccept grow hover' onClick={handleAcceptOffer(trade)} >ACCEPT OFFER</button>
                    <button className='tradeButtonDecline grow5 hover' onClick={handleDeclineOffer(trade)} >DECLINE OFFER</button>
                </div>
            </div>
        ));
    }

    return (

        <div className='allTradesContainer'> 
            {renderAllTradeRequests()}
        </div>
    )
}
