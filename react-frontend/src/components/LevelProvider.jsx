import React, { Component } from 'react'

export default class LevelProvider extends Component {

    state = { dataKey: null};
    

    componentDidMount() {
        const { drizzle, drizzleState } = this.props;
        const contractATM = drizzle.contracts.ATM;

        // let drizzle know we want to watch the `level` method
        const dataKey = contractATM.methods["getAllPets"].cacheCall({
            //from: drizzleState.accounts[0]
            from: "0x8443a80aCb6F9b5336a0F4F6AfB08dc8Cc6CCB52"
            });
        

        // save the `dataKey` to local component state for later reference
        this.setState({ dataKey });

    }

    render() {
        const { ATM } = this.props.drizzleState.contracts;

        // using the saved `dataKey`, get the variable we're interested in
        const myString = ATM.getAllPets[this.state.dataKey];
        return (
            <div>Level: {myString && ATM.getAllPets[this.state.dataKey].value}</div>
        )
        
    }
}
