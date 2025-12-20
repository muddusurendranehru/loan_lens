import { neon } from '@neondatabase/serverless';

// Neon serverless connection
const sql = neon(process.env.DATABASE_URL!);

export { sql };

