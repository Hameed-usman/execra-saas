import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string;
    } & DefaultSession["user"]
  }

  interface User {
    tenantId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tenantId: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }
        
        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !(await bcrypt.compare(credentials.password as string, user.passwordHash))) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId
        };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session && session.user) {
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.tenantId = token.tenantId;
      }
      return session;
    }
  },
  session: { strategy: "jwt" }
});