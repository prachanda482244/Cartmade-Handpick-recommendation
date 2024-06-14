import { LoaderFunctionArgs, json } from "@remix-run/node";
import axios from "axios";
import { authenticate } from "~/shopify.server";
import { queryFunction } from "~/utils/queryFunction";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const firstLastValue = url.searchParams.get("firstLastValue");
    const searchQuery = url.searchParams.get("searchQuery");
    console.log(searchQuery, "search value");

    const { session } = await authenticate.admin(request);
    const { shop, accessToken } = session;

    const { data } = await axios.post(
      `https://${shop}/admin/api/graphql.json`,
      queryFunction({
        firstLastValue: firstLastValue,
        searchQuery: searchQuery,
      }),
      {
        headers: {
          "Content-Type": "application/graphql",
          "X-shopify-access-token": accessToken,
        },
      },
    );

    return json({ search: searchQuery, data: data });
  } catch (error) {
    console.error(error);
  }
}
