import type {
  NotionDatabase,
  NotionPropertyConfig,
  SchemaMapping,
  ValidationResult,
} from '@/types/notion';

// Default type compatibility mapping
const TYPE_COMPATIBILITY: Record<string, NotionPropertyConfig['type'][]> = {
  title: ['title', 'rich_text'],
  description: ['rich_text'],
  status: ['select', 'status'],
  priority: ['select', 'number'],
  dueDate: ['date'],
  category: ['select', 'multi_select'],
  tags: ['multi_select'],
  assignee: ['people'],
  duration: ['number'],
};

/**
 * Validates if a Notion property type is compatible with an app field type
 */
export function isCompatibleType(
  appField: string,
  propertyType: NotionPropertyConfig['type']
): boolean {
  const compatibleTypes = TYPE_COMPATIBILITY[appField];
  return compatibleTypes ? compatibleTypes.includes(propertyType) : false;
}

/**
 * Generates a default mapping based on property name and type matching
 */
export function generateDefaultMapping(
  properties: Record<string, NotionPropertyConfig>
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const propertiesArray = Object.entries(properties);

  // First pass: exact name matches
  for (const [propertyId, property] of propertiesArray) {
    const normalizedName = property.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const [appField, compatibleTypes] of Object.entries(TYPE_COMPATIBILITY)) {
      if (
        normalizedName === appField &&
        compatibleTypes.includes(property.type)
      ) {
        mapping[appField] = propertyId;
        break;
      }
    }
  }

  // Second pass: contains name matches
  for (const [appField, compatibleTypes] of Object.entries(TYPE_COMPATIBILITY)) {
    if (mapping[appField]) continue;

    for (const [propertyId, property] of propertiesArray) {
      const normalizedName = property.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (
        normalizedName.includes(appField) &&
        compatibleTypes.includes(property.type)
      ) {
        mapping[appField] = propertyId;
        break;
      }
    }
  }

  // Third pass: type-only matches for required fields
  const requiredFields = ['title', 'status', 'priority'];
  for (const field of requiredFields) {
    if (mapping[field]) continue;

    for (const [propertyId, property] of propertiesArray) {
      if (TYPE_COMPATIBILITY[field]?.includes(property.type)) {
        mapping[field] = propertyId;
        break;
      }
    }
  }

  return mapping;
}

/**
 * Validates a schema mapping configuration
 */
export function validateSchemaMapping(
  properties: Record<string, NotionPropertyConfig>,
  mapping: Record<string, string>
): ValidationResult {
  const errors: string[] = [];
  const requiredFields = ['title', 'status', 'priority'];

  // Check required fields
  for (const field of requiredFields) {
    const propertyId = mapping[field];
    
    if (!propertyId) {
      errors.push(`Missing required field: ${field}`);
      continue;
    }

    const property = properties[propertyId];
    if (!property) {
      errors.push(`Invalid property ID for ${field}: ${propertyId}`);
      continue;
    }

    if (!isCompatibleType(field, property.type)) {
      errors.push(
        `Invalid property type for ${field}: expected ${TYPE_COMPATIBILITY[field].join(' or ')}, got ${property.type}`
      );
    }
  }

  // Check optional fields
  const optionalFields = ['description', 'dueDate', 'category', 'tags', 'assignee', 'duration'];
  for (const field of optionalFields) {
    const propertyId = mapping[field];
    if (!propertyId) continue;

    const property = properties[propertyId];
    if (!property) {
      errors.push(`Invalid property ID for ${field}: ${propertyId}`);
      continue;
    }

    if (!isCompatibleType(field, property.type)) {
      errors.push(
        `Invalid property type for ${field}: expected ${TYPE_COMPATIBILITY[field].join(' or ')}, got ${property.type}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a schema mapping object for a Notion database
 */
export function mapNotionSchema(
  databaseId: string,
  properties: Record<string, NotionPropertyConfig>
): SchemaMapping {
  return {
    databaseId,
    properties,
    defaultMappings: generateDefaultMapping(properties),
  };
}

/**
 * Transforms a Notion property value to an app field value
 */
export function transformPropertyValue(
  property: NotionPropertyConfig,
  value: any,
  transformFn?: string
): any {
  if (!value) return null;

  // If a custom transform function is provided, use it
  if (transformFn) {
    try {
      // Only allow simple transformations for security
      const fn = new Function('value', transformFn);
      return fn(value);
    } catch (error) {
      console.error('Error executing transform function:', error);
      return null;
    }
  }

  // Default transformations
  switch (property.type) {
    case 'title':
    case 'rich_text':
      return value[property.type].map((item: any) => item.plain_text).join('');
    
    case 'select':
    case 'status':
      return value[property.type]?.name || null;
    
    case 'multi_select':
      return value.multi_select.map((item: any) => item.name);
    
    case 'date':
      return value.date?.start || null;
    
    case 'people':
      return value.people.map((person: any) => person.id);
    
    case 'number':
      return value.number;
    
    default:
      return null;
  }
} 