import { useState } from "react";

const route = () => {
  const [product, setProduct] = useState<any>([]);
  const handleAddProduct = async () => {
    const selected = await shopify.resourcePicker({
      type: "product",
      multiple: true,
    });
    setProduct(selected);
  };

  const handleEditProduct = async () => {
    const selected = await shopify.resourcePicker({
      type: "product",
      selectionIds: [
        {
          id: "gid://shopify/Product/7987895992492",
        },
        {
          id: "gid://shopify/Product/7954935120044",
        },
        {
          id: "gid://shopify/Product/7980830032044",
        },
        {
          id: "gid://shopify/Product/7947110711468",
        },
      ],
      multiple: 4,
    });
  };

  console.log(product);

  return (
    <div>
      <h1>App brigde</h1>

      <button
        className="bg-green-600 py-2 px-5 m-2 "
        onClick={handleAddProduct}
      >
        Add products{" "}
      </button>
      <button
        className="bg-green-600 py-2 px-5 m-2 "
        onClick={handleEditProduct}
      >
        Edit products
      </button>

      <div>
        <h2>RESULT</h2>
        {product.map((p: any) => (
          <div>{p.handle}</div>
        ))}
      </div>
    </div>
  );
};

export default route;
