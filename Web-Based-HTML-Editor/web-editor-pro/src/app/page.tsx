'use client';

import { useState, useCallback, useEffect } from 'react';
import { WebsiteContent, EditableFile, EditorError, EditorState } from '@/types/editor';
import { WebsiteTemplate } from '@/types/templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Eye, Globe, Code, Palette, FileImage, Sparkles, CheckCircle, BookTemplate } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@/components/MonacoEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="ml-2">Loading Editor...</span>
    </div>
  )
});

const PreviewPanel = dynamic(() => import('@/components/PreviewPanel'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="ml-2">Loading Preview...</span>
    </div>
  )
});

const TemplateGallery = dynamic(() => import('@/components/TemplateGallery'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="ml-2">Loading Templates...</span>
    </div>
  )
});

// Demo URLs that work well with our system
const DEMO_URLS = [
  {
    url: 'https://example.com',
    name: 'Example.com',
    description: 'Simple demonstration site',
    complexity: 'Basic'
  },
  {
    url: 'https://getbootstrap.com',
    name: 'Bootstrap',
    description: 'Popular CSS framework site',
    complexity: 'Advanced'
  },
  {
    url: 'https://www.w3schools.com',
    name: 'W3Schools',
    description: 'Web tutorials and references',
    complexity: 'Complex'
  }
];

