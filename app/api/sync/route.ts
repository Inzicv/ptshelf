import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SYNC_URL = "https://script.google.com/macros/s/AKfycbyMc_hoyLBpqiGTmllisM-naUHTtNPULWAVGpGANpotDGoEN8G9HV5BDuXJrmpd7Ad4NA/exec";

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

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "Configuration Apps Script requise : L'API a renvoyé une page de connexion Google. Veuillez configurer le déploiement de votre script avec l'option 'Qui a accès : Tout le monde' (Anyone) dans l'éditeur Google Apps Script et recréer la version." },
        { status: 401 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Apps Script error: ${res.statusText || res.status}` },
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

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "Configuration Apps Script requise : L'API a renvoyé une page de connexion Google. Veuillez configurer le déploiement de votre script avec l'option 'Qui a accès : Tout le monde' (Anyone) dans l'éditeur Google Apps Script et recréer la version." },
        { status: 401 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Apps Script error: ${res.statusText || res.status}` },
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
