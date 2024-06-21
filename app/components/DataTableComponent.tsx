import { Pagination } from "@shopify/polaris";
import { useState } from "react";
import { pageInfomation } from "~/config/typeConfig";
import Loader from "./Loader";

const DataTableComponent = ({
  pageInformation,
  handlePrevPagination,
  handleNextPagination,
  products,
  isLoading,
}: {
  pageInformation: pageInfomation;
  handlePrevPagination: any;
  handleNextPagination: any;
  products: any[];
  isLoading: boolean;
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [subProducts, setSubProducts] = useState<any>(null);
  const [isProductLoading, setIsProductLoading] = useState<boolean>(true);
  const [activeId, setActiveId] = useState<string>("");

  const handleAddRelatedProduct = async (mainId: string) => {
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

      const parts: any = mainId?.split("/");
      console.log(parts, "parts");
      const productId = parseInt(parts[parts?.length - 1]);
      console.log(queryString, "query string");
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

  const handleEdiRelatedProduct = async () => {
    const arrayId = subProducts.map((product: any) => {
      return {
        id: product.id,
      };
    });
    console.log(arrayId);
    try {
      // Use Shopify App Bridge to pick products
      const selected = await shopify.resourcePicker({
        type: "product",
        multiple: 4,
        selectionIds: arrayId,
        filter: {
          variants: false,
          archived: false,
          draft: false,
        },
      });

      console.log(selected);
      // Extract and map the product IDs to an array
      // const productIds = selected?.map(({ id }) => id);

      // // Serialize the product IDs into a query string format
      // const queryString = productIds
      //   ?.map((id, index) => `productIds[${index}]=${encodeURIComponent(id)}`)
      //   .join("&");

      // // Send the request to the server
      // // const response = await fetch(
      // //   `/api/meta?${queryString}&mainProductId=${selectedProductId}`,
      // // );
      // const parts: any = selectedProductId?.split("/");
      // const productId = parseInt(parts[parts.length - 1]);
      // console.log(productId);
      // const response = await fetch(
      //   `/api/metafield?${queryString}&mainProductId=${productId}`,
      // );

      // // Handle the server response
      // const data = await response.json();
      // console.log("Metafield data:", data);
    } catch (error) {
      console.error(
        "Error selecting products or fetching metafield data:",
        error,
      );
    }
  };
  const handleClick = async (productId: string, metafieldId: string) => {
    setActiveId(productId);
    const isCurrentlyExpanded = expandedRow === productId;
    setExpandedRow(isCurrentlyExpanded ? null : productId);

    if (!isCurrentlyExpanded && metafieldId) {
      const metaIdParts = metafieldId.split("/");
      const metaId = metaIdParts[metaIdParts.length - 1];

      const productParts = productId.split("/");
      const product_id = productParts[productParts.length - 1];
      setIsProductLoading(true);
      try {
        const response = await fetch(
          `/api/fetchmetafield?productId=${product_id}&metaFieldId=${metaId}`,
        );

        if (response.ok) {
          setIsProductLoading(false);
          const { data } = await response.json();
          setSubProducts(data[0]);
        } else {
          setIsProductLoading(false);

          console.error("Failed to fetch metafield data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching metafield data:", error);
        setIsProductLoading(false);
      }
    }
  };
  console.log(subProducts);
  const rows = products.map((product) => {
    const {
      id,
      priceRange,
      title,
      featuredImage,
      metafields,
      vendor,
      status,
      totalInventory,
      createdAt,
    } = product.node;

    let metafieldId = null;
    if (metafields?.edges?.length > 0) {
      metafieldId = metafields.edges[0]?.node?.id || null;
    }

    const isExpanded = expandedRow === id;

    return (
      <>
        <div
          className={`hover:bg-gray-200 ${activeId === id ? "bg-gray-300" : ""} flex flex-col border-b items-center  justify-between cursor-pointer`}
          key={id}
          onClick={() => handleClick(id, metafieldId)}
        >
          <div className="flex justify-between items-center w-full">
            <p className="py-2 px-4 flex items-center w-[20%]">
              <img
                src={featuredImage?.url}
                alt="Product"
                className="w-10 h-10"
              />
              {title}
            </p>
            <p className="py-2 px-4 w-[10%]">
              <span className="bg-green-200 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                {status}
              </span>
            </p>
            <p className="py-2 px-4 w-[7%] text-red-600">{totalInventory}</p>
            <p className="py-2 px-4 w-[10%]">
              {priceRange?.minVariantPrice?.amount}
            </p>
            <p className="py-2 px-4">{createdAt}</p>
            <p className="py-2 px-4 w-[13%]">{vendor}</p>
          </div>
        </div>
        {isExpanded &&
          (isProductLoading ? (
            <Loader />
          ) : (
            <div className=" flex flex-col gap-2 items-center justify-center py-4 px-6 w-full">
              <h1 className="font-semibold text-lg tracking-wide ">
                Recommended Products
              </h1>
              <div className="flex justify-between items-center border w-1/2 border-gray-600 py-2">
                <p className=" font-semibold text-sm w-[20%] px-4 text-left leading-4 text-gray-700 tracking-wider">
                  Product
                </p>

                <p className=" font-light text-sm px-4 w-[7%] text-left leading-4 text-gray-700 tracking-wider">
                  Inventory
                </p>
                <p className=" font-light text-sm px-4 w-[10%] text-left leading-4 text-gray-700 tracking-wider">
                  Price
                </p>

                <p className=" font-light text-sm w-[25%] px-4 text-left leading-4 text-gray-700 tracking-wider">
                  Vendor
                </p>
              </div>
              <div className="w-1/2">
                {subProducts?.map((product: any) => (
                  <div
                    className="hover:bg-gray-200 flex flex-col border-b items-center  justify-between cursor-pointer"
                    key={product.id}
                    onClick={() => handleClick(id, metafieldId)}
                  >
                    <div className="flex justify-between items-center w-full">
                      <p className="py-2 px-4 flex items-center w-[20%]">
                        <img
                          src={featuredImage?.url}
                          alt="Product"
                          className="w-10 h-10"
                        />
                        {product.title}
                      </p>

                      <p className="py-2 px-4 w-[7%] text-red-600">
                        {product.totalInventory}
                      </p>
                      <p className="py-2 px-4 w-[10%]">
                        {product.priceRange?.minVariantPrice?.amount}
                      </p>
                      <p className="py-2 px-4 w-[25%]">{product.vendor}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex w-1/2 gap-5 items-center">
                {subProducts === undefined ? (
                  <button
                    onClick={() => handleAddRelatedProduct(id)}
                    className="bg-sky-400 py-2 px-4 items-start text-white rounded-md tracking-wider"
                  >
                    Add Product
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleEdiRelatedProduct}
                      className="bg-green-400 py-2 px-4 items-start text-white rounded-md tracking-wider"
                    >
                      Edit Product
                    </button>
                    <button
                      // onClick={handleAddRelatedProduct}
                      className="bg-red-400 py-2 px-4 items-start text-white rounded-md tracking-wider"
                    >
                      Delete Product
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
      </>
    );
  });

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full p-2 bg-white">
            <div className="flex justify-between items-center border border-gray-200 py-2">
              <p className="py-2 font-semibold text-base w-[20%] px-4 text-left leading-4 text-gray-700 tracking-wider">
                Product
              </p>
              <p className="py-2 font-semibold text-base px-4 w-[10%] text-left leading-4 text-gray-700 tracking-wider">
                Status
              </p>
              <p className="py-2 font-semibold text-base px-4 w-[7%] text-left leading-4 text-gray-700 tracking-wider">
                Inventory
              </p>
              <p className="py-2 font-semibold text-base px-4 w-[10%] text-left leading-4 text-gray-700 tracking-wider">
                Price
              </p>
              <p className="py-2 font-semibold text-base px-4 w-[10%] text-left leading-4 text-gray-700 tracking-wider">
                Created At
              </p>
              <p className="py-2 font-semibold text-base w-[13%] px-4 text-left leading-4 text-gray-700 tracking-wider">
                Vendor
              </p>
            </div>
            <div>{rows}</div>
          </div>
          <Pagination
            type="table"
            onNext={handleNextPagination}
            onPrevious={handlePrevPagination}
            hasNext={pageInformation?.hasNextPage}
            hasPrevious={pageInformation?.hasPreviousPage}
          />
        </div>
      )}
    </div>
  );
};

export default DataTableComponent;
