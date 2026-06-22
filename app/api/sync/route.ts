import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scriptUrl = searchParams.get("url");
  if (!scriptUrl) {
    return NextResponse.json({ error: "Missing script URL" }, { status: 400 });
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Apps Script error: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url: scriptUrl, data } = body;
    if (!scriptUrl) {
      return NextResponse.json({ error: "Missing script URL" }, { status: 400 });
    }

    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Apps Script error: ${res.statusText}` },
        { status: res.status }
      );
    }

    const resData = await res.json();
    return NextResponse.json(resData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
