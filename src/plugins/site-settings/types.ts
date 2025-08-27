import { CustomFieldsObject } from '@vendure/common/lib/shared-types';
import { ID } from '@vendure/core';

export interface CreateSiteSettingsInput {
  key: string;
  title: string;
  primaryColor: string;
  accountHeading: string;
  customFields?: CustomFieldsObject;
}

export interface UpdateSiteSettingsInput {
  id: ID;
  key?: string;
  title?: string;
  primaryColor?: string;
  accountHeading?: string; // optional on update
  customFields?: CustomFieldsObject;
}
