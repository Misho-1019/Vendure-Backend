import { gql } from 'graphql-tag';

export const adminApiExtensions = gql/* GraphQL */ `
  type SiteSettings {
    id: ID!
    key: String!
    title: String!
    primaryColor: String!
    accountHeading: String!
  }

  input CreateSiteSettingsInput {
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
    siteSettings(id: ID!): SiteSettings
    siteSettingsByKey(key: String!): SiteSettings
  }

  extend type Mutation {
    createSiteSettings(input: CreateSiteSettingsInput!): SiteSettings!
    updateSiteSettings(input: UpdateSiteSettingsInput!): SiteSettings!
    deleteSiteSettings(id: ID!): DeletionResponse!
  }
`;
