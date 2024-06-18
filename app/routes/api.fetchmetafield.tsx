import { LoaderFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const productId: any = url.searchParams.get("productId");
  const metafieldId: any = url.searchParams.get("metaFieldId");

  const { session, admin } = await authenticate.admin(request);
  const data = await admin.rest.resources.Metafield.find({
    session: session,
    product_id: parseInt(productId),
    id: parseInt(metafieldId),
  });

  console.log(data.value);
  //   const response = await admin.graphql(
  //     `#graphql
  //       query {
  //         product(id: ${data?.value[0]}) {
  //           title
  //           description
  //           onlineStoreUrl
  //         }
  //       }`,
  //   );
  return json({
    success: true,
    data: data,
    message: "Product details",
  });
}
