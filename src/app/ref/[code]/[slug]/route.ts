import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string; slug: string }> }
) {
  const { code, slug } = await params;
  const url = new URL(`/product/${slug}`, request.url);
  url.searchParams.set("ref", code);
  return NextResponse.redirect(url);
}
