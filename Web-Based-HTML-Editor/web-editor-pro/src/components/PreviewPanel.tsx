'use client';

import { useState, useEffect, useRef } from 'react';
import { WebsiteContent } from '@/types/editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw, Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';

interface PreviewPanelProps {
  content: WebsiteContent;
  previewUrl?: string | null;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export default function PreviewPanel({ content, previewUrl }: PreviewPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Refresh iframe when preview URL changes
  useEffect(() => {
    if (previewUrl) {
      setIsLoading(true);
      setIframeKey(prev => prev + 1);
    }
  }, [previewUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);

    // Try to inject some safety and debugging scripts
    try {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        // Add some basic error handling to the iframe
        const script = iframe.contentDocument?.createElement('script');
        if (script) {
          script.textContent = `
            window.addEventListener('error', function(e) {
              console.error('Preview Error:', e.error);
            });

            // Prevent infinite loops in preview
            let intervalCount = 0;
            let timeoutCount = 0;
            const originalSetInterval = window.setInterval;
            const originalSetTimeout = window.setTimeout;

            window.setInterval = function(fn, delay) {
              if (++intervalCount > 50) {
                console.warn('Too many intervals, blocking to prevent infinite loops');
                return -1;
              }
              return originalSetInterval(fn, Math.max(delay, 16));
            };

            window.setTimeout = function(fn, delay) {
              if (++timeoutCount > 200) {
                console.warn('Too many timeouts, blocking to prevent infinite loops');
                return -1;
              }
              return originalSetTimeout(fn, Math.max(delay, 0));
            };
          `;
          iframe.contentDocument?.head?.appendChild(script);
        }
      }
    } catch (error) {
      // Silently fail if we can't inject scripts due to CORS
      console.warn('Could not inject safety scripts into preview iframe');
    }
  };

  const refreshPreview = () => {
    setIframeKey(prev => prev + 1);
    setIsLoading(true);
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const getViewportDimensions = () => {
    switch (viewport) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const getIframeStyle = () => {
    const dimensions = getViewportDimensions();
    const baseStyle = {
      border: 'none',
      backgroundColor: 'white',
      borderRadius: viewport !== 'desktop' ? '8px' : '0',
      boxShadow: viewport !== 'desktop' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
      transition: 'all 0.3s ease'
    };

    if (viewport === 'desktop') {
      return {
        ...baseStyle,
        width: '100%',
        height: '100%'
      };
    } else {
      return {
        ...baseStyle,
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: '100%',
        maxHeight: '100%'
      };
    }
  };

  if (!content) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No content to preview</p>
          <p className="text-sm mt-2">Load a website to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Preview Controls */}
      <div className="border-b p-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">Preview</h4>
            {content.title && (
              <Badge variant="outline" className="text-xs">
                {content.title}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Controls */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewport === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('desktop')}
                className="rounded-r-none border-r"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={viewport === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('tablet')}
                className="rounded-none border-r"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={viewport === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('mobile')}
                className="rounded-l-none"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPreview}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
            </Button>

            {previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewTab}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Viewport Info */}
        {viewport !== 'desktop' && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Viewport: {getViewportDimensions().width} × {getViewportDimensions().height}</span>
          </div>
        )}
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto">
        {previewUrl ? (
          <div
            className={`h-full flex items-center justify-center p-4 ${
              viewport !== 'desktop' ? 'bg-gray-100' : ''
            }`}
          >
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Loading preview...</span>
                  </div>
                </div>
              )}

              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={previewUrl}
                style={getIframeStyle()}
                onLoad={handleIframeLoad}
                onError={() => setIsLoading(false)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                title="Website Preview"
                className="bg-white"
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="relative">
                <Monitor className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <Loader2 className="w-6 h-6 animate-spin absolute top-5 left-1/2 transform -translate-x-1/2" />
              </div>
              <p className="font-medium">Generating preview...</p>
              <p className="text-sm mt-1">Please wait while we prepare the preview</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Info */}
      <div className="border-t p-2 bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              HTML: {content.html.length.toLocaleString()} chars
            </span>
            <span>
              CSS: {content.css.length} files
            </span>
            <span>
              JS: {content.js.length} files
            </span>
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
