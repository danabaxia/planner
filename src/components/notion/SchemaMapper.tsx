import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Database, Save, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Select } from '@/components/ui/Select';
import { FormGroup } from '@/components/ui/FormGroup';
import { toast } from 'react-hot-toast';
import type { NotionDatabase, NotionPropertyConfig } from '@/types/notion';
import { validateSchemaMapping, generateDefaultMapping } from '@/lib/notion/schema';

interface SchemaMapperProps {
  database: NotionDatabase;
  onMappingComplete: (mapping: Record<string, string>) => void;
  loading?: boolean;
}

const REQUIRED_APP_FIELDS = ['title', 'status', 'priority'] as const;
const OPTIONAL_APP_FIELDS = ['description', 'dueDate', 'category', 'tags', 'assignee', 'duration'] as const;

const NOTION_TYPE_COMPATIBILITY: Record<string, string[]> = {
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

export function SchemaMapper({ database, onMappingComplete, loading = false }: SchemaMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Generate default mapping when database changes
    const defaultMapping = generateDefaultMapping(database.properties);
    setMapping(defaultMapping);
  }, [database]);

  const handleFieldChange = (appField: string, notionFieldId: string | string[]) => {
    if (Array.isArray(notionFieldId)) {
      // For multi-select fields, use the first selected value
      setMapping((prev) => ({
        ...prev,
        [appField]: notionFieldId[0] || '',
      }));
    } else {
      setMapping((prev) => ({
        ...prev,
        [appField]: notionFieldId,
      }));
    }
  };

  const handleAutoMap = () => {
    const defaultMapping = generateDefaultMapping(database.properties);
    setMapping(defaultMapping);
    toast.success('Fields auto-mapped successfully');
  };

  const handleSaveMapping = () => {
    const validation = validateSchemaMapping(database.properties, mapping);
    if (!validation.isValid) {
      setErrors(validation.errors);
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    setErrors([]);
    onMappingComplete(mapping);
    toast.success('Schema mapping saved successfully');
  };

  const getCompatibleFields = (appField: string): [string, NotionPropertyConfig][] => {
    const compatibleTypes = NOTION_TYPE_COMPATIBILITY[appField] || [];
    return Object.entries(database.properties).filter(([_, property]) =>
      compatibleTypes.includes(property.type)
    );
  };

  const getFieldDescription = (field: string): string => {
    switch (field) {
      case 'title':
        return 'The main title or name of the item';
      case 'status':
        return 'Current status (e.g., To Do, In Progress, Done)';
      case 'dueDate':
        return 'When the item is due';
      case 'priority':
        return 'Priority level of the item';
      case 'description':
        return 'Detailed description of the item';
      case 'category':
        return 'Category or type of the item';
      case 'tags':
        return 'Labels or tags for organization';
      case 'assignee':
        return 'Person responsible for the item';
      case 'duration':
        return 'Time required or spent on the item';
      default:
        return '';
    }
  };

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
              onClick={handleSaveMapping}
              disabled={loading}
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
        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            <p className="font-medium">Validation Errors:</p>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Required Fields</h3>
            <div className="space-y-4">
              {REQUIRED_APP_FIELDS.map((appField) => (
                <FormGroup
                  key={appField}
                  label={appField.charAt(0).toUpperCase() + appField.slice(1)}
                  description={getFieldDescription(appField)}
                  error={errors.some((error) => error.includes(appField))}
                  required
                >
                  <Select
                    value={mapping[appField] || ''}
                    options={getCompatibleFields(appField).map(([id, property]) => ({
                      value: id,
                      label: `${property.name} (${property.type})`,
                    }))}
                    placeholder={`Select ${appField} field`}
                    onChange={(value) => handleFieldChange(appField, value)}
                    error={errors.some((error) => error.includes(appField))}
                  />
                </FormGroup>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Optional Fields</h3>
            <div className="space-y-4">
              {OPTIONAL_APP_FIELDS.map((appField) => (
                <FormGroup
                  key={appField}
                  label={appField.charAt(0).toUpperCase() + appField.slice(1)}
                  description={getFieldDescription(appField)}
                >
                  <Select
                    value={mapping[appField] || ''}
                    options={getCompatibleFields(appField).map(([id, property]) => ({
                      value: id,
                      label: `${property.name} (${property.type})`,
                    }))}
                    placeholder={`Select ${appField} field (optional)`}
                    onChange={(value) => handleFieldChange(appField, value)}
                  />
                </FormGroup>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 