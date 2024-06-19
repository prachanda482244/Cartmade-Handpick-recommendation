import { useState } from "react";
import { pageInfomation } from "~/config/typeConfig";

const data = [
  {
    id: 1,
    product: "test 2",
    status: "Active",
    inventory: "0 in stock",
    salesChannels: 3,
    markets: 2,
    category: "Occupational & Physical Therapy Equipment",
    type: "thelanyardauthority",
  },
  {
    id: 2,
    product: "test 2 (Copy)",
    status: "Active",
    inventory: "0 in stock",
    salesChannels: 3,
    markets: 2,
    category: "Occupational & Physical Therapy Equipment",
    type: "thelanyardauthority",
  },
  {
    id: 3,
    product: "test 3",
    status: "Active",
    inventory: "0 in stock",
    salesChannels: 3,
    markets: 2,
    category: "Occupational & Physical Therapy Equipment",
    type: "thelanyardauthority",
  },
  {
    id: 4,
    product: "test 3 (Copy)",
    status: "Active",
    inventory: "0 in stock",
    salesChannels: 3,
    markets: 2,
    category: "Occupational & Physical Therapy Equipment",
    type: "thelanyardauthority",
  },
  {
    id: 5,
    product: "test 4",
    status: "Active",
    inventory: "0 in stock",
    salesChannels: 3,
    markets: 2,
    category: "Occupational & Physical Therapy Equipment",
    type: "thelanyardauthority",
  },
  {
    id: 6,
    product: "test 4 (Copy)",
    status: "Active",
    inventory: "0 in stock",
    salesChannels: 3,
    markets: 2,
    category: "Occupational & Physical Therapy Equipment",
    type: "thelanyardauthority",
  },
  {
    id: 7,
    product: "test1",
    status: "Active",
    inventory: "0 in stock",
    salesChannels: 3,
    markets: 2,
    category: "Fertility Monitors and Ovulation Tests",
    type: "thelanyardauthority",
  },
  {
    id: 8,
    product: "test1 (Copy)",
    status: "Active",
    inventory: "0 in stock",
    salesChannels: 3,
    markets: 2,
    category: "Fertility Monitors and Ovulation Tests",
    type: "thelanyardauthority",
  },
];
const DataTableComponent = ({
  pageInformation,
  handlePrevPagination,
  handleNextPagination,
  products,
}: {
  pageInformation: pageInfomation;
  handlePrevPagination: any;
  handleNextPagination: any;
  products: any[];
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleClick = (productId: string, metaFieldId: string) => {
    setExpandedRow(expandedRow === productId ? null : productId);
  };

  const row = products.map((product) => {
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

    let metafieldId: any = null;
    if (metafields && metafields.edges) {
      const { edges = [] } = metafields;

      if (Array.isArray(edges) && edges.length > 0) {
        for (const edge of edges) {
          if (edge.node && edge.node.id) {
            metafieldId = edge.node.id;
            break;
          }
        }
      }
    }
    const isExpanded = expandedRow === id;
    return (
      <>
        <tr
          className="hover:bg-gray-200 cursor-pointer"
          key={id}
          onClick={() => handleClick(id, metafieldId)}
        >
          <td className="py-2 px-4 flex items-center border-b border-gray-200">
            <img src={featuredImage?.url} alt="Product" className="w-10 h-10" />
            {title}
          </td>
          <td className="py-2 px-4 border-b border-gray-200">
            <span className="bg-green-200 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
              {status}
            </span>
          </td>
          <td className="py-2 px-4 border-b border-gray-200 text-red-600">
            {totalInventory}
          </td>
          <td className="py-2 px-4 border-b border-gray-200">
            {priceRange?.minVariantPrice?.amount}
          </td>
          <td className="py-2 px-4 border-b border-gray-200">{createdAt}</td>
          <td className="py-2 px-4 border-b border-gray-200">{vendor}</td>
        </tr>
        <tr className="border flex justify-center border-red-900">
          <div className="border mx-auto">
            <td className="py-2 px-4 border-b border-gray-200">{createdAt}</td>
            <td className="py-2 px-4 border-b border-gray-200">{vendor}</td>
          </div>
        </tr>
      </>
    );
  });
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-700 tracking-wider">
                Product
              </th>
              <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-700 tracking-wider">
                Status
              </th>
              <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-700 tracking-wider">
                Inventory
              </th>
              <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-700 tracking-wider">
                Price
              </th>
              <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-700 tracking-wider">
                Created At
              </th>
              <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-700 tracking-wider">
                Vendor
              </th>
            </tr>
          </thead>
          <tbody>{row}</tbody>
        </table>
      </div>
    </div>
  );
};
export default DataTableComponent;
