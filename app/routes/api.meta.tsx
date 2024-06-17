import { LoaderFunctionArgs, json } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log(request);
  return json({ data: "messgae" });
}
