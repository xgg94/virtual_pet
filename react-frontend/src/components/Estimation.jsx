import React, { useState, useEffect, useRef } from 'react';

function EstimationLevel({level}) {

    //timer
    const [levelTimer, setLevelTimer] = useState(0);
    //timer intervall in ms
    const [levelDelay, setLevelDelay] = useState(10000);
    const [isLevelRunning, setIsLevelRunning] = useState(false);
    const [estimatedLevel, setEstimatedLevel] = useState(0);

    //updating estimated values on drizzle state change
    useEffect(() => {
        console.log("update level");
        setEstimatedLevel(level);
        setIsLevelRunning(false);
        setLevelTimer(0);
        setIsLevelRunning(true);
    }, [level]);

    //starts timer and sets estimated level
    useInterval(() => {
        setLevelTimer(levelTimer + 1);
        setEstimatedLevel(Number(level) + Number(levelTimer) +1);
        console.log("Level: " + levelTimer);
        
    }, isLevelRunning ? levelDelay : null);

    return (
        <div className='petAttribute'>
            <div>Level: </div>
            <div>{estimatedLevel}</div>
        </div>
    )
}

function EstimationHealth({health}) {
    const [healthTimer, setHealthTimer] = useState(0);
    const [healthDelay, setHealthDelay] = useState(60000);
    const [isHealthRunning, setIsHealthRunning] = useState(false);
    const [estimatedHealth, setEstimatedHealth] = useState(null);

    //updating estimated values on drizzle state change
    useEffect(() => {
        console.log("update health");
        setEstimatedHealth(health);
        setIsHealthRunning(false);
        setHealthTimer(0);
        setIsHealthRunning(true);
    }, [health]);

    //starts timer and sets estimated level
    useInterval(() => {
        setHealthTimer(healthTimer + 1);
        if((Number(health) - Number(healthTimer) - 1) <= 0){
            setIsHealthRunning(false);
            setEstimatedHealth(0);
        }
        setEstimatedHealth(Number(health) - Number(healthTimer) - 1);
        console.log("Health: " + healthTimer);
        
    }, isHealthRunning ? healthDelay : null);

    return (
        <div className='petAttribute'>
            <div>Health: </div>
            <div>{estimatedHealth}/100</div>
        </div>
    )
}

export {
    EstimationLevel,
    EstimationHealth
}



//starting timer
function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
        if (delay !== null) {
            let id = setInterval(() => {
                savedCallback.current();
            }, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}
