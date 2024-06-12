import { LoaderFunctionArgs } from "@remix-run/node";
import React from "react";

export function loader({ request }: LoaderFunctionArgs | any) {
  const method = request.method;
  console.log(method);

  return 1;
}

const DashboardPage = () => {
  return <div>Dashboard page</div>;
};

export default DashboardPage;
