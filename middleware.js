import { NextResponse } from 'next/server';

export function middleware(request) {
  // Add a timestamp to help diagnose connection issues
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  
  console.log(`Request started: ${requestId} - ${request.nextUrl.pathname}`);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Only run middleware on API paths that might use Prisma
export const config = {
  matcher: '/api/:path*',
};
