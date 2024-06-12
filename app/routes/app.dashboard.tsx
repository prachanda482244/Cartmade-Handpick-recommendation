import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Layout, List, MediaCard, Page } from "@shopify/polaris";
import { Autocomplete, Icon } from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import axios from "axios";
import { useState, useCallback, useMemo } from "react";
import { apiVersion, authenticate } from "~/shopify.server";

export const query = `
{
  products(first: 10) {
    edges {
      node {
        id
        title
        featuredImage{
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
        products: { edges },
      },
    } = data;

    return edges;
  } catch (error) {
    console.log(error);
  }
  return [];
};
const Dashboard = () => {
  const products: any = useLoaderData();
  console.log(products, "Products");

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
          <Card>
            <List type="bullet" gap="loose">
              {products?.map((product: any) => (
                <MediaCard
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
