// ✅ CORRECT FOR CLERK v6
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
