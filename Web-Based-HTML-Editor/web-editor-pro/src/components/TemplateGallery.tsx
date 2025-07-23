'use client';

import { useState, useCallback } from 'react';
import { WebsiteTemplate, TemplateCategory, TemplateCustomization } from '@/types/templates';
import { BUILT_IN_TEMPLATES, TEMPLATE_CATEGORIES, DEFAULT_CUSTOMIZATION, applyCustomizationToTemplate } from '@/lib/template-library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Palette, Type, Layout, User, Eye, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateGalleryProps {
  onTemplateSelect: (template: WebsiteTemplate) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateGallery({ onTemplateSelect, isOpen, onClose }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate | null>(null);
  const [customization, setCustomization] = useState<TemplateCustomization>(DEFAULT_CUSTOMIZATION);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Filter templates based on category and search
  const filteredTemplates = BUILT_IN_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = useCallback((template: WebsiteTemplate) => {
    setSelectedTemplate(template);
    setCustomization(DEFAULT_CUSTOMIZATION);
    setShowCustomizer(true);
  }, []);

  const handleCustomizationChange = useCallback((key: string, value: any) => {
    setCustomization(prev => ({
      ...prev,
      [key]: typeof value === 'object' ? { ...prev[key as keyof TemplateCustomization], ...value } : value
    }));
  }, []);

  const handleApplyTemplate = useCallback(() => {
    if (!selectedTemplate) return;

    const customizedTemplate = applyCustomizationToTemplate(selectedTemplate, customization);
    onTemplateSelect(customizedTemplate);
    toast.success(`Template "${selectedTemplate.name}" applied successfully!`);
    setShowCustomizer(false);
    onClose();
  }, [selectedTemplate, customization, onTemplateSelect, onClose]);

  const handlePreviewTemplate = useCallback((template: WebsiteTemplate) => {
    const customizedTemplate = applyCustomizationToTemplate(template, customization);
    // Generate preview URL (would integrate with preview API)
    console.log('Preview template:', customizedTemplate);
    toast.info('Preview functionality coming soon!');
  }, [customization]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Website Templates
          </DialogTitle>
        </DialogHeader>

        {!showCustomizer ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Filters */}
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  {filteredTemplates.length} templates
                </Badge>
              </div>

              {/* Category Tabs */}
              <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as TemplateCategory | 'all')}>
                <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-1 h-auto p-1">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  {TEMPLATE_CATEGORIES.slice(0, 5).map((category) => (
                    <TabsTrigger key={category.value} value={category.value} className="text-xs">
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                    <CardHeader className="p-0">
                      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjlGQUZCIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNFNUU3RUIiLz4KPHN2Zz4K";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handlePreviewTemplate(template)}
                              className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleTemplateSelect(template)}
                              className="bg-primary/90 backdrop-blur-sm"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Use Template
                            </Button>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={template.difficulty === 'beginner' ? 'default' :
                                   template.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {template.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {TEMPLATE_CATEGORIES.find(cat => cat.value === template.category)?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Search className="w-12 h-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No templates found</h3>
                  <p className="text-sm">Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Template Customizer
          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/2 border-r p-4 overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomizer(false)}
                  >
                    ← Back to Templates
                  </Button>
                  <h3 className="font-semibold">Customize "{selectedTemplate?.name}"</h3>
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <Label className="font-medium">Colors</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(customization.colors).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs capitalize">{key}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => handleCustomizationChange('colors', { [key]: e.target.value })}
                            className="w-8 h-8 rounded border"
                          />
                          <Input
                            value={value}
                            onChange={(e) => handleCustomizationChange('colors', { [key]: e.target.value })}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    <Label className="font-medium">Typography</Label>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Heading Font</Label>
                      <select
                        value={customization.typography.headingFont}
                        onChange={(e) => handleCustomizationChange('typography', { headingFont: e.target.value })}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Merriweather">Merriweather</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Body Font</Label>
                      <select
                        value={customization.typography.bodyFont}
                        onChange={(e) => handleCustomizationChange('typography', { bodyFont: e.target.value })}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Source Sans Pro">Source Sans Pro</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <Label className="font-medium">Content</Label>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(customization.content).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <Input
                          value={value}
                          onChange={(e) => handleCustomizationChange('content', { [key]: e.target.value })}
                          className="text-sm"
                          placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layout */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    <Label className="font-medium">Layout</Label>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Border Radius</Label>
                      <select
                        value={customization.layout.borderRadius}
                        onChange={(e) => handleCustomizationChange('layout', { borderRadius: e.target.value })}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Spacing</Label>
                      <select
                        value={customization.layout.spacing}
                        onChange={(e) => handleCustomizationChange('layout', { spacing: e.target.value })}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="spacious">Spacious</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="w-1/2 p-4 bg-gray-50">
              <div className="h-full bg-white rounded-lg border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">Live Preview</h3>
                  <p className="text-sm">Preview functionality coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {showCustomizer && (
          <div className="border-t p-4 flex justify-between">
            <Button variant="outline" onClick={() => setShowCustomizer(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handlePreviewTemplate(selectedTemplate!)}>
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button onClick={handleApplyTemplate}>
                <Download className="w-4 h-4 mr-1" />
                Use This Template
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
