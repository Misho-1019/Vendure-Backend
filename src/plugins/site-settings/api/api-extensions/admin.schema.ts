// backend/src/plugins/site-settings/api/admin.schema.ts
import { gql } from 'graphql-tag';

export const adminApiExtensions = gql/* GraphQL */ `
    type SiteSettings {
    id: ID!
    key: String!
    title: String!
    primaryColor: String!
    accountHeading: String!
  }

  input UpdateSiteSettingsInput {
    id: ID!
    title: String
    primaryColor: String
    accountHeading: String
  }

  extend type Query {
    siteSettings: SiteSettings
  }

  extend type Mutation {
    updateSiteSettings(input: UpdateSiteSettingsInput!): SiteSettings!
  }
`;
