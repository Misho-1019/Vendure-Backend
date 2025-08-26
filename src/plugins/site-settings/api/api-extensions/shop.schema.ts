import { gql } from 'graphql-tag';

export const shopApiExtensions = gql/* GraphQL */`
  type SiteTheme {
    title: String!
    primaryColor: String!
  }

  extend type Query {
    siteTheme: SiteTheme!
  }
`;
