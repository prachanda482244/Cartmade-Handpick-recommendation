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
  const [outfitsProduct, setOutfitsProduct] = useState<subProducts[]>([]);
  const [combineProduct, setCombineProduct] = useState<subProducts[]>([]);
  const [originalCombineProduct, setOriginalCombineProduct] = useState<
    subProducts[]
  >([]);
  const [originalProduct, setOriginalProduct] = useState<subProducts[]>([]);
  const [originalOutfitProduct, setOriginalOutfitProduct] = useState<
    subProducts[]
  >([]);
  const [isProductLoading, setIsProductLoading] = useState<boolean>(true);
  const [recommendedMetaId, setRecommendedMetaId] = useState<string | number>(
    "",
  );
  const [outFitMetaId, setOutFitMetaId] = useState<string | number>("");
  const [combinedMetaId, setCombinedMetaId] = useState<string | number>("");
  const [activeId, setActiveId] = useState<string>("");
  const [product_Id, setProductId] = useState<string | number>("");

  const fetchData = async ({
    productId,
    recommededProductMetaId,
    outfitProductMetaId,
    combineProductMetaId,
  }: {
    productId: number | string;
    recommededProductMetaId?: number | string;
    outfitProductMetaId?: number | string;
    combineProductMetaId?: number | string;
  }) => {
    setProductId(productId);
    setIsProductLoading(true);
    try {
      if (recommededProductMetaId !== undefined) {
        const recommededProduct = await fetch(
          `/api/fetchmetafield?productId=${productId}&metaFieldId=${recommededProductMetaId}`,
        );
        if (recommededProduct.ok) {
          setIsProductLoading(false);
          const { data } = await recommededProduct.json();
          setSubProducts(data);
          setOriginalProduct(data);
        } else {
          setIsProductLoading(false);

          console.error(
            "Failed to fetch metafield data:",
            recommededProduct.statusText,
          );
        }
      }
      if (outfitProductMetaId !== undefined) {
        const outfitProduct = await fetch(
          `/api/fetchmetafield?productId=${productId}&metaFieldId=${outfitProductMetaId}`,
        );

        if (outfitProduct.ok) {
          setIsProductLoading(false);
          const { data } = await outfitProduct.json();
          setOutfitsProduct(data);
          setOriginalOutfitProduct(data);
        } else {
          setIsProductLoading(false);

          console.error(
            "Failed to fetch metafield data:",
            outfitProduct.statusText,
          );
        }
      }
      if (combineProductMetaId !== undefined) {
        const combineProduct = await fetch(
          `/api/fetchmetafield?productId=${productId}&metaFieldId=${combineProductMetaId}`,
        );
        if (combineProduct.ok) {
          setIsProductLoading(false);
          const { data } = await combineProduct.json();
          setCombineProduct(data);
          setOriginalCombineProduct(data);
        } else {
          setIsProductLoading(false);
          console.log("Hello from else");
          console.error(
            "Failed to fetch metafield data:",
            combineProduct.statusText,
          );
        }
      }
    } catch (error) {
      console.error("Error fetching metafield data:", error);
      setIsProductLoading(false);
    }
  };
  useEffect(() => {
    fetchData({
      productId: product_Id,
      recommededProductMetaId: recommendedMetaId,
      combineProductMetaId: combinedMetaId,
      outfitProductMetaId: outFitMetaId,
    });
  }, [product_Id, recommendedMetaId, combinedMetaId, outFitMetaId]);

  const handleClick = async (
    productId: string,
    metafieldId: string[] | any,
  ) => {
    setActiveId(productId);
    const isCurrentlyExpanded = expandedRow === productId;
    setExpandedRow(isCurrentlyExpanded ? null : productId);

    if (!isCurrentlyExpanded && metafieldId) {
      const metaIds = metafieldId.map(
        ({
          node,
        }: {
          node: {
            id: string;
          };
        }) => node.id.split("/")[node.id.split("/").length - 1],
      );
      console.log(metafieldId);
      console.log(metaIds);
      setRecommendedMetaId(metaIds[0]);
      setOutFitMetaId(metaIds[1]);
      setCombinedMetaId(metaIds[2]);
      fetchData({
        productId,
        recommededProductMetaId: metaIds[0],
        outfitProductMetaId: metaIds[1],
        combineProductMetaId: metaIds[2],
      });
    }
  };

  const rows = products?.map((product, index) => {
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

    let metafieldId: any;
    if (Array.isArray(metafields?.edges) && metafields.edges.length > 0) {
      metafieldId = metafields.edges || null;
    }

    const isExpanded = expandedRow === id;
    return (
      <>
        <div
          className={`hover:bg-gray-50 ${activeId === id ? "bg-gray-100" : ""} flex flex-col border-t items-center  justify-between cursor-pointer text-[#3b3b3b]`}
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
                className={`bg-[#b4fed2] text-[#377b59] ${status === "ARCHIVED" ? "bg-[#f0f0f0] text-gray-500" : ""} ${status === "DRAFT" ? "bg-[#e6f3ff]" : ""}  font-bold capitalize text-[11px] px-3 py-1 rounded-full`}
              >
                {status?.toLowerCase()}
              </span>
            </p>
            <p className="py-2 font-medium  px-4 w-[7%] text-[#a64f40]">
              {totalInventory}
            </p>
            <p className="py-2 font-medium  px-4 w-[10%]">
              £ {priceRange?.minVariantPrice?.amount}
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
            <div className=" flex border   gap-5 p-5">
              <SubProduct
                title="Recommended Products"
                subProducts={subProducts}
                setSubProducts={setSubProducts}
                fetchData={fetchData}
                originalProduct={originalProduct}
                mainId={id}
                metaFieldNameSpace="custom"
                metaFieldKey="recommended_produccts"
              />

              <SubProduct
                title="Outfit product"
                subProducts={outfitsProduct}
                setSubProducts={setOutfitsProduct}
                fetchData={fetchData}
                originalProduct={originalOutfitProduct}
                mainId={id}
                metaFieldNameSpace="custom"
                metaFieldKey="outfits"
              />

              <SubProduct
                title="Combine with product"
                subProducts={combineProduct}
                setSubProducts={setCombineProduct}
                fetchData={fetchData}
                originalProduct={originalCombineProduct}
                mainId={id}
                metaFieldNameSpace="custom"
                metaFieldKey="combine_products"
              />
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
          <div className="min-w-full   text-[13px] bg-white">
            <div className="flex justify-between items-center px-4 bg-[#f7f7f7]">
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
