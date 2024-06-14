interface query {
  firstLastValue: string | any;
  afterBeforeValue?: string | any;
  pageToken?: string | any;
  searchQuery?: string | any;
}

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
