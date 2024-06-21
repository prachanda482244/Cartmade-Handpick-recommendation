import { motion, AnimatePresence } from "framer-motion";
import { MdDragIndicator } from "react-icons/md";
import { useState } from "react";

const SubProduct = ({ subProducts, setSubProducts, featuredImage }: any) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleDragStart = (event: React.DragEvent, index: number) => {
    // event.preventDefault();
    setDraggingIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (draggingIndex === null) return;

    if (index !== draggingIndex) {
      const updatedSubProducts = [...subProducts];
      const [draggedItem] = updatedSubProducts.splice(draggingIndex, 1);
      updatedSubProducts.splice(index, 0, draggedItem);

      setSubProducts(updatedSubProducts);
      setDraggingIndex(index);
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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SubProduct;
