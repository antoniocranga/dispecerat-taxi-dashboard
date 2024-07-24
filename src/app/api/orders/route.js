import { addOrder } from "@/lib/firebase/firebase_methods";
import { GeoPoint } from "@firebase/firestore";

// {order: {placeId: string, phone: string, details: string}}
export async function POST(req) {
  const data = await req.json();
  const order = data;
  const { placeId, phone, details } = order;

  if (!placeId || !phone || !details || details.length < 5) {
    return Response.json(
      { success: false },
      { status: 404, statusText: "Completati toate campurile prezente." }
    );
  }

  if (phone.length < 10) {
    return Response.json(
      {
        success: false,
      },
      {
        status: 404,
        statusText: "Numarul de telefon trebuie sa contina 10 cifre.",
      }
    );
  }

  const coordinates = await getLatLongFromPlaceId(placeId);

  const newOrder = {
    placeId: placeId,
    driverId: "",
    phone: phone,
    details: details,
    created_at: Date.now(),
    status: "pending",
    retries: 0,
    coordinates: new GeoPoint(coordinates.lat, coordinates.lng),
  };
  await addOrder(newOrder);

  return Response.json({ success: true }, { status: 200 });
}

async function getLatLongFromPlaceId(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&placeid=${placeId}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const location = data.result.geometry.location;
      // console.log(location.lat, location.lng);
      return location;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}
