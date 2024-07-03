import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  const metafield = new admin.rest.resources.Metafield({ session: session });
  const url = new URL(request.url);
  const mainProductId: any = url.searchParams.get("mainProductId");
  const productIds = [];
  for (let i = 0; url.searchParams.has(`productIds[${i}]`); i++) {
    const id = url.searchParams.get(`productIds[${i}]`);
    if (id) {
      productIds.push(id);
    } else {
      console.error(`Product at index ${i} is missing id`);
    }
  }
  console.log(productIds, "product ids");
  console.log(typeof productIds);
  const mainId = parseInt(mainProductId);

  const gidJsonString = JSON.stringify(productIds);
  console.log(gidJsonString, "string json ");
  metafield.product_id = mainId;
  metafield.namespace = "custom";
  metafield.key = "recommended_produccts";
  metafield.value = gidJsonString;

  metafield.type = "list.product_reference";
  await metafield.save({
    update: true,
  });

  return json({
    success: true,
    data: metafield,
    message: "Meta field create succesfully",
  });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "POST") {
    const { admin, session } = await authenticate.admin(request);

    // Example: Handle POST request data
    const {
      productIds,
      mainProductId,
    }: { productIds: string[]; mainProductId: number } = await request.json();

    // Example: Save metafield or perform other actions
    const metafield = new admin.rest.resources.Metafield({ session });
    metafield.product_id = mainProductId;
    metafield.namespace = "custom";
    metafield.key = "recommended_products";
    metafield.value = JSON.stringify(productIds);
    await metafield.save({ update: true });

    // Construct your success response
    const response = {
      success: true,
      message: "Action function executed successfully",
    };

    // Return JSON response
    return json(response);
  } else {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
}
