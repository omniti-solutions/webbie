import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { ExportRequest, ExportResponse } from '@/types/editor';

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();

    // Validate request
    if (!body.content) {
      return NextResponse.json<ExportResponse>({
        success: false,
        error: 'Website content is required'
      }, { status: 400 });
    }

    const { content, includeAssets } = body;
    const zip = new JSZip();

    // Create main HTML file
    const mainHTML = generateMainHTML(content);
    zip.file('index.html', mainHTML);

    // Add CSS files
    const cssFolder = zip.folder('css');
    if (cssFolder) {
      content.css.forEach((cssFile, index) => {
        const filename = cssFile.name || `style-${index + 1}.css`;
        cssFolder.file(filename, cssFile.content);
      });
    }

    // Add JavaScript files
    const jsFolder = zip.folder('js');
    if (jsFolder) {
      content.js.forEach((jsFile, index) => {
        const filename = jsFile.name || `script-${index + 1}.js`;
        jsFolder.file(filename, jsFile.content);
      });
    }

    // Add assets if requested
    if (includeAssets && content.assets.length > 0) {
      const assetsFolder = zip.folder('assets');
      if (assetsFolder) {
        // For now, just create a manifest of assets
        // In a full implementation, you'd fetch the actual asset files
        const assetManifest = content.assets.map(asset => ({
          name: asset.name,
          type: asset.type,
          originalUrl: asset.originalUrl,
          mimeType: asset.mimeType
        }));

        assetsFolder.file('assets-manifest.json', JSON.stringify(assetManifest, null, 2));

        // Add a README for assets
        assetsFolder.file('README.md',
          '# Assets\n\n' +
          'This folder contains the asset manifest for the website.\n' +
          'Original assets can be downloaded from the URLs listed in assets-manifest.json\n\n' +
          '## Asset Types\n' +
          `- Images: ${content.assets.filter(a => a.type === 'image').length}\n` +
          `- Fonts: ${content.assets.filter(a => a.type === 'font').length}\n` +
          `- Other: ${content.assets.filter(a => !['image', 'font'].includes(a.type)).length}\n`
        );
      }
    }

    // Add metadata file
    zip.file('metadata.json', JSON.stringify({
      originalUrl: content.url,
      title: content.title,
      exportedAt: new Date().toISOString(),
      metadata: content.metadata
    }, null, 2));

    // Add README
    zip.file('README.md', generateReadme(content));

    // Generate the ZIP file
    const zipBuffer = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9
      }
    });

    // Create filename based on website title or domain
    const domain = new URL(content.url).hostname.replace(/[^a-zA-Z0-9]/g, '-');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `website-${domain}-${timestamp}.zip`;

    // Return the ZIP file
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error exporting website:', error);

    return NextResponse.json<ExportResponse>({
      success: false,
      error: 'Failed to export website'
    }, { status: 500 });
  }
}

function generateMainHTML(content: any): string {
  // Build links to external CSS files
  const cssLinks = content.css.map((cssFile: any, index: number) => {
    const filename = cssFile.name || `style-${index + 1}.css`;
    const media = cssFile.media && cssFile.media !== 'all' ? ` media="${cssFile.media}"` : '';
    return `  <link rel="stylesheet" href="css/${filename}"${media}>`;
  }).join('\n');

  // Build script tags for external JS files
  const jsScripts = content.js.map((jsFile: any, index: number) => {
    const filename = jsFile.name || `script-${index + 1}.js`;
    const type = jsFile.type && jsFile.type !== 'text/javascript' ? ` type="${jsFile.type}"` : '';
    return `  <script src="js/${filename}"${type}></script>`;
  }).join('\n');

  // Extract body content from the parsed HTML
  let bodyContent = content.html;

  // Try to extract just the body content if it's a full HTML document
  const bodyMatch = content.html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  }

  return `<!DOCTYPE html>
<html lang="${content.metadata.language || 'en'}">
<head>
  <meta charset="${content.metadata.charset || 'UTF-8'}">
  <meta name="viewport" content="${content.metadata.viewport || 'width=device-width, initial-scale=1.0'}">
  <title>${content.title}</title>
  ${content.metadata.description ? `<meta name="description" content="${content.metadata.description}">` : ''}
  ${content.metadata.author ? `<meta name="author" content="${content.metadata.author}">` : ''}
  ${content.favicon ? `<link rel="icon" href="${content.favicon}">` : ''}

  <!-- Generated by Web Editor Pro -->
  <meta name="generator" content="Web Editor Pro">
  <meta name="original-url" content="${content.url}">

${cssLinks}
</head>
<body>
${bodyContent}

${jsScripts}
</body>
</html>`;
}

function generateReadme(content: any): string {
  return `# ${content.title}

This website was exported from **${content.url}** using Web Editor Pro.

## Export Information

- **Original URL**: ${content.url}
- **Exported**: ${new Date().toLocaleString()}
- **Title**: ${content.title}
${content.metadata.description ? `- **Description**: ${content.metadata.description}` : ''}

## File Structure

- \`index.html\` - Main HTML file
- \`css/\` - Stylesheet files
- \`js/\` - JavaScript files
- \`assets/\` - Images, fonts, and other resources (if included)
- \`metadata.json\` - Website metadata and export information

## CSS Files (${content.css.length})

${content.css.map((css: any, index: number) =>
  `- \`${css.name || `style-${index + 1}.css`}\` - ${css.source} stylesheet${css.media && css.media !== 'all' ? ` (${css.media})` : ''}`
).join('\n')}

## JavaScript Files (${content.js.length})

${content.js.map((js: any, index: number) =>
  `- \`${js.name || `script-${index + 1}.js`}\` - ${js.source} script${js.type && js.type !== 'text/javascript' ? ` (${js.type})` : ''}`
).join('\n')}

${content.assets.length > 0 ? `
## Assets (${content.assets.length})

${content.assets.map((asset: any) =>
  `- \`${asset.name}\` - ${asset.type} (${asset.originalUrl})`
).join('\n')}
` : ''}

## Usage

1. Open \`index.html\` in a web browser
2. Ensure all files remain in their respective folders
3. For full functionality, serve from a web server rather than opening directly in browser

## Notes

- This export contains the website as it was at the time of capture
- External resources may need to be downloaded separately
- Some functionality may require a web server environment
- Relative paths have been preserved where possible

---

*Generated by Web Editor Pro - A powerful web-based HTML/CSS editor*
`;
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
