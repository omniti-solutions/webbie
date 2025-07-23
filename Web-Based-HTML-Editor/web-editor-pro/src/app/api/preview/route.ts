import { NextRequest, NextResponse } from 'next/server';
import { PreviewRequest, PreviewResponse } from '@/types/editor';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialize DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequest = await request.json();

    // Validate request
    if (!body.html) {
      return NextResponse.json<PreviewResponse>({
        success: false,
        error: 'HTML content is required'
      }, { status: 400 });
    }

    // Generate preview HTML
    const previewHtml = generatePreviewHTML(body.html, body.css || [], body.js || []);

    // Create a data URL for the preview
    const previewDataUrl = `data:text/html;base64,${Buffer.from(previewHtml).toString('base64')}`;

    return NextResponse.json<PreviewResponse>({
      success: true,
      previewUrl: previewDataUrl
    });

  } catch (error) {
    console.error('Error generating preview:', error);

    return NextResponse.json<PreviewResponse>({
      success: false,
      error: 'Failed to generate preview'
    }, { status: 500 });
  }
}

function generatePreviewHTML(html: string, cssFiles: any[], jsFiles: any[]): string {
  // Sanitize HTML content
  const sanitizedHTML = purify.sanitize(html, {
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    ADD_TAGS: ['style', 'script'],
    ADD_ATTR: ['target', 'rel', 'type']
  });

  // Combine all CSS
  const combinedCSS = cssFiles
    .map(file => file.content)
    .join('\n\n/* Next File */\n\n');

  // Combine all JS (with safety measures)
  const combinedJS = jsFiles
    .filter(file => file.type !== 'module') // Skip modules for security
    .map(file => {
      // Wrap in try-catch to prevent errors from breaking the preview
      return `
        try {
          ${file.content}
        } catch (error) {
          console.warn('Error in ${file.name}:', error);
        }
      `;
    })
    .join('\n\n/* Next File */\n\n');

  // Build complete HTML document
  const previewHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>

  <!-- Content Security Policy for safety -->
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self' data: https:;
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
    style-src 'self' 'unsafe-inline' https:;
    img-src 'self' data: https: http:;
    font-src 'self' data: https:;
    connect-src 'self' https:;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
  ">

  <style>
    /* Reset and base styles */
    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }

    /* User styles */
    ${combinedCSS}

    /* Preview-specific styles */
    body::before {
      content: 'PREVIEW MODE';
      position: fixed;
      top: 0;
      right: 0;
      background: rgba(59, 130, 246, 0.9);
      color: white;
      padding: 4px 8px;
      font-size: 10px;
      font-family: monospace;
      z-index: 999999;
      pointer-events: none;
      border-bottom-left-radius: 4px;
    }
  </style>
</head>
<body>
  ${sanitizedHTML}

  <script>
    // Console wrapper to show errors in preview
    const originalError = console.error;
    console.error = function(...args) {
      originalError.apply(console, args);

      // Show error notification in preview
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = \`
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: #ef4444;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        z-index: 999998;
        max-width: 300px;
        word-wrap: break-word;
      \`;
      errorDiv.textContent = 'JS Error: ' + args.join(' ');
      document.body.appendChild(errorDiv);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 5000);
    };

    // Prevent infinite loops and malicious code
    let executionCount = 0;
    const originalSetInterval = setInterval;
    const originalSetTimeout = setTimeout;

    window.setInterval = function(fn, delay) {
      if (++executionCount > 100) {
        console.error('Too many intervals created, blocking to prevent infinite loops');
        return -1;
      }
      return originalSetInterval(fn, Math.max(delay, 16)); // Minimum 16ms
    };

    window.setTimeout = function(fn, delay) {
      if (++executionCount > 1000) {
        console.error('Too many timeouts created, blocking to prevent infinite loops');
        return -1;
      }
      return originalSetTimeout(fn, Math.max(delay, 0));
    };

    // Block dangerous functions
    window.eval = function() {
      console.error('eval() is blocked in preview mode');
      return undefined;
    };

    // User scripts
    ${combinedJS}
  </script>
</body>
</html>`;

  return previewHTML;
}

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
