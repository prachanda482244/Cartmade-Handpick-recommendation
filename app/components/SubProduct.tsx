import { motion, AnimatePresence, DragControls } from "framer-motion";
import { MinusIcon } from "@shopify/polaris-icons";
import { MdDragIndicator } from "react-icons/md";
import { useState } from "react";
import { subProducts } from "~/config/typeConfig";
import { DefaultGallery } from "~/config/svgItem";
import { Checkbox, Icon } from "@shopify/polaris";
import axios from "axios";

const SubProduct = ({
  subProducts,
  setSubProducts,
  mainId,
  originalProduct,
  fetchData,
}: {
  subProducts: subProducts[];
  setSubProducts: any;
  mainId: string;
  originalProduct: subProducts[];
  fetchData: any;
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [subproductId, setSubProductId] = useState<string[]>([]);
  const allSubProductId = subProducts?.map(({ id }) => id);
  const [condition, setCondition] = useState<boolean>(false);
  const [updatedProductIds, setUpdatedProductIds] = useState<string[]>([]);

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

      const hasOrderChanged = initialIds.some(
        (id, idx) => updatedIds[idx] !== id,
      );
      setCondition(hasOrderChanged);
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
    // Serialize the product IDs into a query string format
    const queryString = deletedIds
      ?.map((id, index) => `productIds[${index}]=${encodeURIComponent(id)}`)
      .join("&");

    const parts: any = mainId?.split("/");
    const productId = parseInt(parts[parts?.length - 1]);
    const response = await fetch(
      `/api/metafield?${queryString}&mainProductId=${productId}`,
    );

    const data = await response.json();
    fetchData(
      "gid://shopify/Product/" + data.data.id,
      "gid://shopify/Product/" + data.data.product_id,
    );
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
      const response = await fetch(
        `/api/metafield?${queryString}&mainProductId=${productId}`,
      );

      const { data } = await response.json();
      fetchData(
        "gid://shopify/Product/" + data.id,
        "gid://shopify/Product/" + data.product_id,
      );
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

      // Take the id from the selected array

      if (selected === undefined) return;
      const productIds = selected?.map(({ id }) => id);

      const queryString = productIds
        ?.map((id, index) => `productIds[${index}]=${encodeURIComponent(id)}`)
        .join("&");

      const parts: any = mainId?.split("/");
      const productId = parseInt(parts[parts?.length - 1]);
      const response = await fetch(
        `/api/metafield?${queryString}&mainProductId=${productId}`,
      );

      const data = await response.json();
      fetchData(
        "gid://shopify/Product/" + data.data.id,
        "gid://shopify/Product/" + data.data.product_id,
      );
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
    const response = await fetch(
      `/api/metafield?${queryString}&mainProductId=${productId}`,
    );

    const data = await response.json();
    fetchData(
      "gid://shopify/Product/" + data.data.id,
      "gid://shopify/Product/" + data.data.product_id,
    );
  };
  console.log(subProducts);
  return (
    <div className=" flex border rounded-lg flex-col">
      <AnimatePresence>
        <div className=" flex flex-col items-center">
          <div className="flex justify-between items-center border-b p-1  w-full">
            <h1 className="font-semibold px-2 text-lg tracking-tight  ">
              Recommended Products
            </h1>
            <div className="flex items-center gap-2 ">
              {subproductId.length !== 0 && (
                <button
                  onClick={handleClick}
                  className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter Polaris-Button--toneCritical"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-between  items-center border-b w-full px-2 py-4">
            <p className=" font-semibold text-sm  w-[40%]  px-4 text-left leading-4 text-gray-700 tracking-wider">
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
                "Product title"
              )}
            </p>

            <p className=" font-semibold text-sm px-4 text-left leading-4 text-gray-700 tracking-wider">
              Inventory
            </p>
            <p className=" font-semibold text-sm w-[15%]  px-4text-left leading-4 text-gray-700 tracking-wider">
              Price
            </p>
            <p className=" font-semibold text-sm w-[20%]  px-4 text-left leading-4 text-gray-700 tracking-wider">
              Vendor
            </p>
          </div>
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
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center  w-[40%] px-2">
                  <motion.div
                    className="cursor-pointer  px-2 py-1"
                    draggable={true}
                    onDragStart={(event: any) => handleDragStart(event, index)}
                    onDragOver={(event) => handleDragOver(event, index)}
                    onDrop={handleDrop}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MdDragIndicator className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <p className="py-2 px-4 font-medium  flex items-center gap-4">
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
                      <span className="">{product?.title}</span>
                    </p>
                  </div>
                </div>

                <p className="py-2 px-4  text-red-600">
                  {product.totalInventory}
                </p>
                <p className="py-2 px-4 w-[14%] ">
                  £ {product.priceRange?.minVariantPrice?.amount}
                </p>
                <p className="py-2 px-4 w-[20%] capitalize">{product.vendor}</p>
              </div>
            </motion.div>
          ))}
        <div className="flex gap-2 py-2 px-2 items-center justify-between">
          {subProducts === undefined ? (
            <button
              onClick={handleAddRelatedProduct}
              className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
            >
              Add Product
            </button>
          ) : (
            <>
              <button
                onClick={handleEditRelatedProduct}
                className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
              >
                Edit Product
              </button>
              {condition && (
                <button
                  onClick={handleSaveChanges}
                  className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
                >
                  Save changes
                </button>
              )}
            </>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default SubProduct;
