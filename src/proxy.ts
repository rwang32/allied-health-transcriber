import { NextResponse, type NextRequest } from "next/server";

// Auth enforcement disabled — restore full implementation once sign-in page is built
export function proxy(request: NextRequest): NextResponse {
  return NextResponse.next({ request });
}
