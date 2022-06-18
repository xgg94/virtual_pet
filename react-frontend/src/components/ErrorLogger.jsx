import React, {useState, useEffect} from 'react'
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';

export default function ErrorLogger({drizzle, drizzleState}) {

    const [transactionHash, setTransactionHash] = useState([]);
    const [lastTransaction, setLastTransaction] = useState(null);
    const [showLogger, setShowLogger] = useState(false);
    //error logger
    useEffect(() => {
        var arr = [];
        const transactionStack = drizzleState.transactionStack
        
        if(Object.keys(drizzleState.transactions).length){
            for (var i = transactionStack.length - 1; i >= 0; i--) {
                if(transactionStack[i] === lastTransaction) {
                    break;
                }
                arr.push(drizzleState.transactions[transactionStack[i]]);
                if(drizzleState.transactions[transactionStack[i]].status === "error"){
                    setShowLogger(true);
                }
            }

            setTransactionHash(arr);
            setLastTransaction(transactionStack[transactionStack.length -1]);

            //error notification
            arr.filter(opt => opt.status === "error").map((opt, index) => {
                const splitStr = opt.error.message.split("revert");
                if(splitStr.length >= 2){
                    NotificationManager.error(splitStr[1],'Error!', 6000);
                }
            })
        }

        
    }, [drizzleState.transactions, drizzle]);


    const renderErrors = () => {
        return(
        transactionHash.filter(opt => opt.status === "error").map((opt, index) => 
            <div key={index}>
                <p>{opt.error.message}</p>
            </div>
        ));
    }

    const clearLogger = (e) => {
        setTransactionHash([]); 
        setShowLogger(false)
    }

    return (
        <div>
            {/* {showLogger && 
            <>
                <div>ErrorLogger: {renderErrors()}</div>
                <button onClick={clearLogger}>CLEAR ERROR LOGGER</button>
            </>} */}
            <NotificationContainer/>
        </div>
    )
}
