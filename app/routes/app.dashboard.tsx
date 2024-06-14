import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { DeleteIcon } from "@shopify/polaris-icons";

import { useLoaderData } from "@remix-run/react";
import {
  Box,
  Card,
  IndexTable,
  Layout,
  LegacyCard,
  Page,
  useIndexResourceState,
} from "@shopify/polaris";
import { Autocomplete, Icon } from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import axios from "axios";
import { useState, useCallback, useMemo, useEffect } from "react";
import { apiVersion, authenticate } from "~/shopify.server";
import { SelectionType } from "@shopify/polaris/build/ts/src/utilities/use-index-resource-state";

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
  const [products, setProducts] = useState([]);
  const { pageInfo, edges } = loaderData;

  const deselectedOptions = useMemo(
    () => [
      { value: "rustic", label: "The Collection Snowboard: Liquid" },
      { value: "headphone", label: "Head Phone" },
      { value: "vinyl", label: "Short sleeve tshirt" },
    ],
    [],
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(deselectedOptions);

  useEffect(() => {
    setProducts(edges);
    setPageInformation(pageInfo);
  }, [pageInfo]);

  const handleNextPagination = async () => {
    let response = await fetch(
      `/api/pagination?firstLastValue=first&afterBeforeValue=after&pageToken=${pageInformation.endCursor}`,
    );
    let { data } = await response.json();
    const { products } = data;
    const { pageInfo, edges } = products;
    setPageInformation(pageInfo);
    setProducts(edges);
  };

  const handlePrevPagination = async () => {
    let response = await fetch(
      `/api/pagination?firstLastValue=last&afterBeforeValue=before&pageToken=${pageInformation.startCursor}`,
    );
    let { data } = await response.json();
    const { products } = data;
    const { pageInfo, edges } = products;
    setPageInformation(pageInfo);
    setProducts(edges);
  };

  const updateText = useCallback(
    (value: string) => {
      setInputValue(value);

      if (value === "") {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex),
      );
      setOptions(resultOptions);
    },
    [deselectedOptions],
  );

  const updateSelection = useCallback(
    (selected: string[]) => {
      const selectedValue = selected.map((selectedItem) => {
        const matchedOption = options.find((option) => {
          return option.value.match(selectedItem);
        });
        return matchedOption && matchedOption.label;
      });

      setSelectedOptions(selected);
      setInputValue(selectedValue[0] || "");
    },
    [options],
  );

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label="Search Products"
      value={inputValue}
      prefix={<Icon source={SearchIcon} tone="base" />}
      placeholder="Search"
      autoComplete="off"
    />
  );

  const resourceIDResolver = (product: any) => product.node.id;

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products, { resourceIDResolver });

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
      content: "Add tags",
      onAction: () => console.log("Todo: implement bulk add tags"),
    },
    {
      content: "Remove tags",
      onAction: () => console.log("Todo: implement bulk remove tags"),
    },
    {
      icon: DeleteIcon,
      destructive: true,
      content: "Delete customers",
      onAction: () => console.log("Todo: implement bulk delete"),
    },
  ];

  const rowMarkup = products.map((product: any, index) => {
    const { id, priceRange, title, featuredImage, vendor, createdAt } =
      product.node;

    return (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>{title}</IndexTable.Cell>
        <IndexTable.Cell>{createdAt}</IndexTable.Cell>
        <IndexTable.Cell>
          <img src={featuredImage?.url} alt="Products" height={40} width={60} />
        </IndexTable.Cell>
        <IndexTable.Cell>{priceRange?.minVariantPrice?.amount}</IndexTable.Cell>
        <IndexTable.Cell>{vendor}</IndexTable.Cell>
        <IndexTable.Cell>N/a</IndexTable.Cell>
      </IndexTable.Row>
    );
  });
  // console.log(products);
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <h1>Dashboard</h1>
        </Layout.Section>

        <Layout.Section>
          <div
            style={{
              height: "px",
              position: "absolute",
              top: "8px",
              right: "380px",
            }}
          >
            <Autocomplete
              options={options}
              selected={selectedOptions}
              onSelect={updateSelection}
              textField={textField}
            />
          </div>
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
                  { title: "Fulfillment status" },
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
                {rowMarkup}
              </IndexTable>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Dashboard;
