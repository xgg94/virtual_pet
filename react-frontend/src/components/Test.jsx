import React from "react";

export default class DisplayValue extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {tokenKey: "", tokenAmount: ""};
    }
  

  componentDidUpdate(prevProps, prevState) {
    const {drizzleState, drizzle} = this.props;

    //contract wo du die Daten ziehen willst
    const contractATM = drizzle.contracts.ATM;

    // let drizzle know we want to watch the `all Pets` method
    const tokenKey = contractATM.methods["getTokenAmount"].cacheCall({
        //from: drizzleState.accounts[0] - alternativ (ich übergebe einen user in die props)
        from: this.props.user
    });
    
    const { ATM } = this.props.drizzleState.contracts;

    //daten holen und state ändern (erzwingt rerender)
    const key = ATM.getTokenAmount[tokenKey];
    if(key){
        if(key.value !== null ){
            console.log(key.value);
            this.setState({tokenKey: tokenKey, tokenAmount: key.value});
        }
    }
  }

  render() {
    return (
        <div>
            <p>amount: </p>
            {this.state.tokenAmount}
        </div>
    );
  }
}

//ACHTUNG: SOBALD SICH IRGENDWAS IN DRIZZLE ODER DRIZZLESTATE ÄNDERT BEI DEN PROPS KOMMT ES ZU RERENDER
//SPRICH CA 80 MAL HAHA - ALSO ICH WÜRDE NICHT ALLE PROPS SONDER NUR DRIZZLE STATE ÜBERWACHEN BEI COMPONENT DID UPDATE
