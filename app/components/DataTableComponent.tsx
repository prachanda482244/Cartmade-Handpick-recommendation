import { Pagination } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { Products, pageInformation, subProducts } from "~/config/typeConfig";
import Loader from "./Loader";
import SubProduct from "./SubProduct";
import { DefaultGallery } from "~/config/svgItem";

const DataTableComponent = ({
  pageInformation,
  handlePrevPagination,
  handleNextPagination,
  products,
  isLoading,
}: {
  pageInformation: pageInformation;
  handlePrevPagination: any;
  handleNextPagination: any;
  products: Products[];
  isLoading: boolean;
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [subProducts, setSubProducts] = useState<subProducts[]>([]);
  const [originalProduct, setOriginalProduct] = useState<subProducts[]>([]);
  const [isProductLoading, setIsProductLoading] = useState<boolean>(true);
  const [activeId, setActiveId] = useState<string>("");

  const [metafield_Id, setMetafieldId] = useState<string>("");
  const [product_Id, setProductId] = useState<string>("");

  const fetchData = async (metafieldId: string, productId: string) => {
    setMetafieldId(metafieldId);
    setProductId(productId);
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
        setOriginalProduct(data[0]);
      } else {
        setIsProductLoading(false);

        console.error("Failed to fetch metafield data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching metafield data:", error);
      setIsProductLoading(false);
    }
  };

  useEffect(() => {
    fetchData(metafield_Id, product_Id);
  }, [metafield_Id, product_Id]);

  const handleClick = async (productId: string, metafieldId: string | null) => {
    setActiveId(productId);
    const isCurrentlyExpanded = expandedRow === productId;
    setExpandedRow(isCurrentlyExpanded ? null : productId);

    if (!isCurrentlyExpanded && metafieldId) {
      fetchData(metafieldId, productId);
    }
  };

  const rows = products.map((product, index) => {
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

    let metafieldId: string | null = null;
    if (Array.isArray(metafields?.edges) && metafields.edges.length > 0) {
      metafieldId = metafields.edges[0]?.node?.id || null;
    }

    const isExpanded = expandedRow === id;
    return (
      <>
        <div
          className={`hover:bg-gray-50 ${activeId === id ? "bg-gray-100" : ""} flex flex-col border-b items-center  justify-between cursor-pointer text-[#3b3b3b]`}
          key={index}
          onClick={() => handleClick(id, metafieldId)}
        >
          <div className="flex text-[#5d5d5d]  justify-between text-[13px] items-center w-full">
            <p className="py-2 px-4 font-medium  flex items-center gap-4 w-[20%]">
              <span className="border w-10 h-10 rounded-lg ">
                {featuredImage === null ? (
                  <DefaultGallery />
                ) : (
                  <img
                    src={featuredImage?.url}
                    alt="Product"
                    className="p-1 rounded-lg"
                  />
                )}
              </span>

              <span className="">{title}</span>
            </p>
            <p className="py-2 font-medium  px-4 w-[10%]">
              <span
                className={`bg-[#b4fed2] text-[#377b59] ${status === "ARCHIVED" ? "bg-[#f0f0f0]" : ""} ${status === "DRAFT" ? "bg-[#e6f3ff]" : ""} text-[10px] font-medium  p-[5px] rounded`}
              >
                {status}
              </span>
            </p>
            <p className="py-2 font-medium  px-4 w-[7%] text-[#a64f40]">
              {totalInventory}
            </p>
            <p className="py-2 font-medium  px-4 w-[10%]">
              {priceRange?.minVariantPrice?.amount}
            </p>
            <p className="py-2  font-medium w-[13%] px-4">
              {createdAt.split("T")[0]}
            </p>
            <p className="py-2 capitalize font-medium px-4 w-[13%]">{vendor}</p>
          </div>
        </div>
        {isExpanded &&
          (isProductLoading ? (
            <Loader />
          ) : (
            <div className=" flex flex-col gap-2 items-center p-5">
              <div className="w-[70%]">
                <SubProduct
                  subProducts={subProducts}
                  setSubProducts={setSubProducts}
                  metaFieldId={metafield_Id}
                  productId={product_Id}
                  fetchData={fetchData}
                  originalProduct={originalProduct}
                  mainId={id}
                  setIsProductLoading={setIsProductLoading}
                />
              </div>
              <div className="flex w-1/2 gap-5 items-center"></div>
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
          <div className="min-w-full   text-[13px] rounded-lg  bg-white">
            <div className="flex justify-between items-center px-2 bg-[#f7f7f7] border py-1">
              <p className="py-2 font-medium tracking-tight w-[20%]  text-left leading-4 text-[#616161] ">
                Product
              </p>
              <p className="py-2 font-medium tracking-tight px-4 w-[10%] text-left leading-4 text-[#616161] ">
                Status
              </p>
              <p className="py-2 font-medium tracking-tight px-4 w-[7%] text-left leading-4 text-[#616161] ">
                Inventory
              </p>
              <p className="py-2 font-medium tracking-tight px-4 w-[10%] text-left leading-4 text-[#616161] ">
                Price
              </p>
              <p className="py-2 font-medium tracking-tight px-4 w-[13%] text-left leading-4 text-[#616161] ">
                Created At
              </p>
              <p className="py-2 font-medium tracking-tight w-[13%] px-4 text-left leading-4 text-[#616161] ">
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
