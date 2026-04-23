import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const url = new URL("/", request.url);
  url.searchParams.set("ref", code);
  return NextResponse.redirect(url);
}
