import * as dotenv from 'dotenv';
import 'dotenv/config';
import {defineConfig} from "drizzle-kit";

dotenv.config({
    path: '.env.local',
});

export default defineConfig({
    schema: './server/schema.ts',
    dialect: 'postgresql',
    out: './server/migrations',
    dbCredentials: {
        url: process.env.POSTGRES_URL!,
    },
})