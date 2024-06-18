// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { realtimeDb } from '../firebase/firebase';
// import { onValue, ref } from "firebase/database";


// export const OrdersContext = createContext();

// export const OrdersProvider = ({ children }) => {
//     const [orders, setOrders] = useState(null);
//     const [selectedOrder, setSelectedOrder] = useState(null);

//     function getDrivers() {
//         const driversRef = ref(realtimeDb, 'drivers');
//         onValue(driversRef, (snapshot) => {
//             const data = snapshot.val();

//             const drivers = data ? Object.entries(data).map(([key, driver]) => ({
//                 ...driver,
//                 id: key
//             })) : [];

//             setOrders(drivers);
//         });
//     }

//     useEffect(() => {

//         getDrivers()
//     }, []);

//     return (
//         <OrdersContext.Provider value={{
//             orders,
//             selectedOrder,
//             setSelectedOrder
//         }}>
//             {children}
//         </OrdersContext.Provider>
//     )
// }

// export function useOrdersContext() {
//     return useContext(OrdersContext);
// }