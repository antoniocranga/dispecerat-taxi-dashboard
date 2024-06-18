"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { realtimeDb } from '../firebase/firebase';
import { onValue, ref } from "firebase/database";


export const DriversContext = createContext();

export const DriversProvider = ({ children }) => {
    const [drivers, setDrivers] = useState(null);
    const [highlitedDriver, setHighlitedDriver] = useState(null);

    function getDrivers() {
        const driversRef = ref(realtimeDb, 'drivers');
        onValue(driversRef, (snapshot) => {
            const data = snapshot.val();
            
            var drivers = {};
            if(data){
                drivers = Object.keys(data).map((key, index) => {
                    const driver = data[key];
                    console.log(driver);
                    return {
                        ...driver,
                        id: key
                    }
                });
            }

            console.log(drivers);
            setDrivers(drivers);
        })
    }
    
    useEffect(() => {

        getDrivers()
    }, []);

    return (
        <DriversContext.Provider value={{
            drivers: drivers,
            highlitedDriver,
            setHighlitedDriver
        }}>
            {children}
        </DriversContext.Provider>
    )
}

export function useDriversContext() {
    return useContext(DriversContext);
}