// Utility functions for safe JSON serialization

export function sanitizeForJSON(str: string): string {
  if (typeof str !== 'string') return str;

  // Remove or escape characters that can break JSON
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/"/g, '\\"')    // Escape quotes
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\r/g, '\\r')   // Escape carriage returns
    .replace(/\t/g, '\\t')   // Escape tabs
    .replace(/\u0000-\u001F/g, ''); // Remove control characters
}

export function truncateContent(content: string, maxLength: number = 1000000): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '... [TRUNCATED]';
}

export function safeStringify(obj: any, maxDepth: number = 10): string {
  const seen = new WeakSet();

  return JSON.stringify(obj, (key, value) => {
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }

    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Truncate very long strings
    if (typeof value === 'string' && value.length > 500000) {
      return truncateContent(value, 500000);
    }

    return value;
  });
}

export function validateJSONResponse(data: any): boolean {
  try {
    // Test if the data can be safely stringified
    safeStringify(data);
    return true;
  } catch (error) {
    console.error('JSON validation failed:', error);
    return false;
  }
}