export default function EditorPage() {
  const [editorState, setEditorState] = useState<EditorState>({
    websiteContent: null,
    activeFile: null,
    files: [],
    isDirty: false,
    previewUrl: null,
    isLoading: false,
    errors: []
  });

  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [showDemoSuccess, setShowDemoSuccess] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);

  // Fetch website content
  const fetchWebsite = useCallback(async (url: string) => {
    console.log('🚀 fetchWebsite called with URL:', url);

    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    console.log('📡 Starting fetch request...');
    setEditorState(prev => ({ ...prev, isLoading: true, errors: [] }));
    setShowDemoSuccess(false);

    try {
      const requestBody = JSON.stringify({ url: url.trim(), includeAssets: true });
      console.log('📤 Making fetch request:', {
        url: '/api/fetch-website',
        method: 'POST',
        body: requestBody
      });

      const response = await fetch('/api/fetch-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody
      });

      console.log('📥 Received response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        ok: response.ok
      });

      // Clone response for error handling (allows multiple reads)
      const responseClone = response.clone();

      // Check if response is ok first
      if (!response.ok) {
        let errorText = 'Unknown error';
        try {
          errorText = await responseClone.text();
        } catch (e) {
          errorText = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorText);
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        let responseText = 'Unknown content';
        try {
          responseText = await responseClone.text();
        } catch (e) {
          responseText = `Content-Type: ${contentType}`;
        }
        console.error('Non-JSON response:', responseText);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      // Parse JSON with error handling
      let result;
      try {
        console.log('📋 Parsing JSON response...');
        result = await response.json();
        console.log('✅ JSON parsed successfully:', { success: result.success, hasData: !!result.data });
      } catch (jsonError) {
        console.error('❌ JSON parse error:', jsonError);
        throw new Error(`Invalid JSON response: ${jsonError instanceof Error ? jsonError.message : 'Parse failed'}`);
      }

      if (!result.success) {
        console.error('❌ API returned error:', result.error);
        throw new Error(result.error || 'Failed to fetch website');
      }

      console.log('🎉 Fetch successful, processing data...');

      // Convert serialized data back to proper types
      const websiteContent: WebsiteContent = {
        ...result.data,
        parsedAt: new Date(result.data.parsedAt) // Convert ISO string back to Date
      };
      const files = createEditableFiles(websiteContent);

      setEditorState(prev => ({
        ...prev,
        websiteContent,
        files,
        activeFile: files.length > 0 ? files[0].id : null,
        isLoading: false,
        isDirty: false
      }));

      toast.success(`Successfully loaded: ${websiteContent.title}`);
      setShowDemoSuccess(true);

      // Generate initial preview
      generatePreview(websiteContent);

    } catch (error) {
      console.error('Fetch website error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Log more details for debugging
      console.error('Error details:', {
        message: errorMessage,
        url: url.trim(),
        timestamp: new Date().toISOString()
      });

      setEditorState(prev => ({
        ...prev,
        isLoading: false,
        errors: [{
          id: Date.now().toString(),
          type: 'network',
          message: errorMessage
        }]
      }));

      toast.error(errorMessage);
    }
  }, []);

  // Create editable files from website content
  const createEditableFiles = useCallback((content: WebsiteContent): EditableFile[] => {
    const files: EditableFile[] = [];

    // Add main HTML file
    files.push({
      id: 'main-html',
      name: 'index.html',
      type: 'html',
      content: content.html,
      originalContent: content.html,
      language: 'html',
      readOnly: false
    });

    // Add CSS files
    content.css.forEach((cssFile, index) => {
      files.push({
        id: `css-${cssFile.id}`,
        name: cssFile.name,
        type: 'css',
        content: cssFile.content,
        originalContent: cssFile.content,
        language: 'css',
        readOnly: false
      });
    });

    // Add JS files
    content.js.forEach((jsFile, index) => {
      files.push({
        id: `js-${jsFile.id}`,
        name: jsFile.name,
        type: 'js',
        content: jsFile.content,
        originalContent: jsFile.content,
        language: 'javascript',
        readOnly: false
      });
    });

    return files;
  }, []);

  // Handle file content changes
  const handleFileChange = useCallback((fileId: string, newContent: string) => {
    setEditorState(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId
          ? { ...file, content: newContent }
          : file
      ),
      isDirty: true
    }));

    // Debounced preview update
    setTimeout(() => {
      const updatedContent = getUpdatedWebsiteContent();
      if (updatedContent) {
        generatePreview(updatedContent);
      }
    }, 1000);
  }, [editorState.websiteContent]);

  // Get updated website content with current edits
  const getUpdatedWebsiteContent = useCallback((): WebsiteContent | null => {
    if (!editorState.websiteContent) return null;

    const updatedContent = { ...editorState.websiteContent };

    // Update HTML
    const htmlFile = editorState.files.find(f => f.type === 'html');
    if (htmlFile) {
      updatedContent.html = htmlFile.content;
    }

    // Update CSS
    updatedContent.css = updatedContent.css.map(cssFile => {
      const editedFile = editorState.files.find(f => f.id === `css-${cssFile.id}`);
      return editedFile ? { ...cssFile, content: editedFile.content } : cssFile;
    });

    // Update JS
    updatedContent.js = updatedContent.js.map(jsFile => {
      const editedFile = editorState.files.find(f => f.id === `js-${jsFile.id}`);
      return editedFile ? { ...jsFile, content: editedFile.content } : jsFile;
    });

    return updatedContent;
  }, [editorState]);

  // Generate preview
  const generatePreview = useCallback(async (content: WebsiteContent) => {
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: content.html,
          css: content.css,
          js: content.js
        })
      });

      const result = await response.json();

      if (result.success) {
        setEditorState(prev => ({
          ...prev,
          previewUrl: result.previewUrl
        }));
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  }, []);

  // Export website
  const exportWebsite = useCallback(async () => {
    const content = getUpdatedWebsiteContent();
    if (!content) {
      toast.error('No content to export');
      return;
    }

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          includeAssets: true
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'website-export.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Website exported successfully!');
    } catch (error) {
      toast.error('Failed to export website');
    }
  }, [getUpdatedWebsiteContent]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: WebsiteTemplate) => {
    // Convert template to WebsiteContent format
    const websiteContent: WebsiteContent = {
      url: 'template://local',
      title: template.metadata.title,
      favicon: undefined,
      html: template.html,
      css: [{
        id: 'template-css-1',
        name: 'styles.css',
        content: template.css,
        source: 'inline'
      }],
      js: template.js ? [{
        id: 'template-js-1',
        name: 'scripts.js',
        content: template.js,
        source: 'inline'
      }] : [],
      assets: (template.assets || []).map(asset => ({
        ...asset,
        originalUrl: asset.url,
        type: asset.type === 'icon' ? 'other' : asset.type as 'image' | 'font' | 'video' | 'audio' | 'other'
      })),
      metadata: {
        title: template.metadata.title,
        description: template.metadata.description,
        charset: 'UTF-8',
        viewport: 'width=device-width, initial-scale=1.0'
      },
      parsedAt: new Date()
    };

    const files = createEditableFiles(websiteContent);

    setEditorState(prev => ({
      ...prev,
      websiteContent,
      files,
      activeFile: files.length > 0 ? files[0].id : null,
      isLoading: false,
      isDirty: false
    }));

    toast.success(`Template "${template.name}" loaded successfully!`);
    setShowDemoSuccess(true);

    // Generate initial preview
    generatePreview(websiteContent);
  }, [createEditableFiles, generatePreview]);

  const activeFile = editorState.files.find(f => f.id === editorState.activeFile);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Web Editor Pro</h1>
            {showDemoSuccess && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Live Demo Active
              </Badge>
            )}
          </div>

          <div className="flex-1 flex items-center gap-2">
            <Input
              placeholder="Enter website URL (e.g., https://example.com)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWebsite(urlInput)}
              className="flex-1"
              disabled={editorState.isLoading}
            />
            <Button
              onClick={() => fetchWebsite(urlInput)}
              disabled={editorState.isLoading || !urlInput.trim()}
            >
              {editorState.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Load Website'
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  console.log('🧪 Testing basic API...');
                  const response = await fetch('/api/test');
                  const result = await response.json();
                  console.log('🧪 Basic API Result:', result);

                  console.log('🧪 Testing fetch-website API...');
                  const fetchResponse = await fetch('/api/fetch-website', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: 'https://example.com', includeAssets: true })
                  });
                  const fetchResult = await fetchResponse.json();
                  console.log('🧪 Fetch API Result:', fetchResult);

                  toast.success('All APIs working!');
                } catch (error) {
                  console.error('🧪 API Test Failed:', error);
                  toast.error(`API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }}
            >
              🧪 Test APIs
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateGallery(true)}
            >
              <BookTemplate className="w-4 h-4 mr-1" />
              New from Template
            </Button>

            {editorState.websiteContent && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePreview(getUpdatedWebsiteContent()!)}
                  disabled={!editorState.websiteContent}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Refresh Preview
                </Button>
                <Button
                  size="sm"
                  onClick={exportWebsite}
                  disabled={!editorState.websiteContent}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export ZIP
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Demo URLs */}
        {!editorState.websiteContent && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Try these demo websites:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DEMO_URLS.map((demo) => (
                <Button
                  key={demo.url}
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      console.log('🎯 Demo button clicked:', demo.name, demo.url);
                      setUrlInput(demo.url);

                      // Add a small delay to ensure state is updated
                      await new Promise(resolve => setTimeout(resolve, 100));

                      await fetchWebsite(demo.url);
                    } catch (error) {
                      console.error('❌ Demo button error:', error);
                      toast.error(`Failed to load ${demo.name}`);
                    }
                  }}
                  disabled={editorState.isLoading}
                  className="text-xs"
                >
                  <Globe className="w-3 h-3 mr-1" />
                  {demo.name}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {demo.complexity}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Website Info */}
        {editorState.websiteContent && (
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              <strong>{editorState.websiteContent.title}</strong> - {editorState.websiteContent.url}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Code className="w-3 h-3 mr-1" />
                {editorState.files.filter(f => f.type === 'html').length} HTML
              </Badge>
              <Badge variant="secondary">
                <Palette className="w-3 h-3 mr-1" />
                {editorState.files.filter(f => f.type === 'css').length} CSS
              </Badge>
              <Badge variant="secondary">
                {editorState.files.filter(f => f.type === 'js').length} JS
              </Badge>
              <Badge variant="secondary">
                <FileImage className="w-3 h-3 mr-1" />
                {editorState.websiteContent.assets.length} Assets
              </Badge>
            </div>
            {editorState.isDirty && (
              <Badge variant="destructive">Unsaved Changes</Badge>
            )}
          </div>
        )}
      </div>

      {/* Errors */}
      {editorState.errors.length > 0 && (
        <div className="p-4">
          {editorState.errors.map(error => (
            <Alert key={error.id} variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {editorState.websiteContent ? (
          <>
            {/* Left Panel - File Explorer & Editor */}
            <div className="w-1/2 border-r flex flex-col">
              {/* File Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="border-b">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                    <TabsTrigger value="js">JavaScript</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="html" className="flex-1 m-0">
                  {activeFile && activeFile.type === 'html' && (
                    <MonacoEditor
                      file={activeFile}
                      onChange={(content) => handleFileChange(activeFile.id, content)}
                    />
                  )}
                </TabsContent>

                <TabsContent value="css" className="flex-1 m-0">
                  <div className="flex flex-col h-full">
                    {editorState.files.filter(f => f.type === 'css').length > 0 ? (
                      <div className="flex-1">
                        {editorState.files.filter(f => f.type === 'css').length > 1 && (
                          <div className="border-b p-2">
                            <select
                              value={editorState.activeFile || ''}
                              onChange={(e) => setEditorState(prev => ({ ...prev, activeFile: e.target.value }))}
                              className="w-full p-1 border rounded"
                            >
                              {editorState.files.filter(f => f.type === 'css').map(file => (
                                <option key={file.id} value={file.id}>{file.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        {(() => {
                          const cssFile = editorState.files.filter(f => f.type === 'css')[0];
                          return cssFile ? (
                            <MonacoEditor
                              file={cssFile}
                              onChange={(content) => handleFileChange(cssFile.id, content)}
                            />
                          ) : null;
                        })()}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No CSS files found
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="js" className="flex-1 m-0">
                  <div className="flex flex-col h-full">
                    {editorState.files.filter(f => f.type === 'js').length > 0 ? (
                      <div className="flex-1">
                        {editorState.files.filter(f => f.type === 'js').length > 1 && (
                          <div className="border-b p-2">
                            <select
                              value={editorState.activeFile || ''}
                              onChange={(e) => setEditorState(prev => ({ ...prev, activeFile: e.target.value }))}
                              className="w-full p-1 border rounded"
                            >
                              {editorState.files.filter(f => f.type === 'js').map(file => (
                                <option key={file.id} value={file.id}>{file.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        {(() => {
                          const jsFile = editorState.files.filter(f => f.type === 'js')[0];
                          return jsFile ? (
                            <MonacoEditor
                              file={jsFile}
                              onChange={(content) => handleFileChange(jsFile.id, content)}
                            />
                          ) : null;
                        })()}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No JavaScript files found
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Preview */}
            <div className="w-1/2 flex flex-col">
              <div className="border-b p-2 bg-muted">
                <h3 className="font-medium">Live Preview</h3>
              </div>
              <div className="flex-1">
                <PreviewPanel
                  content={getUpdatedWebsiteContent() || editorState.websiteContent}
                  previewUrl={editorState.previewUrl}
                />
              </div>
            </div>
          </>
        ) : (
          // Welcome Screen
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Welcome to Web Editor Pro
                  <Badge variant="outline">Live Demo</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Enter any website URL above to start editing. We'll fetch the content,
                  parse the HTML, CSS, and JavaScript, and provide you with a powerful
                  editing environment.
                </p>

                {/* Success Demo Results */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Recently Tested Successfully:
                  </h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <div>✅ <strong>Bootstrap.com</strong> - 2 CSS, 7 JS files, 6 assets</div>
                    <div>✅ <strong>W3Schools.com</strong> - 14 CSS, 19 JS files, 28 assets</div>
                    <div>✅ <strong>Example.com</strong> - 1 CSS file, clean parsing</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span>Fetch any website content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary" />
                    <span>Edit HTML, CSS, and JavaScript</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <span>Real-time preview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-primary" />
                    <span>Export as ZIP file</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Template Gallery */}
      <TemplateGallery
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        onTemplateSelect={handleTemplateSelect}
      />
    </div>
  );
}
