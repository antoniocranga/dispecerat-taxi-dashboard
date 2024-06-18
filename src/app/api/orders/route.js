import { realtimeDb, firestoreDb } from "@/lib/firebase/firebase";
import { updateDriver, updateOrder } from "@/lib/firebase/firebase_methods";
import { Timestamp, addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "@firebase/firestore";
import { child, get, ref, update } from "firebase/database";

// {order: {placeId: string, phone: string, details: string}}
export async function POST(req) {
    const data = await req.json();
    const order = data;
    const { placeId, phone, details } = order;

    const bestDriver = await getBestDriverByPlaceId(placeId);

    if(bestDriver == null) {
        return Response.json({success: false, message: "Driver not found"}, {status: 404});
    }

    const newOrder = {
        placeId: placeId,
        driverId: bestDriver.id,
        phone: phone,
        details: details,
        created_at: Date.now(),
        status: 'pending'
    }

    const orderSnap = await addDoc(collection(firestoreDb, "orders"), newOrder);

    await updateDriver({ id: bestDriver.id, orderId: orderSnap.id });

    return Response.json({ success: true });
}

// {order: {id: string, status: string}}
export async function PATCH(req) {
    const data = await req.json();
    const { order } = data;
    const { id, status } = order;

    if (status == 'accepted') {
        await updateDoc(doc(firestoreDb, "orders", id), { status: 'accepted' });
        await updateDriver({
            available: false,
            orderId: id
        });
    } else if (status == 'declined') {
        const orderRef = doc(firestoreDb, "orders", id);
        const orderSnap = await getDoc(orderRef);
        if(!orderSnap.exists()) {
            return Response.json({success: false}, {status: 404});
        }
        const data = { ...orderSnap.data(), id: orderSnap.id };
        const { placeId } = data;
        const bestDriver = await getBestDriverByPlaceId(placeId);
        
        if(bestDriver == null) {
            return Response.json({success: false, message: "Driver not found"}, {status: 404});
        }

        await updateOrder({
            driverId: bestDriver.id
        });
        await updateDriver({
            orderId: data.id
        });
    }
    return Response.json({ succes: true });
}

async function getBestDriverByPlaceId(placeId) {
    const locationByPlaceId = await getLatLongFromPlaceId(placeId);
    const bestDriver = await findBestDriver(locationByPlaceId.lat, locationByPlaceId.lng);
    return bestDriver;
}

async function getLatLongFromPlaceId(placeId) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&placeid=${placeId}`
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            const location = data.result.geometry.location;
            // console.log(location.lat, location.lng);
            return location;
        }
        else {
            return null;
        }
    } catch (e) {
        return null;
    }
}

async function getDriversWithinRadius(lat, long, radius, drivers) {
    const driversWithinRadius = [];

    for (const [key, driver] of Object.entries(drivers)) {
        const distance = calculateDistance(lat, long, driver.lat, driver.long);
        // console.log({distance: distance, key: key, driver: driver})
        if (distance <= radius) {
            driversWithinRadius.push({ ...driver, id: key });
        }
    }

    return driversWithinRadius;
}

function calculateDistance(lat1, long1, lat2, long2) {
    // console.log([lat1, lat2, long1, long2]);
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (long2 - long1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    return d;
}

async function filterDriversByAvailability(drivers) {
    const availableDrivers = drivers.filter(driver => driver.available);
    if (availableDrivers.length === 0) {
        return null;
    }

    return availableDrivers;
}

async function filterDriverByOrders(drivers) {
    if(drivers == null) {
        return null;
    }
    var availableDrivers = JSON.parse(JSON.stringify(drivers));
    for (const [key, driver] of Object.entries(availableDrivers)) {
        const orders = await getOrdersByDriverId(driver.id);
        availableDrivers[key].orders = orders;
    }

    availableDrivers.sort((a, b) => a.orders - b.orders);

    const minOrderDriver = availableDrivers[0];
    return minOrderDriver;
}

async function findBestDriver(lat, long) {
    let radius = 100;

    const driversRef = ref(realtimeDb, 'drivers');

    const snapshot = await get(driversRef);
    const drivers = snapshot.val();

    while (radius < 2000) {
        const driversWithinRadius = await getDriversWithinRadius(lat, long, radius, drivers);

        if (driversWithinRadius.length > 0) {
            var driversCopy = driversWithinRadius;
            driversCopy = await filterDriversByAvailability(driversCopy);
            const bestDriver = await filterDriverByOrders(driversCopy);
            if (bestDriver) {
                return bestDriver;
            }
        }
        radius += 100;
    }
    return null;
}

async function getOrdersByDriverId(driverId) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const ordersRef = collection(firestoreDb, 'orders');
    const ordersQuery = query(
        ordersRef,
        where('driverId', '==', driverId),
        where('created_at', '>=', Timestamp.fromDate(todayStart).seconds),
        // where('created_at', '<=', Timestamp.fromDate(todayEnd).seconds)
    );

    const querySnapshot = await getDocs(ordersQuery);
    console.log(querySnapshot.size);
    return querySnapshot.size;
}