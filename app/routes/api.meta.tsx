import { LoaderFunctionArgs, json } from "@remix-run/node";
import axios from "axios";
import { apiVersion, authenticate } from "~/shopify.server";

// Define the GraphQL mutation query function
const queryF = (mainProductId: any, productIds: any) => {
  return `mutation {
    productUpdate(input: {
      id: "${mainProductId}",
      metafields: [
        {
          namespace: "custom",
          key: "recommended_products",
          value: "[${productIds}]", 
          type: "list.product_reference"
        }
      ]
    }) {
      product {
        metafields(first: 100) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
      }
    }
  }`;
};

const anotherQuery = `
mutation {
  productUpdate(input: {
    id: "gid://shopify/Product/7947109793964",
    metafields: [
      {
        namespace: "custom",
        key: "recommended_produccts",
        value: "[\"gid://shopify/Product/7953660510380\"]"
        type: "list.product_reference"
      } 
    ]
  }) {
    product {
      metafields(first: 100) {
        edges {
          node {
            namespace
            key
            value
          }
        }
      }
    }
  }
}

`;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Authenticate and get session information
    const { session } = await authenticate.admin(request);
    const { shop, accessToken } = session;

    const url = new URL(request.url);
    const mainProductId = url.searchParams.get("mainProductId");
    const productIds = [];
    for (let i = 0; url.searchParams.has(`productIds[${i}]`); i++) {
      const id = url.searchParams.get(`productIds[${i}]`);
      if (id) {
        productIds.push(id);
      } else {
        console.error(`Product at index ${i} is missing id`);
      }
    }

    const graphQlId = productIds.map((id) => `"//${id}//"`);
    const graphqlQuery = queryF(mainProductId, graphQlId);
    console.log(graphqlQuery);

    fetch(
      `https://${shop}.myshopify.com/admin/api/${apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/graphql",
          "X-Shopify-Access-Token": `${accessToken}`,
        },
        body: anotherQuery,
      },
    )
      .then((response) => response.json())
      .then((data) => console.log(data));

    return json({
      status: 200,
      data: "",
      message: "Product metafield updated successfully",
    });
  } catch (error: any) {
    // Return JSON response with error status and details
    return json({
      status: 400,
      data: [],
      error: error?.message || "Unknown error occurred",
    });
  }
};
