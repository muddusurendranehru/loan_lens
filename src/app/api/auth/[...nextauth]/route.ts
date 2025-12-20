import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Validate DATABASE_URL
          if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL is not configured');
            return null;
          }

          // Check database for user
          const result = await pool.query(
            'SELECT id, email, password FROM users WHERE email = $1',
            [credentials.email.toLowerCase()]
          );

          if (!result.rows || result.rows.length === 0) {
            console.log('User not found:', credentials.email);
            return null;
          }

          const user = result.rows[0];

          if (!user.password) {
            console.error('User has no password set');
            return null;
          }

          // Verify password
          const isValid = bcrypt.compareSync(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }

          // Return user object (password excluded)
          return {
            id: user.id,
            email: user.email,
            name: user.email.split('@')[0] // Use email prefix as name
          };
        } catch (error: any) {
          console.error('Auth error:', error?.message || error);
          // Return null instead of throwing to prevent 500 errors
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to dashboard
      if (url.includes('/login') || url === baseUrl) {
        return `${baseUrl}/dashboard`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'loan_lens_secret_key_2024'
});

export { handler as GET, handler as POST };

