import { realtimeDb } from "@/lib/firebase/firebase";
import { updateDriver } from "@/lib/firebase/firebase_methods";
import { ref } from "firebase/database";

// {driver: {id: string, lat: number, long: number}}
export async function PATCH(req) {
    console.log(req);
    const data = await req.json();
    const { driver } = data;

    await updateDriver(driver);

    return Response.json({success: true});
}