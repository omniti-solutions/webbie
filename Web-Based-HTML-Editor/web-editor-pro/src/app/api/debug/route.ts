import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the fetch-website API internally
    const testUrl = 'https://example.com';
    console.log('🔍 Debug: Testing internal API with:', testUrl);

    // Simulate the same request the frontend makes
    const response = await fetch('https://example.com');
    const html = await response.text();

    console.log('🔍 Debug: Received HTML length:', html.length);
    console.log('🔍 Debug: First 200 chars:', html.substring(0, 200));

    // Check for problematic characters
    const problemChars = html.match(/[\x00-\x1F\x7F-\x9F]/g);
    if (problemChars) {
      console.log('🔍 Debug: Found problematic characters:', problemChars.slice(0, 10));
    }

    // Try to create a safe response
    const safeResponse = {
      status: 'debug',
      htmlLength: html.length,
      hasProblematicChars: !!problemChars,
      problematicCharCount: problemChars?.length || 0,
      firstChars: html.substring(0, 100),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(safeResponse);

  } catch (error) {
    console.error('🔍 Debug: Error occurred:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
