import { ApolloServer, gql } from "apollo-server";

import prisma from "./db.server";

const typeDefs = gql`
  type Product {
    id: Int
    title: String
    price: Float
    createdAt: String
  }

  type RelatedProduct {
    id: Int
    mainProductId: Int
    relatedProductId: Int
  }

  type Query {
    products: [Product]
  }

  type Mutation {
    createProduct(title: String!, price: Float!): Product
  }
`;

const resolvers = {
  Query: {
    products: async () => {
      return await prisma.product.findMany();
    },
  },
  Mutation: {
    createProduct: async (
      _: any,
      { title, price }: { title: string; price: any },
    ) => {
      return await prisma.product.create({ data: { title, price } });
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }: string | any) => {
  console.log(`🚀 Server ready at ${url}`);
});
