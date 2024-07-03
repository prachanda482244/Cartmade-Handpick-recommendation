import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const response = await request.json();
  return json({
    id: "",
    data: "data",
    request: response,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { reponse, anotherId } = await request.json();
  console.log(reponse, "reponse");
  console.log(anotherId, "reponse");
  return json({
    id: "",
    data: "data",
    request: reponse,
    anothid: anotherId,
  });
}
