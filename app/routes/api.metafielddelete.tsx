import { LoaderFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const metaFieldId: any = url.searchParams.get("metaFieldId");
  console.log(metaFieldId, "main product ids");
  const productIds = [];
  for (let i = 0; url.searchParams.has(`productIds[${i}]`); i++) {
    const id = url.searchParams.get(`productIds[${i}]`);
    if (id) {
      productIds.push(id);
    } else {
      console.error(`Product at index ${i} is missing id`);
    }
  }
  console.log(productIds, "delete product ids");
  const mainId = parseInt(metaFieldId);

  const gidJsonString = JSON.stringify(productIds);

  const metafieldData = await admin.rest.resources.Metafield.delete({
    session: session,
    product_id: gidJsonString,
    id: mainId,
  });

  return json({
    success: true,
    data: metafieldData,
    message: "Meta field Deleted succesfully",
  });
}
