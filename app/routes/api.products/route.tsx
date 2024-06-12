import { LoaderFunctionArgs, json } from "@remix-run/node";
import db from "../../db.server";
export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method !== "GET") return;
  const data = await db.product.findFirst();
  return json({ success: true, data: data, message: "Your response" });
}
