import React, {useState, useEffect} from 'react'

export default function EventListener({drizzle, drizzleState, user}) {

    const [events, setEvents] = useState([]);
    const [lastEvent, setLastEvent] = useState(null);

    useEffect(() => {
        var arr = [];
        const allATMEvents = drizzleState.contracts.ATM.events;
        if(allATMEvents.length){
            for (var i = allATMEvents.length - 1; i >= 0; i--) {
                if(allATMEvents[i] === lastEvent) {
                    break;
                }
                arr.push(allATMEvents[i]);
            }

            setEvents(arr);
            setLastEvent(allATMEvents[allATMEvents.length -1]);
        }
    
        console.log(arr);
        
    }, [drizzleState.contracts.ATM.events]);

    const renderEvents = () => {
        return(
        events.map((opt, index) => 
            <div key={index}>
                <p>{opt.event}</p>
            </div>
        ));
    }

    return (
        <div>EventListener: {renderEvents()}</div>
    )

}
