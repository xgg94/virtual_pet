import React, { useState, useEffect } from 'react';

export default function TestUpdate({drizzle, drizzleState}) {
    const [dataKey, setDataKey] = useState(null);

    useEffect(() => {
        const contractATM = drizzle.contracts.ATM;

        // let drizzle know we want to watch the `level` method
        const dataKey = contractATM.methods["getPetLevel"].cacheCall("0x122960597290d4925bE49Eb42daE17a1e6392644", {
            //from: drizzleState.accounts[0]
            from: "0x8443a80aCb6F9b5336a0F4F6AfB08dc8Cc6CCB52"
            });
        

        setDataKey(dataKey);
      }, [drizzle, drizzleState]);

    function provideLevel () {
        const { ATM } = drizzleState.contracts;

        // using the saved `dataKey`, get the variable we're interested in
        const myString = ATM.getPetLevel[dataKey];
        if(myString){
            console.log(drizzleState.contracts.ATM.getPetLevel[dataKey].value);
            return true;
        }
        return false;
    }

    return (
        <div>Level: {provideLevel() && drizzleState.contracts.ATM.getPetLevel[dataKey].value}</div>
    )
}
