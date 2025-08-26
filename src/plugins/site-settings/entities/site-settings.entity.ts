import { DeepPartial, HasCustomFields, VendureEntity } from '@vendure/core';
import { Column, Entity } from 'typeorm';

export class SiteSettingsCustomFields {}

@Entity()
export class SiteSettings extends VendureEntity implements HasCustomFields {
  constructor(input?: DeepPartial<SiteSettings>) {
    super(input);
  }

  // We keep a single row identified by this key
  @Column({ unique: true, default: 'default' })
  key: string;

  // Minimal fields for Step 1
  @Column({ default: 'My Store' })
  title: string;

  @Column({ default: '#3b82f6' })
  primaryColor: string;

  @Column(type => SiteSettingsCustomFields)
  customFields: SiteSettingsCustomFields;
}
