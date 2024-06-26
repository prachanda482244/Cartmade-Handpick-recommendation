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
}: {
  subProducts: subProducts[];
  setSubProducts: any;
  mainId: string;
  metaFieldId: string;
  productId: string;
  fetchData: any;
}) => {
  console.log(productId, "pid");
  console.log(metaFieldId, "mid");
  // useEffect(() => {
  //   fetchData(metaFieldId, productId);
  // }, [metaFieldId, productId]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

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
      console.log(subProducts, "Subproducts");

      const ids = subProducts.map(({ id }) => id);
      console.log(ids);
      // const queryString = ids
      //   ?.map((id, index) => `productIds[${index}]=${encodeURIComponent(id)}`)
      //   .join("&");

      // const parts: any = mainId?.split("/");
      // const productId = parseInt(parts[parts?.length - 1]);
      // console.log(queryString, "query string");
      // const response = await fetch(
      //   `/api/metafield?${queryString}&mainProductId=${productId}`,
      // );

      // const data = await response.json();
      // // setSubProducts(data);
      // console.log("Metafield data:", data.data);
      // fetchData(
      //   "gid://shopify/Product/" + data.data.id,
      //   "gid://shopify/Product/" + data.data.product_id,
      // );
    }
  };

  const handleDrop = () => {
    setDraggingIndex(null);
  };

  return (
    <div>
      <AnimatePresence>
        {subProducts?.map((product: any, index: number) => (
          <motion.div
            key={product.id}
            className={`flex flex-col border-b items-center justify-between ${
              draggingIndex === index ? "bg-gray-200" : ""
            }`}
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
      </AnimatePresence>
    </div>
  );
};

export default SubProduct;
