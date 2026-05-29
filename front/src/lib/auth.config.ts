export const authConfig = {
  providers: [] as any[],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(nextUrl.pathname);

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL('/employer/dashboard', nextUrl));
        return true;
      }
      return isLoggedIn;
    },
  },
};