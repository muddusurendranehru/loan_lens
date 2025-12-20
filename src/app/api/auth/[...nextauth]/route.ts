import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { Session, User } from 'next-auth';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id?: string;
  }
  interface Session {
    user: {
      id?: string;
      email?: string;
    };
  }
}

export const authOptions = {
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

          // Check database for user (using password column for verification)
          const users = await sql`
            SELECT id, email, password FROM users WHERE email = ${credentials.email.toLowerCase()}
          `;

          if (!users || users.length === 0) {
            console.log('User not found:', credentials.email);
            return null;
          }

          const user = users[0];

          if (!user.password) {
            console.error('User has no password set');
            return null;
          }

          // Verify password using password column
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
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // After sign in, redirect to dashboard
      if (url.includes('/login') || url === baseUrl) {
        return `${baseUrl}/dashboard`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
  session: {
    strategy: 'jwt' as const
  },
  secret: process.env.NEXTAUTH_SECRET || 'loan_lens_secret_key_2024'
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

