import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { DeleteIcon } from "@shopify/polaris-icons";

import { useLoaderData } from "@remix-run/react";
import {
  Box,
  Button,
  Card,
  Form,
  FormLayout,
  IndexTable,
  Layout,
  LegacyCard,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  Spinner,
  TextContainer,
  TextField,
  useIndexResourceState,
} from "@shopify/polaris";
import axios from "axios";
import { useState, useEffect } from "react";
import { apiVersion, authenticate } from "~/shopify.server";

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
  console.log("i am loader");
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

interface pageInfomation {
  endCursor: string;
  startCursor: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const Dashboard = () => {
  const loaderData: any = useLoaderData();
  const [pageInformation, setPageInformation] = useState<pageInfomation>({
    endCursor: "",
    startCursor: "",
    hasNextPage: true,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState([]);
  const { pageInfo, edges } = loaderData;

  const [inputValue, setInputValue] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

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

  const handleSubmit = async () => {
    console.log("api call");
    try {
      setIsLoading(true);
      let response = await fetch(
        `/api/search?firstLastValue=first&searchQuery=${inputValue}`,
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

  const resourceIDResolver = (product: any) => product.node.id;

  const { selectedResources, allResourcesSelected } = useIndexResourceState(
    products,
    { resourceIDResolver },
  );

  const promotedBulkActions = [
    // {
    //   content: "Capture payments",
    //   onAction: () => console.log("Todo: implement payment capture"),
    // },
    {
      title: "Add Selected Products",
      actions: [
        {
          content: "Add  Products",
          onAction: () => console.log("Todo: implement adding customers"),
        },
        {
          icon: DeleteIcon,
          destructive: true,
          content: "Delete Products",
          onAction: () => {
            console.log(selectedResources);
          },
        },
      ],
    },
  ];
  const bulkActions = [
    {
      content: "Sort [A-Z]",
      onAction: () => console.log("Todo: implement bulk add tags"),
    },
    {
      content: "Sort [Z-A]",
      onAction: () => console.log("Todo: implement bulk add tags"),
    },
    {
      content: "Sort [0 -9]",
      onAction: () => console.log("Todo: implement bulk remove tags"),
    },
    {
      content: "Sort assending",
      onAction: () => console.log("Todo: implement bulk remove tags"),
    },
    {
      content: "Sort Desending",
      onAction: () => console.log("Todo: implement bulk remove tags"),
    },
  ];

  const rowMarkup = products.map((product: any, index) => {
    const { id, priceRange, title, featuredImage, vendor, createdAt } =
      product.node;
    return (
      <IndexTable.Row
        id={id}
        key={id}
        selected={id === selectedProductId}
        onClick={() => setSelectedProductId(id)}
        position={index}
      >
        <IndexTable.Cell>{title}</IndexTable.Cell>
        <IndexTable.Cell>{createdAt}</IndexTable.Cell>
        <IndexTable.Cell>
          <img src={featuredImage?.url} alt="Products" height={40} width={60} />
        </IndexTable.Cell>
        <IndexTable.Cell>{priceRange?.minVariantPrice?.amount}</IndexTable.Cell>
        <IndexTable.Cell>{vendor}</IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  const handleChange = async (value: string) => {
    setInputValue(value);
  };

  const handleSelectionChange = (selected: string[] | any) => {
    if (selected.length === 0) {
      // Clear selection if no items are selected
      setSelectedProductId(null);
      return;
    }
    setSelectedProductId(selected[0]);
  };
  // console.log(products);
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <h1>Dashboard</h1>
        </Layout.Section>

        <Layout.Section>
          <Form noValidate onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                label
                value={inputValue}
                onChange={(value) => handleChange(value)}
                placeholder="Search products"
                type="search"
                autoComplete="off"
              />

              <Button submit>Search</Button>
            </FormLayout>
          </Form>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <h1>All products</h1>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Box paddingBlockEnd="400">
              <IndexTable
                itemCount={products?.length}
                selectedItemsCount={
                  allResourcesSelected ? "All" : selectedResources.length
                }
                bulkActions={bulkActions}
                promotedBulkActions={promotedBulkActions}
                onSelectionChange={handleSelectionChange}
                headings={[
                  { title: "Title" },
                  { title: "Date" },
                  { title: "Product" },
                  { title: "Total", alignment: "end" },
                  { title: "Vendor" },
                ]}
                pagination={{
                  hasNext: pageInformation.hasNextPage,
                  hasPrevious: pageInformation.hasPreviousPage,
                  onNext: () => {
                    handleNextPagination();
                  },
                  onPrevious: () => {
                    handlePrevPagination();
                  },
                  label: "Total products",
                }}
              >
                {isLoading ? (
                  <div className="text-2xl flex items-center justify-center h-40 w-[55vw] mx-auto">
                    <Spinner
                      accessibilityLabel="Spinner example"
                      size="large"
                    />
                  </div>
                ) : (
                  rowMarkup
                )}
              </IndexTable>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Dashboard;
