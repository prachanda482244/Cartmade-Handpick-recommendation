import {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Card,
  Layout,
  List,
  MediaCard,
  Page,
  Pagination,
} from "@shopify/polaris";
import { Autocomplete, Icon } from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import axios from "axios";
import { useState, useCallback, useMemo, useEffect } from "react";
import { apiVersion, authenticate } from "~/shopify.server";

export const query = `
{
  products(first:5) {
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
      // queryFunction(
      //   "first",
      //   "after",
      //   "eyJsYXN0X2lkIjo3OTQ3MTEwMTg3MTgwLCJsYXN0X3ZhbHVlIjoiNzk0NzExMDE4NzE4MCJ9",
      // ),
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
  const [pageToken, setPageToken] = useState<string>("");
  const [prevValue, setPrevValue] = useState<boolean>(true);
  const [nextValue, setNextValue] = useState<boolean>(true);
  const [previousPaginationData, setPreviousPaginationData] = useState();
  const [initialPaginationData, setInitialPaginationData] = useState();
  const [products, setProducts] = useState([]);
  const { pageInfo, edges } = loaderData;

  const deselectedOptions = useMemo(
    () => [
      { value: "rustic", label: "Rustic" },
      { value: "antique", label: "Antique" },
      { value: "vinyl", label: "Vinyl" },
      { value: "vintage", label: "Vintage" },
      { value: "refurbished", label: "Refurbished" },
    ],
    [],
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(deselectedOptions);

  useEffect(() => {
    setProducts(edges);
    setPageToken(pageInfo?.endCursor);
    setPreviousPaginationData(pageInfo);
  }, []);

  console.log(previousPaginationData, "Previous");

  const handleNextPagination = async () => {
    console.log(pageToken);

    let response = await fetch(
      `/api/pagination?firstLastValue=first&afterBeforeValue=after&pageToken=${pageToken}`,
    );
    let { data } = await response.json();
    const { products } = data;
    const { pageInfo, edges } = products;
    setInitialPaginationData(pageInfo);
    setPageToken(pageInfo.endCursor);
    setNextValue(pageInfo.hasNextPage);
    setProducts(edges);
  };

  const handlePrevPagination = async () => {
    let response = await fetch(
      `/api/pagination?firstLastValue=last&afterBeforeValue=before&pageToken=${pageToken}`,
    );
    let { data } = await response.json();
    const { products } = data;
    const { pageInfo, edges } = products;
    setPreviousPaginationData(pageInfo);
    setPageToken(pageInfo.endCursor);
    setPrevValue(pageInfo.hasPreviousPage);
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
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <h1>Dashboard</h1>
        </Layout.Section>

        <Layout.Section>
          <div style={{ height: "225px" }}>
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
          <Pagination
            label="Total products"
            hasPrevious={prevValue}
            onPrevious={handlePrevPagination}
            hasNext={nextValue}
            onNext={handleNextPagination}
          />
        </Layout.Section>
        <Layout.Section>
          <Card>
            <List type="bullet" gap="loose">
              {products?.map((product: any) => (
                <MediaCard
                  key={product.node.title}
                  title={product.node.title}
                  description={product.node.priceRange.minVariantPrice.amount}
                  popoverActions={[{ content: "Dismiss", onAction: () => {} }]}
                >
                  <img
                    alt={product.node.title}
                    width="100%"
                    height="100%"
                    style={{
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                    src={
                      product.node.featuredImage?.url !== ""
                        ? product.node.featuredImage?.url
                        : ""
                    }
                  />
                </MediaCard>
              ))}
            </List>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Dashboard;
