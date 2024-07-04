import { LoaderFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const metafieldId = url.searchParams.get("metaFieldId");

    if (!productId || !metafieldId) {
      return json(
        { success: false, message: "Product ID or Metafield ID is missing" },
        { status: 400 },
      );
    }

    const { session, admin } = await authenticate.admin(request);

    const metafieldData: any = await admin.rest.resources.Metafield.find({
      session,
      product_id: parseInt(productId),
      id: parseInt(metafieldId),
    });

    const productQueryIds = JSON.parse(metafieldData?.value || "[]");

    if (!Array.isArray(productQueryIds) || productQueryIds.length === 0) {
      return json({
        success: true,
        data: [],
        message: "No product IDs found in metafield",
      });
    }

    const GET_PRODUCTS_BY_IDS_QUERY = `
    query GetProductsByIds($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          title
          description
          totalInventory
          vendor
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
    }`;

    const response = await admin.graphql(GET_PRODUCTS_BY_IDS_QUERY, {
      variables: {
        ids: productQueryIds,
      },
    });
    const productDetails: any = await response.json();

    const mainData = productDetails.data.nodes;
    return json({
      success: true,
      data: mainData,
      message: "Product details fetched successfully",
    });
  } catch (error: any) {
    console.error("Error fetching product details:", error.message);
    return json(
      {
        success: false,
        message: "Failed to fetch product details",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
