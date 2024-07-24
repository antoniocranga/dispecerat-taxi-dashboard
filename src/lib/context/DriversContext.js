"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { realtimeDb, firestoreDb } from "../firebase/firebase";
import { onValue, ref } from "firebase/database";
import { doc, getDoc } from "@firebase/firestore";
import { useAuthentication } from "./AuthContext";

export const DriversContext = createContext();

export const DriversProvider = ({ children }) => {
  const [drivers, setDrivers] = useState(null);
  const [highlitedDriver, setHighlitedDriver] = useState(null);
  const { loading, user } = useAuthentication();

  function getDrivers() {
    const driversRef = ref(realtimeDb, "drivers");
    onValue(
      driversRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setDrivers([]);
          return;
        }

        const drivers = data
          ? Object.entries(data)
              .map(([key, driver]) => ({
                ...driver,
                id: key,
              }))
              .filter((e) => e.online == true)
          : [];

        const promises = drivers.map(async (driver) => {
          const driverDetails = await fetchDriverDetails(driver.id);
          return {
            ...driverDetails,
            ...driver,
          };
        });

        Promise.all(promises)
          .then((updatedDrivers) => {
            setDrivers(updatedDrivers);
          })
          .catch((error) => {
            console.log("Error fetching driver details:", error);
          });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  async function fetchDriverDetails(driverId) {
    try {
      const driverDocRef = doc(firestoreDb, "drivers", driverId);
      const docSnap = await getDoc(driverDocRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  useEffect(() => {
    if (!loading && user) {
      getDrivers();
    }
  }, [loading, user]);

  return (
    <DriversContext.Provider
      value={{
        drivers: drivers,
        highlitedDriver,
        setHighlitedDriver,
        fetchDriverDetails,
      }}
    >
      {children}
    </DriversContext.Provider>
  );
};

export function useDriversContext() {
  return useContext(DriversContext);
}
