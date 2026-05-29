import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Dummy data for bypass
        if (credentials?.email && credentials?.password) {
          return { id: "1", name: "Admin", email: credentials.email, role: "employer" };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET || "mvshine-123",
};

const handler = NextAuth(authOptions);

// YE LINE SABSE JARURI HAI
export { handler as GET, handler as POST };