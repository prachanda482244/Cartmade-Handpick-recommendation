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
  Scrollable,
  Spinner,
  TextField,
  useIndexResourceState,
} from "@shopify/polaris";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { apiVersion, authenticate } from "~/shopify.server";
import { pageInfomation } from "~/config/typeConfig";
import lodash from "lodash";
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
  const [searchProducts, setSearchProducts] = useState<any>([]);
  const { pageInfo, edges } = loaderData;

  const [inputValue, setInputValue] = useState<string>("");
  const [insideInputValue, setInsideInputValue] = useState<string>("");
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
      insideInputValue === inputValue
        ? setProducts(edges)
        : setSearchProducts(edges);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  // const debouncedSearch = useCallback(lodash.debounce(handleSubmit, 500), [
  //   inputValue,
  // ]);

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

  const handleToggleAccordion = (productId: string) => {
    console.log(productId, "Product id");
    setSelectedProductId(selectedProductId === productId ? null : productId);
    setIsVisible(false);
  };

  const handleSelectionChange = (selected: string[] | any) => {
    setSelectedProductId(selected.length > 0 ? selected[0] : null);
  };
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleAddRelatedProduct = () => {
    setSearchProducts(products);
    setIsVisible(true);
  };

  const rowMarkup = products.map((product: any, index: number) => {
    const { id, priceRange, title, featuredImage, vendor, createdAt } =
      product.node;
    const isExpanded = selectedProductId === id;

    return (
      <>
        <IndexTable.Row
          key={id}
          id={id}
          selected={isExpanded}
          onClick={() => handleToggleAccordion(id)}
          position={index}
        >
          <IndexTable.Cell className="border">{title}</IndexTable.Cell>
          <IndexTable.Cell>{createdAt}</IndexTable.Cell>
          <IndexTable.Cell>
            <img
              src={featuredImage?.url}
              alt="Product"
              height={40}
              width={60}
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            {priceRange?.minVariantPrice?.amount}
          </IndexTable.Cell>
          <IndexTable.Cell>{vendor}</IndexTable.Cell>
        </IndexTable.Row>

        {isExpanded && (
          <div className="border w-[50vw]">
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

              {isVisible && (
                <div className=" h-96 flex flex-col gap-3 mt-2 w-full z-[9999] text-whiten">
                  <div className="flex items-center gap-2">
                    <Form
                      noValidate
                      onSubmit={() => handleSubmit(insideInputValue)}
                    >
                      <FormLayout>
                        <div className="flex items-center gap-2">
                          <TextField
                            label=""
                            value={insideInputValue}
                            onChange={(value) => setInsideInputValue(value)}
                            placeholder="Search "
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
                  <Scrollable shadow style={{ height: "350px" }}>
                    {searchProducts?.map((product: any, index: number) => (
                      <div
                        onClick={() => handleClick(product.node.id)}
                        key={product.node.id}
                        className="flex border p-3 hover:bg-slate-300 cursor-pointer"
                      >
                        {isLoading ? (
                          "Loading"
                        ) : (
                          <>
                            <div>{index + 1}</div>
                            {product.node.title}
                            {product.node.vendor}
                            <img
                              src={product.node.featuredImage?.url}
                              alt="product"
                              height={20}
                              width={20}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </Scrollable>
                </div>
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

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <h1>Dashboard</h1>
        </Layout.Section>

        <Layout.Section>
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
                {inputValue && isLoading ? (
                  <div className="text-2xl flex items-center justify-center h-40 w-[55vw] mx-auto">
                    <Spinner
                      accessibilityLabel="Loading spinner"
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
