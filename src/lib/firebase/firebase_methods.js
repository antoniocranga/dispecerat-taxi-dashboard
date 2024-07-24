import { addDoc, collection, doc, updateDoc } from "@firebase/firestore";
import { firestoreDb, realtimeDb, auth } from "./firebase";
import { ref, update } from "firebase/database";

async function updateOrder(order) {
  const { id, ...orderData } = order;

  const orderRef = doc(firestoreDb, "orders", id);

  await updateDoc(orderRef, {
    ...orderData,
    updated_at: Date.now(),
  });
}

async function updateDriver(driver) {
  const { id, ...driverData } = driver;

  const driverRef = ref(realtimeDb, "drivers/" + id);

  await update(driverRef, {
    ...driverData,
    updated_at: Date.now(),
  });
}

async function addOrder(order) {
  await addDoc(collection(firestoreDb, "orders"), order);
}

// const signInWithEmailAndPassword = async (email, password) => {
//   try {
//     const result = await auth.signInWithEmailAndPassword(email, password);
//     console.log(result);
//     console.log("User logged in with success");
//   } catch (error) {
//     console.error("Error signing in:", error.message);
//     throw error;
//   }
// };

// const signOut = async () => {
//   try {
//     await auth.signOut();
//   } catch (error) {
//     console.error("Error signing out:", error.message);
//   }
// };

export { updateOrder, updateDriver, addOrder };
