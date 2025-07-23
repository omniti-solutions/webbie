// Website template and preset types

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  preview: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  html: string;
  css: string;
  js?: string;
  assets?: TemplateAsset[];
  metadata: TemplateMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateAsset {
  id: string;
  name: string;
  type: 'image' | 'font' | 'icon' | 'video';
  url: string;
  localPath: string;
  size?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface TemplateMetadata {
  title: string;
  description: string;
  author: string;
  version: string;
  responsive: boolean;
  browserSupport: string[];
  features: string[];
  colorScheme: 'light' | 'dark' | 'auto';
  layout: 'single-page' | 'multi-page' | 'landing' | 'portfolio' | 'blog' | 'ecommerce';
}

export type TemplateCategory =
  | 'business'
  | 'portfolio'
  | 'landing-page'
  | 'blog'
  | 'ecommerce'
  | 'restaurant'
  | 'creative'
  | 'minimal'
  | 'corporate'
  | 'personal'
  | 'educational'
  | 'nonprofit';

export interface TemplateCollection {
  id: string;
  name: string;
  description: string;
  templates: WebsiteTemplate[];
  featured: boolean;
}

// Template customization options
export interface TemplateCustomization {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  layout: {
    maxWidth: string;
    spacing: 'compact' | 'normal' | 'spacious';
    borderRadius: 'none' | 'small' | 'medium' | 'large';
  };
  content: {
    siteName: string;
    tagline: string;
    heroText: string;
    aboutText: string;
    contactEmail: string;
  };
}

// UI component props
export interface TemplateGridProps {
  templates: WebsiteTemplate[];
  selectedCategory?: TemplateCategory;
  onTemplateSelect: (template: WebsiteTemplate) => void;
  onPreview: (template: WebsiteTemplate) => void;
}

export interface TemplateCardProps {
  template: WebsiteTemplate;
  onSelect: (template: WebsiteTemplate) => void;
  onPreview: (template: WebsiteTemplate) => void;
  isSelected?: boolean;
}

export interface TemplateCustomizerProps {
  template: WebsiteTemplate;
  customization: TemplateCustomization;
  onCustomizationChange: (customization: TemplateCustomization) => void;
  onApply: () => void;
  onCancel: () => void;
}

export interface TemplatePreviewProps {
  template: WebsiteTemplate;
  customization?: TemplateCustomization;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: () => void;
}

// Template actions and state
export interface TemplateState {
  templates: WebsiteTemplate[];
  collections: TemplateCollection[];
  selectedTemplate: WebsiteTemplate | null;
  selectedCategory: TemplateCategory | null;
  isLoading: boolean;
  isCustomizing: boolean;
  customization: TemplateCustomization | null;
  searchQuery: string;
  sortBy: 'name' | 'category' | 'difficulty' | 'recent';
}

export interface TemplateActions {
  loadTemplates: () => Promise<void>;
  selectTemplate: (template: WebsiteTemplate) => void;
  filterByCategory: (category: TemplateCategory | null) => void;
  searchTemplates: (query: string) => void;
  customizeTemplate: (customization: TemplateCustomization) => void;
  applyTemplate: (template: WebsiteTemplate, customization?: TemplateCustomization) => void;
  previewTemplate: (template: WebsiteTemplate) => void;
}

// Template creation and editing
export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: TemplateCategory;
  html: string;
  css: string;
  js?: string;
  metadata: Partial<TemplateMetadata>;
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {
  id: string;
}

export interface TemplateResponse {
  success: boolean;
  template?: WebsiteTemplate;
  error?: string;
}

export interface TemplatesResponse {
  success: boolean;
  templates?: WebsiteTemplate[];
  error?: string;
}
