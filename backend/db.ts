import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined");
} else {
    console.log("DATABASE_URL is defined");
    console.log("Length:", process.env.DATABASE_URL.length);
    console.log("First char:", process.env.DATABASE_URL.charAt(0));
    console.log("Last char:", process.env.DATABASE_URL.charAt(process.env.DATABASE_URL.length - 1));
}

const connectionString = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace(/^psql\s+/, '').replace(/^['"]|['"]$/g, '').trim()
    : "";

if (connectionString) {
    console.log("URL Prefix:", connectionString.substring(0, 10));
}

const pool = new Pool({ connectionString });

export default pool;
