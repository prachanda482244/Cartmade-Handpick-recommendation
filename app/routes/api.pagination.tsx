import { LoaderFunctionArgs, json } from "@remix-run/node";
import axios from "axios";
import { authenticate } from "~/shopify.server";
import { queryFunction } from "~/utils/queryFunction";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const firstLastValue = url.searchParams.get("firstLastValue");
  const afterBeforeValue = url.searchParams.get("afterBeforeValue");
  const pageToken = url.searchParams.get("pageToken");

  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;

  try {
    const { data } = await axios.post(
      `https://${shop}/admin/api/graphql.json`,
      queryFunction(firstLastValue, afterBeforeValue, pageToken),
      {
        headers: {
          "Content-Type": "application/graphql",
          "X-shopify-access-token": accessToken,
        },
      },
    );

    return json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return json({ success: false, message: "Error fetching data" });
  }
}
