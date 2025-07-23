// Core data structures for the website editor

export interface WebsiteContent {
  url: string;
  title: string;
  favicon?: string;
  html: string;
  css: CSSFile[];
  js: JSFile[];
  assets: Asset[];
  metadata: WebsiteMetadata;
  parsedAt: Date;
}

export interface CSSFile {
  id: string;
  name: string;
  content: string;
  source: 'inline' | 'external';
  url?: string;
  media?: string;
}

export interface JSFile {
  id: string;
  name: string;
  content: string;
  source: 'inline' | 'external';
  url?: string;
  type?: 'module' | 'text/javascript';
}

export interface Asset {
  id: string;
  type: 'image' | 'font' | 'video' | 'audio' | 'other';
  originalUrl: string;
  localUrl?: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface WebsiteMetadata {
  title: string;
  description?: string;
  viewport?: string;
  charset: string;
  language?: string;
  author?: string;
  canonical?: string;
}

export interface EditorState {
  websiteContent: WebsiteContent | null;
  activeFile: string | null;
  files: EditableFile[];
  isDirty: boolean;
  previewUrl: string | null;
  isLoading: boolean;
  errors: EditorError[];
}

export interface EditableFile {
  id: string;
  name: string;
  type: 'html' | 'css' | 'js';
  content: string;
  originalContent: string;
  language: string;
  readOnly: boolean;
}

export interface EditorError {
  id: string;
  type: 'parse' | 'network' | 'security' | 'validation';
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

// API Request/Response types
export interface FetchWebsiteRequest {
  url: string;
  includeAssets?: boolean;
  timeout?: number;
}

export interface FetchWebsiteResponse {
  success: boolean;
  data?: WebsiteContentSerialized;
  error?: string;
}

// Serialized version for API responses (Date -> string)
export interface WebsiteContentSerialized {
  url: string;
  title: string;
  favicon?: string;
  html: string;
  css: CSSFile[];
  js: JSFile[];
  assets: Asset[];
  metadata: WebsiteMetadata;
  parsedAt: string; // ISO string instead of Date
}

export interface PreviewRequest {
  html: string;
  css: CSSFile[];
  js: JSFile[];
}

export interface PreviewResponse {
  success: boolean;
  previewUrl?: string;
  error?: string;
}

export interface ExportRequest {
  content: WebsiteContent;
  includeAssets: boolean;
}

export interface ExportResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}

// UI Component Props
export interface EditorProps {
  initialContent?: WebsiteContent;
  onContentChange?: (content: WebsiteContent) => void;
  onError?: (error: EditorError) => void;
}

export interface CodeEditorProps {
  file: EditableFile;
  onChange: (content: string) => void;
  onError?: (error: EditorError) => void;
}

export interface PreviewPanelProps {
  content: WebsiteContent;
  isLoading: boolean;
}

export interface FileExplorerProps {
  files: EditableFile[];
  activeFile: string | null;
  onFileSelect: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
}

export interface AssetManagerProps {
  assets: Asset[];
  onAssetReplace: (assetId: string, newFile: File) => void;
  onAssetDelete: (assetId: string) => void;
}

// Utility types
export type EditorTheme = 'light' | 'dark';
export type PreviewMode = 'desktop' | 'tablet' | 'mobile';
export type ExportFormat = 'zip' | 'html-only' | 'static-site';

export interface EditorSettings {
  theme: EditorTheme;
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  previewMode: PreviewMode;
}

export interface ParseOptions {
  includeInlineStyles: boolean;
  includeInlineScripts: boolean;
  includeExternalAssets: boolean;
  sanitizeContent: boolean;
  preserveComments: boolean;
}
