export const queryFunction = (
  firstLastValue: string | any,
  afterBeforeValue: string | any,
  pageToken: string | any,
) => {
  const query = `
    {
      products(${firstLastValue}:5, ${afterBeforeValue}:"${pageToken}"  ) {
       pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
        edges {
          node {
            id
            title
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
  console.log(query);
  console.log("Prachanda");
  return query;
};
