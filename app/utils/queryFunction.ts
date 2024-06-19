import { query } from "~/config/typeConfig";

export const queryFunction = ({
  firstLastValue,
  afterBeforeValue,
  pageToken,
  searchQuery,
}: query) => {
  console.log(searchQuery);
  const condition =
    searchQuery !== undefined
      ? `query:"${searchQuery}"`
      : `${afterBeforeValue}:"${pageToken}"`;
  const query = `
    {
      products(${firstLastValue}:10, ${condition}  ) {
       pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
        edges {
          node {
          id
          status
        totalInventory
         metafields(first:1 , keys:["custom.recommended_produccts"]) { 
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        title
            createdAt
     		    vendor
            featuredImage {
              url
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
    
    `;
  return query;
};
