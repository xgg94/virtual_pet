export const getNewEvents = (events, lastEvent, setLastEvent) => {
    var arr = [];

    if(events.length){
        for (var i = events.length - 1; i >= 0; i--) {
            if(events[i] === lastEvent) {
                break;
            }
            arr.push(events[i]);
        }
        setLastEvent(events[events.length -1]);
    }
    return arr;
};

export const getBoughtEvents = (events, lastEvent, setLastEvent) => {
    var arr = [];

    if(events.length){
        for (var i = events.length - 1; i >= 0; i--) {
            if(events[i] === lastEvent) {
                break;
            }
            if(events[i].event === "Bought"){
                arr.push(events[i]);
            }
        }
        setLastEvent(events[events.length -1]);
    }
    return arr;
};

export const getTradeRequestEvents = (events, lastEvent, setLastEvent) => {
    var arr = [];

    if(events.length){
        for (var i = events.length - 1; i >= 0; i--) {
            if(events[i] === lastEvent) {
                break;
            }
            if(events[i].event === "TradeRequest"){
                arr.push(events[i]);
            }
        }
        setLastEvent(events[events.length -1]);
    }
    return arr;
};

export const getTradeDeclinedEvents = (events, lastEvent, setLastEvent) => {
    var arr = [];

    if(events.length){
        for (var i = events.length - 1; i >= 0; i--) {
            if(events[i] === lastEvent) {
                break;
            }
            if(events[i].event === "TradeDeclined"){
                arr.push(events[i]);
            }
        }
        setLastEvent(events[events.length -1]);
    }
    return arr;
};

