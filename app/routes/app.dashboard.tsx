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
  Page,
  Spinner,
  TextField,
  useIndexResourceState,
} from "@shopify/polaris";
import axios from "axios";
import { useState, useEffect } from "react";
import { apiVersion, authenticate } from "~/shopify.server";
import { pageInfomation } from "~/config/typeConfig";
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
  const [pageInformation, setPageInformation] = useState<pageInfomation>({
    endCursor: "",
    startCursor: "",
    hasNextPage: true,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any>([]);
  const { pageInfo, edges } = loaderData;
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [subProducts, setSubProducts] = useState([]);

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

  const resourceIDResolver = (product: any) => product.node.id;

  const { selectedResources, allResourcesSelected } = useIndexResourceState(
    products,
    {
      resourceIDResolver,
    },
  );

  const promotedBulkActions = [
    {
      title: "Add Selected Products",
      actions: [
        {
          content: "Add Products",
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
      content: "Sort ascending",
      onAction: () => console.log("Todo: implement bulk remove tags"),
    },
    {
      content: "Sort descending",
      onAction: () => console.log("Todo: implement bulk remove tags"),
    },
  ];
  const [metaFieldId, setMetaFieldId] = useState<string>("");

  const handleToggleAccordion = async (
    productId: string,
    metafieldId?: any,
  ) => {
    setSelectedProductId(selectedProductId === productId ? null : productId);

    // Conditionally set the metafield ID if it exists
    setMetaFieldId(
      metafieldId ? (metaFieldId === metafieldId ? null : metafieldId) : null,
    );

    // Hide the accordion or related UI component
    setIsVisible(false);

    if (metafieldId) {
      const metaIdParts: any = metafieldId?.split("/");
      const metaId = metaIdParts[metaIdParts?.length - 1];

      const productParts: any = productId?.split("/");
      const product_id = productParts[productParts?.length - 1];

      try {
        const response = await fetch(
          `/api/fetchmetafield?productId=${product_id}&metaFieldId=${metaId}`,
        );

        if (response.ok) {
          const { data } = await response.json();
          setSubProducts(data[0]);
        } else {
          console.error("Failed to fetch metafield data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching metafield data:", error);
      }
    } else {
      console.log("No valid metafield ID provided. Skipping fetch operation.");
    }
  };

  console.log(subProducts, "subproducts");
  const handleSelectionChange = (selected: string[] | any) => {
    console.log(selected.length, "selected");
    setSelectedProductId(selected.length > 0 ? selected[0] : null);
  };

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleAddRelatedProduct = async () => {
    try {
      // Use Shopify App Bridge to pick products
      const selected = await shopify.resourcePicker({
        type: "product",
        multiple: 4,
        filter: {
          variants: false,
          archived: false,
          draft: false,
        },
      });

      // Extract and map the product IDs to an array
      const productIds = selected?.map(({ id }) => id);

      // Serialize the product IDs into a query string format
      const queryString = productIds
        ?.map((id, index) => `productIds[${index}]=${encodeURIComponent(id)}`)
        .join("&");

      // Send the request to the server
      // const response = await fetch(
      //   `/api/meta?${queryString}&mainProductId=${selectedProductId}`,
      // );
      const parts: any = selectedProductId?.split("/");
      const productId = parseInt(parts[parts.length - 1]);
      console.log(productId);
      const response = await fetch(
        `/api/metafield?${queryString}&mainProductId=${productId}`,
      );

      // Handle the server response
      const data = await response.json();
      console.log("Metafield data:", data);
    } catch (error) {
      console.error(
        "Error selecting products or fetching metafield data:",
        error,
      );
    }
  };

  const rowMarkup = products.map((product: any, index: number) => {
    const {
      id,
      priceRange,
      title,
      metafields,
      featuredImage,
      vendor,
      createdAt,
    } = product.node;

    let metafieldId: any = null;
    if (metafields && metafields.edges) {
      const { edges = [] } = metafields;

      if (Array.isArray(edges) && edges.length > 0) {
        for (const edge of edges) {
          if (edge.node && edge.node.id) {
            metafieldId = edge.node.id;
            break;
          }
        }
      }
    }

    const isExpanded = selectedProductId === id;
    return (
      <>
        <IndexTable.Row
          key={id}
          id={id}
          selected={isExpanded}
          onClick={() =>
            metafieldId
              ? handleToggleAccordion(id, metafieldId)
              : handleToggleAccordion(id)
          }
          position={index}
        >
          <IndexTable.Cell>
            <img
              src={featuredImage?.url}
              alt="Product"
              height={30}
              width={50}
            />
          </IndexTable.Cell>
          <IndexTable.Cell className="">{title}</IndexTable.Cell>
          <IndexTable.Cell>{createdAt}</IndexTable.Cell>

          <IndexTable.Cell>
            {priceRange?.minVariantPrice?.amount}
          </IndexTable.Cell>
          <IndexTable.Cell>{vendor}</IndexTable.Cell>
        </IndexTable.Row>

        {isExpanded && (
          <div className="border w-[30vw]">
            <div>{title}</div>
            <div>
              {!isVisible && (
                <button
                  onClick={handleAddRelatedProduct}
                  className="py-2 px-4 bg-green-400 text-slate-200"
                >
                  Addd related product
                </button>
              )}
            </div>
          </div>
        )}
      </>
    );
  });

  const handleClick = (v: any) => {
    console.log(v);
  };

  const handleChange = (value: string) => {
    setInputValue(value);
  };
  console.log(pageInformation);

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
          />
          {/* <IndexTable
                key={1}
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
                  { title: "Total" },
                  { title: "Vendor" },
                ]}
                pagination={{
                  hasNext: pageInformation.hasNextPage,
                  hasPrevious: pageInformation.hasPreviousPage,
                  onNext: handleNextPagination,
                  onPrevious: handlePrevPagination,
                  label: "Total products",
                }}
              >
                {isLoading ? (
                  <div className="text-2xl flex items-center justify-center h-40 w-[55vw] mx-auto">
                    <Spinner
                      accessibilityLabel="Loading spinner"
                      size="large"
                    />
                  </div>
                ) : (
                
                  rowMarkup
                )}
              </IndexTable> */}
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Dashboard;
