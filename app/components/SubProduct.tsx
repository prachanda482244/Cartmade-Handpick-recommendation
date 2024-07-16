import { motion, AnimatePresence, DragControls } from "framer-motion";
import { MinusIcon } from "@shopify/polaris-icons";
import { MdDragIndicator } from "react-icons/md";
import { useEffect, useState } from "react";
import { subProducts } from "~/config/typeConfig";
import { DefaultGallery, NoProductFound } from "~/config/svgItem";
import { Checkbox, Icon } from "@shopify/polaris";
import Loader from "./Loader";

const SubProduct = ({
  title,
  subProducts,
  setSubProducts,
  originalProduct,
  mainId,
  metaFieldKey,
  metaFieldNameSpace,
  setOriginalProduct,
}: {
  title: string;
  subProducts: subProducts[];
  setSubProducts: any;
  mainId: string;
  originalProduct: subProducts[];
  metaFieldKey: string;
  metaFieldNameSpace: string;
  setOriginalProduct: any;
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [subproductId, setSubProductId] = useState<string[]>([]);
  const [condition, setCondition] = useState<boolean>(false);
  const [updatedProductIds, setUpdatedProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const allSubProductId = subProducts?.map(({ id }) => id);
  const initialIds = originalProduct?.map(({ id }) => id);

  const handleDragStart = (event: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index.toString());
  };
  const handleDragOver = async (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (draggingIndex === null) return;

    if (index !== draggingIndex) {
      const updatedSubProducts = [...subProducts];
      const [draggedItem] = updatedSubProducts.splice(draggingIndex, 1);
      updatedSubProducts.splice(index, 0, draggedItem);

      setSubProducts(updatedSubProducts);
      setDraggingIndex(index);

      const updatedIds = updatedSubProducts.map(({ id }) => id);
      setUpdatedProductIds(updatedIds);

      setCondition(initialIds.some((id, index) => updatedIds[index] !== id));
    }
  };

  const handleDrop = () => {
    setDraggingIndex(null);
  };

  const handleDeleteProduct = (id: string) => {
    setSubProductId((prevSubProductId) => {
      if (prevSubProductId.includes(id)) {
        return prevSubProductId.filter((productId) => productId !== id);
      } else {
        return [...prevSubProductId, id];
      }
    });
  };

  const handleClick = async () => {
    const deletedIds = allSubProductId.filter(
      (item) => !subproductId.includes(item),
    );
    const queryString = deletedIds
      ?.map((id, index) => `productIds[${index}]=${encodeURIComponent(id)}`)
      .join("&");

    const parts: any = mainId?.split("/");
    const productId = parseInt(parts[parts?.length - 1]);
    setIsLoading(true);
    const response = await fetch(
      `/api/metafield?${queryString}&mainProductId=${productId}&metaFieldNameSpace=${metaFieldNameSpace}&metaFieldKey=${metaFieldKey}`,
    );
    setIsLoading(false);
    const { data } = await response.json();
    setSubProductId([]);
    setSubProducts(data);
    setOriginalProduct(data);
  };

  const handleAddRelatedProduct = async () => {
    try {
      const selected = await shopify.resourcePicker({
        type: "product",
        multiple: true,
        filter: {
          variants: false,
          archived: false,
          draft: false,
        },
      });
      if (selected === undefined) return;

      const productIds = selected?.map(({ id }) => id);
      const queryString = productIds
        ?.map((id, index) => `productIds[${index}]=${encodeURIComponent(id)}`)
        .join("&");

      const parts: any = mainId?.split("/");
      const productId = parseInt(parts[parts?.length - 1]);
      setIsLoading(true);
      const response = await fetch(
        `/api/metafield?${queryString}&mainProductId=${productId}&metaFieldNameSpace=${metaFieldNameSpace}&metaFieldKey=${metaFieldKey}`,
      );
      setIsLoading(false);
      const { data } = await response.json();
      setSubProducts(data);
      setOriginalProduct(data);
    } catch (error) {
      console.error(
        "Error selecting products or fetching metafield data:",
        error,
      );
    }
  };

  const handleEditRelatedProduct = async () => {
    const arrayId = subProducts.map((product: any) => {
      return {
        id: product.id,
      };
    });
    try {
      const selected = await shopify.resourcePicker({
        type: "product",
        selectionIds: arrayId,
        multiple: true,
        action: "select",
        filter: {
          variants: false,
          archived: false,
          draft: false,
          hidden: false,
        },
      });

      if (selected === undefined) return;
      const productIds = selected?.map(({ id }) => id);

      const queryString = productIds
        ?.map((id, index) => `productIds[${index}]=${encodeURIComponent(id)}`)
        .join("&");

      const parts: any = mainId?.split("/");
      const productId = parseInt(parts[parts?.length - 1]);
      setIsLoading(true);
      const response = await fetch(
        `/api/metafield?${queryString}&mainProductId=${productId}&metaFieldNameSpace=${metaFieldNameSpace}&metaFieldKey=${metaFieldKey}`,
      );
      setIsLoading(false);

      const { data } = await response.json();
      setSubProducts(data);
      setOriginalProduct(data);
    } catch (error) {
      console.error(
        "Error selecting products or fetching metafield data:",
        error,
      );
    }
  };

  const handleSaveChanges = async () => {
    const queryString = updatedProductIds
      ?.map((id, index) => `productIds[${index}]=${encodeURIComponent(id)}`)
      .join("&");
    const parts: any = mainId?.split("/");
    const productId = parseInt(parts[parts?.length - 1]);
    setIsLoading(true);
    const response = await fetch(
      `/api/metafield?${queryString}&mainProductId=${productId}&metaFieldNameSpace=${metaFieldNameSpace}&metaFieldKey=${metaFieldKey}`,
    );
    setIsLoading(false);
    const { data } = await response.json();
    setSubProducts(data);
    setOriginalProduct(data);
  };
  return (
    <div className=" flex border w-full hover:border-gray-400 transition-all delay-[10]  overflow-hidden rounded-lg flex-col">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <AnimatePresence>
          <div className="  flex flex-col items-center">
            <div className="flex justify-between bg-[#f1f1f1] items-center border-b px-3 py-2  w-full">
              <h3 className="font-semibold capitalize  text-lg tracking-tight  ">
                {title}
              </h3>
              <div className="flex items-center gap-2 ">
                {subproductId.length !== 0 && (
                  <button
                    onClick={handleClick}
                    className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter Polaris-Button--toneCritical"
                  >
                    Delete
                  </button>
                )}

                {subProducts.length && subproductId.length === 0 ? (
                  <>
                    <button
                      onClick={handleEditRelatedProduct}
                      className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
                    >
                      Edit Product
                    </button>
                  </>
                ) : null}
                {condition && (
                  <button
                    onClick={handleSaveChanges}
                    className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
                  >
                    Save changes
                  </button>
                )}
              </div>
            </div>
            {subProducts.length !== 0 && (
              <div className="flex   border-b w-full px-2 py-4">
                <div className="flex items-center justifybetween w-full">
                  <p className=" font-semibold text-sm  w-[80%] pl-1 text-left leading-4 text-gray-700 tracking-wider">
                    {subproductId.length !== 0 ? (
                      <div
                        onClick={() => {
                          setSubProductId(
                            subproductId.length !== initialIds.length
                              ? initialIds
                              : [],
                          );
                        }}
                        className="flex items-center gap-2 relative font-semibold"
                      >
                        <Checkbox
                          label
                          labelHidden
                          checked={subproductId.length === initialIds.length}
                        />
                        {subproductId.length !== initialIds.length && (
                          <div className="absolute -left-[1px] ">
                            <Icon source={MinusIcon} tone="base" />
                          </div>
                        )}
                        <label className="cursor-pointer">
                          {subproductId.length + " selected"}
                        </label>
                      </div>
                    ) : (
                      "Product"
                    )}
                  </p>

                  <p className=" font-semibold text-center text-sm px-4  w-[20%]  leading-4 text-gray-700 tracking-wider">
                    Inventory
                  </p>
                </div>
              </div>
            )}
          </div>

          {subProducts &&
            subProducts?.map((product: any, index: number) => (
              <motion.div
                key={index}
                onClick={() => handleDeleteProduct(product.id)}
                className={`flex cursor-pointer flex-col border-b items-center justify-between 
              ${subproductId.includes(product.id) ? "bg-gray-100" : ""}
              ${draggingIndex === index ? "bg-gray-100 " : ""}`}
                initial={{ y: 0 }}
                animate={{
                  y: 0,
                  transition: {
                    duration: 0.3,
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                  },
                }}
                exit={{ opacity: 0, y: -50 }}
                onDragOver={(event) => handleDragOver(event, index)}
                onDrop={handleDrop}
                dragConstraints={{ top: 0, bottom: 0 }}
              >
                <div className="flex justify-between w-full">
                  <div className="flex  justify-between w-full items-center">
                    <div className="flex items-center  w-[80%]  px-1">
                      <motion.div
                        className="cursor-move  px-2 py-1"
                        draggable={true}
                        onDragStart={(event: any) =>
                          handleDragStart(event, index)
                        }
                        onDragOver={(event) => handleDragOver(event, index)}
                        onDrop={handleDrop}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <MdDragIndicator className="w-5 h-5" />
                      </motion.div>
                      <div>
                        <p className="py-2 px-1 font-medium flex items-center gap-4">
                          <span className="border w-10 flex  items-center justify-center h-10 rounded-lg ">
                            {product.featuredImage === null ? (
                              <DefaultGallery />
                            ) : (
                              <img
                                src={product.featuredImage.url}
                                alt="product"
                                className="w-8 h-8"
                              />
                            )}
                          </span>
                          <p className="flex flex-col">
                            <span className="font-semibold">
                              {product?.title}
                            </span>
                            <p>
                              £ {product.priceRange?.minVariantPrice?.amount}
                            </p>
                            <p className="text-xs">{product.vendor}</p>
                          </p>
                        </p>
                      </div>
                    </div>

                    <p className="py-2 px-4 w-[20%] text-center text-red-600">
                      {product.totalInventory}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          {subProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center pb-3 h-full">
              <NoProductFound width="130" height="130" />
              <h4 className="font-bold text-sm">Add your {title}</h4>
              <p className=" text-gray-500 mb-5">
                Start by stocking your store with products your customer will
                love
              </p>
              <button
                onClick={handleAddRelatedProduct}
                className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
              >
                Add Product
              </button>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default SubProduct;
