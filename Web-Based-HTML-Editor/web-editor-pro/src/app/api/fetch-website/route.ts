import { NextRequest, NextResponse } from 'next/server';
import { WebsiteParser } from '@/lib/website-parser';
import { FetchWebsiteRequest, FetchWebsiteResponse, WebsiteContentSerialized } from '@/types/editor';
import { truncateContent, validateJSONResponse } from '@/lib/json-utils';

const parser = new WebsiteParser(30000, 50 * 1024 * 1024); // 30s timeout, 50MB max

export async function POST(request: NextRequest) {
  try {
    const body: FetchWebsiteRequest = await request.json();

    // Validate request
    if (!body.url) {
      return NextResponse.json<FetchWebsiteResponse>({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(body.url.startsWith('http') ? body.url : `https://${body.url}`);
    } catch {
      return NextResponse.json<FetchWebsiteResponse>({
        success: false,
        error: 'Invalid URL format'
      }, { status: 400 });
    }

    // Security check - prevent internal network access
    const url = new URL(body.url.startsWith('http') ? body.url : `https://${body.url}`);
    const hostname = url.hostname.toLowerCase();

    // Block internal/private networks
    const blockedPatterns = [
      /^localhost$/,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/
    ];

    if (blockedPatterns.some(pattern => pattern.test(hostname))) {
      return NextResponse.json<FetchWebsiteResponse>({
        success: false,
        error: 'Access to internal networks is not allowed'
      }, { status: 403 });
    }

    // Parse the website
    const parseOptions = {
      includeInlineStyles: true,
      includeInlineScripts: true,
      includeExternalAssets: body.includeAssets !== false,
      sanitizeContent: true,
      preserveComments: false
    };

    console.log(`Fetching website: ${url.toString()}`);
    const websiteContent = await parser.parseWebsite(url.toString(), parseOptions);

    console.log(`Successfully parsed website: ${websiteContent.title}`);
    console.log(`- HTML length: ${websiteContent.html.length}`);
    console.log(`- CSS files: ${websiteContent.css.length}`);
    console.log(`- JS files: ${websiteContent.js.length}`);
    console.log(`- Assets: ${websiteContent.assets.length}`);

    // Safely serialize the website content to prevent JSON errors
    const safeWebsiteContent = {
      url: websiteContent.url,
      title: websiteContent.title || '',
      favicon: websiteContent.favicon,
      html: truncateContent(websiteContent.html || '', 2000000), // 2MB limit for HTML
      css: websiteContent.css.map(css => ({
        id: css.id,
        name: css.name,
        content: truncateContent(css.content || '', 500000), // 500KB limit per CSS file
        source: css.source,
        url: css.url,
        media: css.media
      })),
      js: websiteContent.js.map(js => ({
        id: js.id,
        name: js.name,
        content: truncateContent(js.content || '', 500000), // 500KB limit per JS file
        source: js.source,
        url: js.url,
        type: js.type
      })),
      assets: websiteContent.assets.slice(0, 100).map(asset => ({ // Limit to 100 assets
        id: asset.id,
        type: asset.type,
        originalUrl: asset.originalUrl,
        localUrl: asset.localUrl,
        name: asset.name,
        size: asset.size,
        mimeType: asset.mimeType
      })),
      metadata: {
        title: websiteContent.metadata.title || '',
        description: websiteContent.metadata.description || '',
        viewport: websiteContent.metadata.viewport || '',
        charset: websiteContent.metadata.charset || 'UTF-8',
        language: websiteContent.metadata.language || '',
        author: websiteContent.metadata.author || '',
        canonical: websiteContent.metadata.canonical || ''
      },
      parsedAt: websiteContent.parsedAt.toISOString() // Convert Date to string
    };

    // Validate the response before sending
    if (!validateJSONResponse(safeWebsiteContent)) {
      throw new Error('Response data contains non-serializable content');
    }

    return NextResponse.json<FetchWebsiteResponse>({
      success: true,
      data: safeWebsiteContent as WebsiteContentSerialized
    });

  } catch (error) {
    console.error('Error fetching website:', error);

    let errorMessage = 'Failed to fetch website';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Handle specific error types
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Website not found or unreachable';
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'Request timed out - website took too long to respond';
    } else if (errorMessage.includes('too large')) {
      errorMessage = 'Website content is too large to process';
    } else if (errorMessage.includes('HTTP 404')) {
      errorMessage = 'Website not found (404)';
    } else if (errorMessage.includes('HTTP 403')) {
      errorMessage = 'Access forbidden (403)';
    } else if (errorMessage.includes('HTTP 500')) {
      errorMessage = 'Website server error (500)';
    }

    return NextResponse.json<FetchWebsiteResponse>({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
