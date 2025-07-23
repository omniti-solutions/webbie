import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import mimeTypes from 'mime-types';
import { WebsiteContent, CSSFile, JSFile, Asset, WebsiteMetadata, ParseOptions } from '@/types/editor';

// Initialize DOMPurify with JSDOM
const window = new JSDOM('').window;
const purify = DOMPurify(window);

export class WebsiteParser {
  private timeout: number;
  private maxSize: number;

  constructor(timeout = 30000, maxSize = 50 * 1024 * 1024) { // 50MB max
    this.timeout = timeout;
    this.maxSize = maxSize;
  }

  async parseWebsite(url: string, options: Partial<ParseOptions> = {}): Promise<WebsiteContent> {
    const defaultOptions: ParseOptions = {
      includeInlineStyles: true,
      includeInlineScripts: true,
      includeExternalAssets: true,
      sanitizeContent: true,
      preserveComments: false,
      ...options
    };

    try {
      // Validate and normalize URL
      const normalizedUrl = this.normalizeUrl(url);

      // Fetch the main HTML content
      const response = await this.fetchWithTimeout(normalizedUrl);
      const html = response.body as string;

      // Parse with Cheerio
      const $ = cheerio.load(html, {
        xmlMode: false
      });

      // Extract all components
      const [cssFiles, jsFiles, assets] = await Promise.all([
        this.extractCSS($, normalizedUrl, defaultOptions),
        this.extractJS($, normalizedUrl, defaultOptions),
        this.extractAssets($, normalizedUrl, defaultOptions)
      ]);

      // Clean and process HTML
      const cleanHTML = this.processHTML($, defaultOptions);

      // Extract metadata
      const metadata = this.extractMetadata($);

      // Get favicon
      const favicon = this.extractFavicon($, normalizedUrl);

      const websiteContent: WebsiteContent = {
        url: normalizedUrl,
        title: metadata.title,
        favicon,
        html: cleanHTML,
        css: cssFiles,
        js: jsFiles,
        assets,
        metadata,
        parsedAt: new Date()
      };

      return websiteContent;
    } catch (error) {
      throw new Error(`Failed to parse website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  }

  private async fetchWithTimeout(url: string): Promise<{ body: string; headers: any }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > this.maxSize) {
        throw new Error('Response too large');
      }

      const body = await response.text();
      return { body, headers: response.headers };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async extractCSS($: cheerio.CheerioAPI, baseUrl: string, options: ParseOptions): Promise<CSSFile[]> {
    const cssFiles: CSSFile[] = [];
    let inlineCounter = 1;

    // Extract inline styles
    if (options.includeInlineStyles) {
      $('style').each((index, element) => {
        const content = $(element).html() || '';
        const media = $(element).attr('media') || 'all';

        cssFiles.push({
          id: `inline-style-${inlineCounter++}`,
          name: `inline-style-${inlineCounter - 1}.css`,
          content: this.cleanCSS(content),
          source: 'inline',
          media
        });
      });
    }

    // Extract external stylesheets
    if (options.includeExternalAssets) {
      const linkPromises: Promise<void>[] = [];

      $('link[rel="stylesheet"]').each((index, element) => {
        const href = $(element).attr('href');
        const media = $(element).attr('media') || 'all';

        if (href) {
          const promise = this.fetchExternalCSS(href, baseUrl, media, cssFiles);
          linkPromises.push(promise);
        }
      });

      await Promise.allSettled(linkPromises);
    }

    return cssFiles;
  }

  private async fetchExternalCSS(href: string, baseUrl: string, media: string, cssFiles: CSSFile[]): Promise<void> {
    try {
      const cssUrl = new URL(href, baseUrl).toString();
      const response = await this.fetchWithTimeout(cssUrl);

      const filename = this.extractFilenameFromUrl(cssUrl) || `external-${cssFiles.length + 1}.css`;

      cssFiles.push({
        id: `external-css-${cssFiles.length + 1}`,
        name: filename,
        content: this.cleanCSS(response.body),
        source: 'external',
        url: cssUrl,
        media
      });
    } catch (error) {
      console.warn(`Failed to fetch CSS from ${href}:`, error);
    }
  }

  private async extractJS($: cheerio.CheerioAPI, baseUrl: string, options: ParseOptions): Promise<JSFile[]> {
    const jsFiles: JSFile[] = [];
    let inlineCounter = 1;

    // Extract inline scripts
    if (options.includeInlineScripts) {
      $('script').each((index, element) => {
        const src = $(element).attr('src');
        const type = $(element).attr('type') || 'text/javascript';

        if (!src) { // Inline script
          const content = $(element).html() || '';
          if (content.trim()) {
            jsFiles.push({
              id: `inline-script-${inlineCounter++}`,
              name: `inline-script-${inlineCounter - 1}.js`,
              content: this.cleanJS(content),
              source: 'inline',
              type: type as 'module' | 'text/javascript'
            });
          }
        }
      });
    }

    // Extract external scripts
    if (options.includeExternalAssets) {
      const scriptPromises: Promise<void>[] = [];

      $('script[src]').each((index, element) => {
        const src = $(element).attr('src');
        const type = $(element).attr('type') || 'text/javascript';

        if (src) {
          const promise = this.fetchExternalJS(src, baseUrl, type, jsFiles);
          scriptPromises.push(promise);
        }
      });

      await Promise.allSettled(scriptPromises);
    }

    return jsFiles;
  }

  private async fetchExternalJS(src: string, baseUrl: string, type: string, jsFiles: JSFile[]): Promise<void> {
    try {
      const jsUrl = new URL(src, baseUrl).toString();
      const response = await this.fetchWithTimeout(jsUrl);

      const filename = this.extractFilenameFromUrl(jsUrl) || `external-${jsFiles.length + 1}.js`;

      jsFiles.push({
        id: `external-js-${jsFiles.length + 1}`,
        name: filename,
        content: this.cleanJS(response.body),
        source: 'external',
        url: jsUrl,
        type: type as 'module' | 'text/javascript'
      });
    } catch (error) {
      console.warn(`Failed to fetch JS from ${src}:`, error);
    }
  }

  private async extractAssets($: cheerio.CheerioAPI, baseUrl: string, options: ParseOptions): Promise<Asset[]> {
    const assets: Asset[] = [];

    if (!options.includeExternalAssets) {
      return assets;
    }

    // Extract images
    $('img[src]').each((index, element) => {
      const src = $(element).attr('src');
      if (src && !src.startsWith('data:')) {
        try {
          const assetUrl = new URL(src, baseUrl).toString();
          const filename = this.extractFilenameFromUrl(assetUrl) || `image-${assets.length + 1}`;
          const mimeType = mimeTypes.lookup(filename) || 'image/*';

          assets.push({
            id: `asset-${assets.length + 1}`,
            type: 'image',
            originalUrl: assetUrl,
            name: filename,
            mimeType
          });
        } catch (error) {
          console.warn(`Invalid image URL: ${src}`);
        }
      }
    });

    // Extract fonts and other resources
    $('link[href]').each((index, element) => {
      const href = $(element).attr('href');
      const rel = $(element).attr('rel');

      if (href && (rel === 'preload' || rel === 'font' || href.includes('.woff') || href.includes('.ttf'))) {
        try {
          const assetUrl = new URL(href, baseUrl).toString();
          const filename = this.extractFilenameFromUrl(assetUrl) || `font-${assets.length + 1}`;
          const mimeType = mimeTypes.lookup(filename) || 'font/*';

          assets.push({
            id: `asset-${assets.length + 1}`,
            type: 'font',
            originalUrl: assetUrl,
            name: filename,
            mimeType
          });
        } catch (error) {
          console.warn(`Invalid font URL: ${href}`);
        }
      }
    });

    return assets;
  }

  private extractMetadata($: cheerio.CheerioAPI): WebsiteMetadata {
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || 'Untitled';
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content');
    const viewport = $('meta[name="viewport"]').attr('content');
    const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="content-type"]').attr('content')?.split('charset=')[1] || 'UTF-8';
    const language = $('html').attr('lang') || $('meta[http-equiv="content-language"]').attr('content');
    const author = $('meta[name="author"]').attr('content');
    const canonical = $('link[rel="canonical"]').attr('href');

    return {
      title,
      description,
      viewport,
      charset,
      language,
      author,
      canonical
    };
  }

  private extractFavicon($: cheerio.CheerioAPI, baseUrl: string): string | undefined {
    const favicon = $('link[rel="icon"]').attr('href') ||
                   $('link[rel="shortcut icon"]').attr('href') ||
                   $('link[rel="apple-touch-icon"]').attr('href');

    if (favicon) {
      try {
        return new URL(favicon, baseUrl).toString();
      } catch {
        return undefined;
      }
    }

    return undefined;
  }

  private processHTML($: cheerio.CheerioAPI, options: ParseOptions): string {
    // Remove external stylesheets and scripts as they're handled separately
    $('link[rel="stylesheet"]').remove();
    $('script[src]').remove();

    // Optionally remove inline styles and scripts
    if (!options.includeInlineStyles) {
      $('style').remove();
    }

    if (!options.includeInlineScripts) {
      $('script:not([src])').remove();
    }

    // Remove comments if requested
    if (!options.preserveComments) {
      $('*').contents().each((index, element) => {
        if (element.type === 'comment') {
          $(element).remove();
        }
      });
    }

    // Clean up the HTML
    let html = $.html();

    // Sanitize if requested
    if (options.sanitizeContent) {
      html = purify.sanitize(html, {
        WHOLE_DOCUMENT: true,
        RETURN_DOM: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        SANITIZE_DOM: true
      });
    }

    return html;
  }

  private cleanCSS(css: string): string {
    // Basic CSS cleaning - remove comments and normalize whitespace
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private cleanJS(js: string): string {
    // Basic JS cleaning - just trim for now, more advanced cleaning could be added
    return js.trim();
  }

  private extractFilenameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      return filename || null;
    } catch {
      return null;
    }
  }
}
