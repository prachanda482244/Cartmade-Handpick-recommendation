import { motion } from "framer-motion";
const SubProduct = ({
  subProducts,
  handleDragOver,
  handleDragStart,
  featuredImage,
  handleDrop,
}: any) => {
  return (
    <div>
      {subProducts?.map((product: any, index: number) => (
        <motion.div
          className="hover:bg-gray-200 flex flex-col border-b items-center  justify-between cursor-pointer"
          key={product.id}
          draggable={true}
          onDragStart={(event) => handleDragStart(event, index)}
          onDragOver={handleDragOver}
          onDrop={(event) => handleDrop(event, index)}
          whileHover={{ scale: 1.05, zIndex: 1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
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
        </motion.div>
      ))}
    </div>
  );
};

export default SubProduct;
