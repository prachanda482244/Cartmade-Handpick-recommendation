export interface pageInfomation {
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
