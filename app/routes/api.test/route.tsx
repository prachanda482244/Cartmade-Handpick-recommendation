import {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log(request, "Loader request");
  const { admin, session } = await authenticate.admin(request);
  // const metafield = new admin.rest.resources.Metafield({ session: session });
  // const url = new URL(request.url);
  // const mainProductId: any = url.searchParams.get("mainProductId");
  // const productIds = [];
  // for (let i = 0; url.searchParams.has(`productIds[${i}]`); i++) {
  //   const id = url.searchParams.get(`productIds[${i}]`);
  //   if (id) {
  //     productIds.push(id);
  //   } else {
  //     console.error(`Product at index ${i} is missing id`);
  //   }
  // }
  // console.log(productIds, "product ids");
  // console.log(typeof productIds);
  // const mainId = parseInt(mainProductId);

  // const gidJsonString = JSON.stringify(productIds);
  // console.log(gidJsonString, "string json ");
  // metafield.product_id = mainId;
  // metafield.namespace = "custom";
  // metafield.key = "recommended_produccts";
  // metafield.value = gidJsonString;

  // metafield.type = "list.product_reference";
  // await metafield.save({
  //   update: true,
  // });

  return json({
    success: true,
    data: request,
    message: "Meta field create succesfully",
  });
}

export const action: ActionFunction = async ({ request }) => {
  console.log(authenticate, "action request");
  console.log(authenticate.admin, "admin request");
  try {
    const { admin, session } = await authenticate.admin(request);
    console.log(admin, "Admin data");

    const response = await admin.graphql(
      `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
          }
        }
      }`,
      {
        variables: {
          input: {
            title: "New product",
            variants: [{ price: 100 }],
          },
        },
      },
    );
    const parsedResponse = await response.json();

    return json({ data: parsedResponse.data });
  } catch (error: any) {
    return json({ error: true, data: error?.message }, { status: 500 });
  }
};
