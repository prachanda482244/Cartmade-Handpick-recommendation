import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import axios from "axios";
import { useState, useEffect } from "react";
import { apiVersion, authenticate } from "~/shopify.server";
import { Products, pageInformation } from "~/config/typeConfig";
import DataTableComponent from "~/components/DataTableComponent";
export const query = `
{
  products(first:10) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    edges {
      node {
        id
        status
        totalInventory
         metafields(first:1 , keys:["custom.recommended_produccts"]) { 
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        title
        createdAt
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
  }
}
`;

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;

  try {
    const { data } = await axios.post(
      `https://${shop}/admin/api/${apiVersion}/graphql.json`,
      query,
      {
        headers: {
          "Content-Type": "application/graphql",
          "X-shopify-access-token": accessToken,
        },
      },
    );

    const {
      data: {
        products: { pageInfo, edges },
      },
    } = data;
    return { pageInfo, edges, shop, accessToken, apiVersion };
  } catch (error) {
    console.log(error);
  }
  return [];
};

const Dashboard = () => {
  const loaderData: any = useLoaderData();
  const [pageInformation, setPageInformation] = useState<pageInformation>({
    endCursor: "",
    startCursor: "",
    hasNextPage: true,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Products[]>([]);
  const { pageInfo, edges } = loaderData;
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    setProducts(edges);
    setPageInformation(pageInfo);
  }, [pageInfo]);

  const handleNextPagination = async () => {
    setIsLoading(true);
    let response = await fetch(
      `/api/pagination?firstLastValue=first&afterBeforeValue=after&pageToken=${pageInformation.endCursor}`,
    );
    let { data } = await response.json();
    setIsLoading(false);
    const { products } = data;
    const { pageInfo, edges } = products;
    setPageInformation(pageInfo);
    setProducts(edges);
  };

  const handlePrevPagination = async () => {
    setIsLoading(true);
    let response = await fetch(
      `/api/pagination?firstLastValue=last&afterBeforeValue=before&pageToken=${pageInformation.startCursor}`,
    );
    let { data } = await response.json();
    setIsLoading(false);
    const { products } = data;
    const { pageInfo, edges } = products;
    setPageInformation(pageInfo);
    setProducts(edges);
  };

  const handleSubmit = async (value: string) => {
    try {
      setIsLoading(true);
      let response = await fetch(
        `/api/search?firstLastValue=first&searchQuery=${value}`,
      );
      const { data } = await response.json();
      const { products } = data;
      const { pageInfo, edges } = products;
      setPageInformation(pageInfo);
      setProducts(edges);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (value: string) => {
    setInputValue(value);
  };

  return (
    <Page title="Dashboard" fullWidth={true}>
      <Layout>
        <Layout.Section>
          <Card>
            <div className="flex items-center justify-between py-1 ">
              <h1 className="text-lg tracking-wide font-semibold">
                All products
              </h1>
              <Form noValidate onSubmit={() => handleSubmit(inputValue)}>
                <FormLayout>
                  <div className="flex items-center gap-2">
                    <TextField
                      label=""
                      value={inputValue}
                      onChange={handleChange}
                      placeholder="Search products"
                      type="search"
                      autoComplete="off"
                    />

                    <Button variant="secondary" submit>
                      Search
                    </Button>
                  </div>
                </FormLayout>
              </Form>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <DataTableComponent
            pageInformation={pageInformation}
            handleNextPagination={handleNextPagination}
            handlePrevPagination={handlePrevPagination}
            products={products}
            isLoading={isLoading}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Dashboard;
