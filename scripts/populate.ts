// backend/scripts/populate.ts
import 'dotenv/config';
import path from 'path';
import { bootstrap } from '@vendure/core';
import { populate } from '@vendure/core/cli';
import { config } from '../src/vendure-config';

const initialData = require.resolve('@vendure/create/assets/initial-data.json');
const productsCsv = require.resolve('@vendure/create/assets/products.csv');

(async () => {
  try {
    await populate(
      () => bootstrap(config), // 👈 wrap config in bootstrap
      initialData,
      productsCsv,
    );
    console.log('✅ Populated DB with demo data');
    process.exit(0);
  } catch (err) {
    console.error('❌ Populate failed:', err);
    process.exit(1);
  }
})();
