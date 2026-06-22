import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SYNC_URL = "https://script.google.com/macros/s/AKfycbw7899PiN_DRzu5Bl5pLSFY8ZR2loIl0NnewFn-gIYygBF1DyFvlj4vcEVmQSH2zYI3";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  
  if (!email) {
    return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
  }

  const scriptUrl = process.env.SYNC_URL || DEFAULT_SYNC_URL;

  try {
    const res = await fetch(`${scriptUrl}?email=${encodeURIComponent(email)}`, {
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
    const { email, data } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    const scriptUrl = process.env.SYNC_URL || DEFAULT_SYNC_URL;

    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, data }),
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
