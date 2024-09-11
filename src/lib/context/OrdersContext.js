"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { realtimeDb, firestoreDb } from "../firebase/firebase";
import { onValue, ref } from "firebase/database";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "@firebase/firestore";
import { useAuthentication } from "./AuthContext";

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const { loading, user } = useAuthentication();
  const [pendingOrders, setPendingOrders] = useState(null);
  const [noDriverOrders, setNoDriverOrders] = useState(null);

  function listenToOrders() {
    const ordersRef = collection(firestoreDb, "orders");
    const pendingQuery = query(ordersRef, where("status", "==", "pending"));
    onSnapshot(pendingQuery, (snapshot) => {
      const orders = [];
      snapshot.docs.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });

      setPendingOrders(orders);
    });

    const noDriverQuery = query(
      ordersRef,
      where("status", "==", "no_driver_found")
    );
    onSnapshot(noDriverQuery, (snapshot) => {
      const orders = [];
      snapshot.docs.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });

      setNoDriverOrders(orders);
    });
  }

  useEffect(() => {
    if (!loading && user) {
      listenToOrders();
    }
  }, [loading, user]);

  function manualRetryOrder(id) {
    updateDoc(doc(firestoreDb, "orders", id), {
      retries: 0,
      status: "pending",
      blacklist: [],
    });
  }

  return (
    <OrdersContext.Provider
      value={{
        pendingOrders: pendingOrders,
        noDriverOrders: noDriverOrders,
        manualRetryOrder
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export function useOrdersContext() {
  return useContext(OrdersContext);
}
