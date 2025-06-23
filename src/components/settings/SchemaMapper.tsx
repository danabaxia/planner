import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Save, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { AppProperty, SchemaMapping } from '@/lib/notion/schema';
import { mapNotionSchema, validateSchemaMapping, generateDefaultMapping } from '@/lib/notion/schema';

interface SchemaMapperProps {
  databaseId: string;
  properties: Record<string, any>;
  onSave: (mapping: SchemaMapping) => void;
  loading?: boolean;
}

const REQUIRED_FIELDS = ['title', 'status', 'dueDate', 'priority'];

export function SchemaMapper({
  databaseId,
  properties,
  onSave,
  loading = false,
}: SchemaMapperProps) {
  const [mapping, setMapping] = useState<SchemaMapping | null>(null);
  const [validation, setValidation] = useState<{
    valid: boolean;
    missingFields: string[];
  }>({ valid: false, missingFields: [] });

  useEffect(() => {
    // Generate initial mapping
    const initialMapping = mapNotionSchema(databaseId, properties);
    setMapping(initialMapping);

    // Validate the mapping
    const validationResult = validateSchemaMapping(initialMapping, REQUIRED_FIELDS);
    setValidation(validationResult);
  }, [databaseId, properties]);

  const handleAutoMap = () => {
    if (!mapping) return;

    const defaultMapping = generateDefaultMapping(mapping.properties, REQUIRED_FIELDS);
    setMapping({
      ...mapping,
      defaultMappings: {
        ...mapping.defaultMappings,
        ...defaultMapping,
      },
    });

    // Validate the new mapping
    const validationResult = validateSchemaMapping(
      {
        ...mapping,
        defaultMappings: {
          ...mapping.defaultMappings,
          ...defaultMapping,
        },
      },
      REQUIRED_FIELDS
    );
    setValidation(validationResult);
  };

  const handleFieldMapping = (field: string, propertyId: string) => {
    if (!mapping) return;

    setMapping({
      ...mapping,
      defaultMappings: {
        ...mapping.defaultMappings,
        [field]: propertyId,
      },
    });

    // Validate the new mapping
    const validationResult = validateSchemaMapping(
      {
        ...mapping,
        defaultMappings: {
          ...mapping.defaultMappings,
          [field]: propertyId,
        },
      },
      REQUIRED_FIELDS
    );
    setValidation(validationResult);
  };

  if (!mapping) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Schema Mapping
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoMap}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Auto Map
            </Button>
            <Button
              size="sm"
              onClick={() => onSave(mapping)}
              disabled={loading || !validation.valid}
            >
              {loading ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Mapping
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Map Notion database fields to app fields
        </CardDescription>
      </CardHeader>

      <CardContent>
        {validation.missingFields.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            <p className="font-medium">Missing Required Fields:</p>
            <ul className="list-disc list-inside">
              {validation.missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {REQUIRED_FIELDS.map((field) => (
            <div key={field} className="flex items-center gap-4">
              <div className="w-1/3">
                <label className="block font-medium">{field}</label>
                <p className="text-sm text-muted-foreground">
                  {getFieldDescription(field)}
                </p>
              </div>
              <div className="flex-1">
                <select
                  value={mapping.defaultMappings[field] || ''}
                  onChange={(e) => handleFieldMapping(field, e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a field</option>
                  {Object.entries(mapping.properties).map(([id, property]) => (
                    <option
                      key={id}
                      value={id}
                      disabled={!isValidPropertyType(field, property)}
                    >
                      {property.name} ({property.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getFieldDescription(field: string): string {
  switch (field) {
    case 'title':
      return 'The main title or name of the item';
    case 'status':
      return 'Current status (e.g., To Do, In Progress, Done)';
    case 'dueDate':
      return 'When the item is due';
    case 'priority':
      return 'Priority level of the item';
    default:
      return '';
  }
}

function isValidPropertyType(field: string, property: AppProperty): boolean {
  switch (field) {
    case 'title':
      return property.type === 'text';
    case 'status':
      return property.type === 'status' || property.type === 'select';
    case 'dueDate':
      return property.type === 'date';
    case 'priority':
      return property.type === 'select' || property.type === 'number';
    default:
      return true;
  }
} 