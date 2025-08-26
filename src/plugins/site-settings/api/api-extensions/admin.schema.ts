import { gql } from 'graphql-tag';

export const adminApiExtensions = gql/* GraphQL */`
  type SiteSettings {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    key: String!
    title: String!
    primaryColor: String!
  }

  input UpdateSiteSettingsInput {
    title: String
    primaryColor: String
  }

  extend type Query {
    siteSettings: SiteSettings!
  }

  extend type Mutation {
    updateSiteSettings(input: UpdateSiteSettingsInput!): SiteSettings!
  }
`;
