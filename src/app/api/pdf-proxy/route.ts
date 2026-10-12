import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get('url');

  if (!pdfUrl) {
    return new NextResponse('Missing PDF URL parameter', { status: 400 });
  }

  try {
    const pdfResponse = await fetch(pdfUrl, {
      headers: {
        // Add a browser-like User-Agent to avoid being blocked by servers.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!pdfResponse.ok) {
       console.error(`Failed to fetch PDF: ${pdfResponse.statusText} (Status: ${pdfResponse.status})`, { url: pdfUrl });
      return new NextResponse(`Failed to fetch PDF: ${pdfResponse.statusText}`, {
        status: pdfResponse.status,
      });
    }

    const blob = await pdfResponse.blob();
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');

    return new NextResponse(blob, { status: 200, headers });

  } catch (error) {
    console.error('PDF Proxy Error:', error);
    return new NextResponse('Error fetching PDF from external source.', { status: 500 });
  }
}
