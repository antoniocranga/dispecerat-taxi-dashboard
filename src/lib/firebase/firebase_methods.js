import { doc, updateDoc } from "@firebase/firestore";
import { firestoreDb, realtimeDb } from "./firebase";
import { ref, update } from "firebase/database";

async function updateOrder(order) {
    const {id, ...orderData} = order;
    
    const orderRef = doc(firestoreDb, "orders", id);

    await updateDoc(orderRef, {
        ...orderData,
        updated_at: Date.now()
    });
}

async function updateDriver(driver) {
    const {id, ...driverData} = driver;

    const driverRef = ref(realtimeDb, 'drivers/' + id);

    await update(driverRef, {
        ...driverData,
        updated_at: Date.now()
    })
}

export {updateOrder, updateDriver}