import { updateDriver } from "@/lib/firebase/firebase_methods";

// {driver: {id: string, lat: number, long: number}}
export async function PATCH(req) {
  const data = await req.json();
  const { driver } = data;

  await updateDriver(driver);

  return Response.json({ success: true });
}
