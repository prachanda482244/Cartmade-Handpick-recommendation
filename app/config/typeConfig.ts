export interface pageInformation {
  endCursor: string;
  startCursor: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface query {
  firstLastValue: string | any;
  afterBeforeValue?: string | any;
  pageToken?: string | any;
  searchQuery?: string | any;
}
export interface Products {
  node: {
    id: string;
    metafields?: {
      edges?: Array<{
        node: {
          id: string;
        };
      }>;
    };
    priceRange: {
      minVariantPrice: {
        amount: string;
      };
    };
    featuredImage: {
      url: string;
    };
    status: string;
    title: string;
    totalInventory: number;
    vendor: string;
    createdAt: string;
  };
}
export interface subProducts {
  id: string;
  featuredImage?: {
    url: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
    };
  };
  title: string;
  totalInventory: number;
  vendor: string;
}
