// Import necessary modules
import { LoaderFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import axios from "axios";
import { authenticate } from "~/shopify.server";
import { queryFunction } from "~/utils/queryFunction";

// Function to fetch all products
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;

  try {
    const query = `
      query {
        products(first: 15) {
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
          edges {
            node {
              id
              title
              featuredImage {
                url
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `;

    const { data } = await axios.post(
      `https://${shop}/admin/api/graphql.json`,
      query,
      {
        headers: {
          "Content-Type": "application/graphql",
          "X-shopify-access-token": accessToken,
        },
      },
    );

    return json({ success: true, data: data, message: "data" });
  } catch (error) {
    console.error("Error fetching data:", error);
    return json({ success: false, message: "Error fetching data" });
  }
}
