import { motion, AnimatePresence } from "framer-motion";
import { MdDragIndicator } from "react-icons/md";
import { useEffect, useState } from "react";
import { subProducts } from "~/config/typeConfig";

const SubProduct = ({
  subProducts,
  setSubProducts,
  mainId,
  metaFieldId,
  productId,
  fetchData,
  setIsProductLoading,
}: {
  subProducts: subProducts[];
  setSubProducts: any;
  mainId: string;
  metaFieldId: string;
  productId: string;
  fetchData: any;
  setIsProductLoading: any;
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [subproductId, setSubProductId] = useState<string[]>([]);
  const allSubProductId = subProducts?.map(({ id }) => id);
  const [updatedIndexId, setUpdatedIndexId] = useState<string[]>([]);

  const handleDragStart = (event: React.DragEvent, index: number) => {
    // event.preventDefault();
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

      const ids = subProducts.map(({ id }) => id);
      const updatedIds = updatedSubProducts.map(({ id }) => id);
      setUpdatedIndexId(updatedIds);
      console.log(ids);
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
    const ids = subProducts.map(({ id }) => id);
    console.log(ids);
    console.log(id);
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
        multiple: 4,
        filter: {
          variants: false,
          archived: false,
          draft: false,
        },
      });

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

  const handleEdiRelatedProduct = async () => {
    const arrayId = subProducts.map((product: any) => {
      return {
        id: product.id,
      };
    });
    try {
      const selected = await shopify.resourcePicker({
        type: "product",
        selectionIds: arrayId,
        multiple: 4,
        action: "select",
        filter: {
          variants: false,
          archived: false,
          draft: false,
        },
      });

      // Take the id from the selected array
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
  // useEffect(() => {
  //   fetchData(metaFieldId, productId);
  // }, [metaFieldId, productId]);
  return (
    <div className=" flex  gap-2 flex-col">
      <AnimatePresence>
        <div className=" flex flex-col gap-2 items-center py-5">
          <h1 className="font-semibold text-lg tracking-wide ">
            Recommended Products
          </h1>
          <div className="flex justify-between items-center border-b w-full  py-2">
            <p className=" font-semibold text-xs w-full  px-4 text-left leading-4 text-gray-700 tracking-wider">
              Product
            </p>

            <p className=" font-semibold text-xs px-4 w-[17%] text-left leading-4 text-gray-700 tracking-wider">
              Inventory
            </p>
            <p className=" font-semibold text-xs px-4 w-[10%] text-left leading-4 text-gray-700 tracking-wider">
              Price
            </p>

            <p className=" font-semibold text-xs  w-[15%] px-4 text-left leading-4 text-gray-700 tracking-wider">
              Vendor
            </p>
            <button
              disabled={subproductId.length === 0}
              onClick={handleClick}
              className="bg-red-500 rounded-md disabled:bg-red-300 hover:bg-red-700 py-2 px-6 text-white "
            >
              Delete
            </button>
          </div>
        </div>
        {subProducts?.map((product: any, index: number) => (
          <motion.div
            key={product.id}
            onClick={() => handleDeleteProduct(product.id)}
            className={`flex cursor-pointer flex-col border-b items-center justify-between 
              ${subproductId.includes(product.id) ? "bg-gray-200" : ""}
              ${draggingIndex === index ? "bg-gray-200 " : ""}`}
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
              <motion.div
                className="cursor-pointer px-2 py-1"
                draggable={true}
                onDragStart={(event: any) => handleDragStart(event, index)}
                onDragOver={(event) => handleDragOver(event, index)}
                onDrop={handleDrop}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MdDragIndicator className="w-5 h-5" />
              </motion.div>

              <p className="py-2 px-4 flex items-center w-1/2">
                <img
                  src={
                    product.featuredImage === null
                      ? "https://www.electriciens-sans-frontieres.org/web/app/plugins/wp-media-folder/assets/images/gallery_hover-avada.svg"
                      : product.featuredImage?.url
                  }
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
          </motion.div>
        ))}
        <div className="flex gap-2 items-center">
          {subProducts === undefined ? (
            <button
              onClick={handleAddRelatedProduct}
              className="bg-sky-400 hover:bg-sky-600 py-2 px-4 items-start text-white rounded-md tracking-wider"
            >
              Add Product
            </button>
          ) : (
            <>
              <button
                onClick={handleEdiRelatedProduct}
                className="bg-green-400 hover:bg-green-600 py-2 px-4 items-start text-white rounded-md tracking-wider"
              >
                Edit Product
              </button>
              {updatedIndexId.length !== 0 && (
                <button className="bg-blue-500 py-2 hover:bg-blue-600 px-4 text-white rounded-md tracking-wider">
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
