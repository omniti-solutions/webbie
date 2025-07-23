// Ultra-robust JSON cleaning for website content

export function cleanJSONString(str: string): string {
  if (typeof str !== 'string') return String(str || '');

  // First, handle common problematic patterns
  return str
    // Remove null bytes and other control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')

    // Handle quotes and escapes
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")

    // Handle whitespace characters
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    .replace(/\b/g, '\\b')

    // Remove Unicode line separators that break JSON
    .replace(/\u2028/g, '')
    .replace(/\u2029/g, '')

    // Remove any remaining problematic Unicode characters
    .replace(/[\uFEFF\uFFFE\uFFFF]/g, '');
}

export function createSafeResponse(data: any): any {
  try {
    // Convert to JSON string and back to clean it
    const jsonString = JSON.stringify(data, (key, value) => {
      if (typeof value === 'string') {
        return cleanJSONString(value);
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });

    // Parse it back to ensure it's valid
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to create safe response:', error);
    // Return a minimal safe response
    return {
      success: false,
      error: 'Content contains invalid characters',
      timestamp: new Date().toISOString()
    };
  }
}

export function testJSONSafety(data: any): { safe: boolean; error?: string; position?: number } {
  try {
    const jsonString = JSON.stringify(data);
    JSON.parse(jsonString);
    return { safe: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const positionMatch = message.match(/position (\d+)/);
    const position = positionMatch ? parseInt(positionMatch[1]) : undefined;

    return {
      safe: false,
      error: message,
      position
    };
  }
}
