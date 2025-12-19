import { neon } from '@neondatabase/serverless';

// Neon serverless connection
const sql = neon(process.env.DATABASE_URL!);

export { sql };

// Database utility functions
export async function query<T>(queryString: string, params?: unknown[]): Promise<T[]> {
  try {
    const result = await sql(queryString, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

