import { realtimeDb, firestoreDb } from "@/lib/firebase/firebase";
import { addOrder } from "@/lib/firebase/firebase_methods";
import { GeoPoint, Timestamp, addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "@firebase/firestore";
import { child, get, ref, update } from "firebase/database";

// {order: {placeId: string, phone: string, details: string}}
export async function POST(req) {
    const data = await req.json();
    const order = data;
    const { placeId, phone, details } = order;

    const coordinates = await getLatLongFromPlaceId(placeId);

    const newOrder = {
        placeId: placeId,
        driverId: '',
        phone: phone,
        details: details,
        created_at: Date.now(),
        status: 'pending',
        retries: 0,
        coordinates: new GeoPoint(coordinates.lat, coordinates.lng) 
    }
    await addOrder(newOrder);
    
    return Response.json({ success: true });
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
