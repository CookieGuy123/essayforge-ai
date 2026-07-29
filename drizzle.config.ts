import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  dbCredentials: {
    url: './src/db.sqlite',
  },
  out: './src/drizzle',
  schema: ['./src/db/schema.ts'],
});