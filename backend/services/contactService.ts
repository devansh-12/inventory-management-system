import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

export const getAllContacts = async () => {
    const contacts = await sql`
    SELECT id, name FROM contacts ORDER BY name ASC
  `;
    return contacts;
};
