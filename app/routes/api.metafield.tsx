import { LoaderFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  const metafield = new admin.rest.resources.Metafield({ session: session });
  const url = new URL(request.url);
  const mainProductId: any = url.searchParams.get("mainProductId");
  console.log(mainProductId, "main product  ids");
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
  const mainId = parseInt(mainProductId);
  console.log(typeof mainId);

  const gidJsonString = JSON.stringify(productIds);
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
