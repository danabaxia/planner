import { useState, useCallback, useEffect } from 'react';
import { NotionDatabase } from '@/types/notion';
import { validateDatabaseForPlanning } from '@/lib/notion';

interface SchemaMappingState {
  mapping: Record<string, string>;
  isValid: boolean;
  missingFields: string[];
  suggestions: string[];
}

export function useSchemaMapping(database: NotionDatabase) {
  const [state, setState] = useState<SchemaMappingState>({
    mapping: {},
    isValid: false,
    missingFields: [],
    suggestions: [],
  });

  const validateMapping = useCallback((mapping: Record<string, string>) => {
    const requiredFields = ['title', 'description', 'status', 'priority', 'dueDate'];
    const missingFields = requiredFields.filter(field => !mapping[field]);
    
    // Check if mapped fields have compatible types
    const typeErrors = Object.entries(mapping).filter(([appField, notionFieldId]) => {
      const notionField = database.properties[notionFieldId];
      if (!notionField) return true;

      switch (appField) {
        case 'title':
          return notionField.type !== 'title';
        case 'description':
          return !['rich_text', 'text'].includes(notionField.type);
        case 'status':
          return !['select', 'status'].includes(notionField.type);
        case 'priority':
          return !['select', 'number'].includes(notionField.type);
        case 'dueDate':
          return !['date', 'datetime'].includes(notionField.type);
        case 'category':
          return !['select', 'multi_select'].includes(notionField.type);
        case 'tags':
          return notionField.type !== 'multi_select';
        case 'assignee':
          return notionField.type !== 'people';
        case 'duration':
          return notionField.type !== 'number';
        default:
          return false;
      }
    });

    const suggestions = [];
    if (missingFields.length > 0) {
      suggestions.push(`Add mappings for required fields: ${missingFields.join(', ')}`);
    }
    if (typeErrors.length > 0) {
      suggestions.push(`Fix incompatible field types: ${typeErrors.map(([field]) => field).join(', ')}`);
    }

    return {
      isValid: missingFields.length === 0 && typeErrors.length === 0,
      missingFields,
      suggestions,
    };
  }, [database]);

  const updateMapping = useCallback((newMapping: Record<string, string>) => {
    const validation = validateMapping(newMapping);
    setState({
      mapping: newMapping,
      ...validation,
    });

    // Persist mapping in local storage
    try {
      localStorage.setItem(
        `notion-mapping-${database.id}`,
        JSON.stringify(newMapping)
      );
    } catch (error) {
      console.error('Failed to save mapping to local storage:', error);
    }
  }, [database.id, validateMapping]);

  const resetMapping = useCallback(() => {
    setState({
      mapping: {},
      isValid: false,
      missingFields: [],
      suggestions: [],
    });
    try {
      localStorage.removeItem(`notion-mapping-${database.id}`);
    } catch (error) {
      console.error('Failed to remove mapping from local storage:', error);
    }
  }, [database.id]);

  // Load saved mapping from local storage
  useEffect(() => {
    try {
      const savedMapping = localStorage.getItem(`notion-mapping-${database.id}`);
      if (savedMapping) {
        const mapping = JSON.parse(savedMapping);
        const validation = validateMapping(mapping);
        setState({
          mapping,
          ...validation,
        });
      }
    } catch (error) {
      console.error('Failed to load mapping from local storage:', error);
    }
  }, [database.id, validateMapping]);

  return {
    ...state,
    updateMapping,
    resetMapping,
  };
} 