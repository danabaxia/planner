import { NotionPropertyHelpers } from './notion';
import type { NotionDatabase, NotionPage } from '@/types/notion';

interface AppActivity {
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: Date;
  category?: string;
  tags?: string[];
  assignee?: {
    id: string;
    name: string;
    email?: string;
  };
  duration?: number;
  notionId?: string;
  notionUrl?: string;
}

export function notionToApp(
  page: NotionPage,
  database: NotionDatabase,
  mapping: Record<string, string>
): AppActivity {
  const activity: AppActivity = {
    notionId: page.id,
    notionUrl: page.url,
    title: '',
    status: 'pending',
    priority: 'medium',
  };

  // Transform each mapped field
  Object.entries(mapping).forEach(([appField, notionFieldId]) => {
    const property = page.properties[notionFieldId];
    if (!property) return;

    switch (appField) {
      case 'title': {
        const titleProp = property as { title: Array<{ text: { content: string } }> };
        activity.title = titleProp.title.map(t => t.text.content).join('');
        break;
      }
      case 'description': {
        const textProp = property as { rich_text: Array<{ text: { content: string } }> };
        activity.description = textProp.rich_text.map(t => t.text.content).join('');
        break;
      }
      case 'status': {
        const statusProp = property as { select?: { name: string }; status?: { name: string } };
        activity.status = (statusProp.select || statusProp.status)?.name || 'pending';
        break;
      }
      case 'priority': {
        const priorityProp = property as { select?: { name: string }; number?: number };
        if (priorityProp.select) {
          activity.priority = priorityProp.select.name;
        } else if (priorityProp.number !== undefined) {
          // Convert number to priority level
          activity.priority = priorityProp.number <= 1 ? 'low' :
                            priorityProp.number >= 3 ? 'high' : 'medium';
        }
        break;
      }
      case 'dueDate': {
        const dateProp = property as { date?: { start: string; end?: string } };
        if (dateProp.date?.start) {
          activity.dueDate = new Date(dateProp.date.start);
        }
        break;
      }
      case 'category': {
        const categoryProp = property as { select?: { name: string }; multi_select?: Array<{ name: string }> };
        if (categoryProp.select) {
          activity.category = categoryProp.select.name;
        } else if (categoryProp.multi_select?.[0]) {
          activity.category = categoryProp.multi_select[0].name;
        }
        break;
      }
      case 'tags': {
        const tagsProp = property as { multi_select: Array<{ name: string }> };
        activity.tags = tagsProp.multi_select.map(tag => tag.name);
        break;
      }
      case 'assignee': {
        const assigneeProp = property as { people: Array<{ id: string; name: string; person?: { email?: string } }> };
        if (assigneeProp.people[0]) {
          const person = assigneeProp.people[0];
          activity.assignee = {
            id: person.id,
            name: person.name,
            email: person.person?.email,
          };
        }
        break;
      }
      case 'duration': {
        const durationProp = property as { number?: number };
        if (durationProp.number !== undefined) {
          activity.duration = durationProp.number;
        }
        break;
      }
    }
  });

  return activity;
}

export function appToNotion(
  activity: AppActivity,
  mapping: Record<string, string>,
  database: NotionDatabase
): Record<string, any> {
  const properties: Record<string, any> = {};

  // Transform each mapped field
  Object.entries(mapping).forEach(([appField, notionFieldId]) => {
    const propertyConfig = database.properties[notionFieldId];
    if (!propertyConfig) return;

    switch (appField) {
      case 'title':
        properties[notionFieldId] = {
          title: [{ text: { content: activity.title } }],
        };
        break;
      case 'description':
        properties[notionFieldId] = {
          rich_text: [{ text: { content: activity.description || '' } }],
        };
        break;
      case 'status':
        if (propertyConfig.type === 'select') {
          properties[notionFieldId] = {
            select: { name: activity.status },
          };
        } else if (propertyConfig.type === 'status') {
          properties[notionFieldId] = {
            status: { name: activity.status },
          };
        }
        break;
      case 'priority':
        if (propertyConfig.type === 'select') {
          properties[notionFieldId] = {
            select: { name: activity.priority },
          };
        } else if (propertyConfig.type === 'number') {
          // Convert priority level to number
          properties[notionFieldId] = {
            number: activity.priority === 'low' ? 1 :
                    activity.priority === 'high' ? 3 : 2,
          };
        }
        break;
      case 'dueDate':
        if (activity.dueDate) {
          properties[notionFieldId] = {
            date: { start: activity.dueDate.toISOString() },
          };
        }
        break;
      case 'category':
        if (propertyConfig.type === 'select') {
          properties[notionFieldId] = activity.category ? {
            select: { name: activity.category },
          } : null;
        } else if (propertyConfig.type === 'multi_select') {
          properties[notionFieldId] = activity.category ? {
            multi_select: [{ name: activity.category }],
          } : { multi_select: [] };
        }
        break;
      case 'tags':
        properties[notionFieldId] = {
          multi_select: (activity.tags || []).map(tag => ({ name: tag })),
        };
        break;
      case 'assignee':
        if (activity.assignee) {
          properties[notionFieldId] = {
            people: [{
              id: activity.assignee.id,
              name: activity.assignee.name,
              person: activity.assignee.email ? { email: activity.assignee.email } : undefined,
            }],
          };
        } else {
          properties[notionFieldId] = { people: [] };
        }
        break;
      case 'duration':
        if (activity.duration !== undefined) {
          properties[notionFieldId] = {
            number: activity.duration,
          };
        }
        break;
    }
  });

  return properties;
}

export function validateNotionProperties(
  properties: Record<string, any>,
  database: NotionDatabase
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  Object.entries(properties).forEach(([propertyId, value]) => {
    const propertyConfig = database.properties[propertyId];
    if (!propertyConfig) {
      errors.push(`Property ${propertyId} not found in database schema`);
      return;
    }

    // Validate based on property type
    switch (propertyConfig.type) {
      case 'title':
        if (!value.title?.[0]?.text?.content) {
          errors.push('Title is required');
        }
        break;
      case 'select':
        if (value.select?.name && !propertyConfig.select.options.some(
          (opt: { name: string }) => opt.name === value.select.name
        )) {
          errors.push(`Invalid select option: ${value.select.name}`);
        }
        break;
      case 'multi_select':
        if (value.multi_select?.some((item: { name: string }) => !propertyConfig.multi_select.options.some(
          (opt: { name: string }) => opt.name === item.name
        ))) {
          errors.push('One or more invalid multi-select options');
        }
        break;
      case 'status':
        if (value.status?.name && !propertyConfig.status.options.some(
          (opt: { name: string }) => opt.name === value.status.name
        )) {
          errors.push(`Invalid status option: ${value.status.name}`);
        }
        break;
      case 'date':
        if (value.date?.start && isNaN(Date.parse(value.date.start))) {
          errors.push('Invalid date format');
        }
        break;
      case 'number':
        if (value.number !== undefined && typeof value.number !== 'number') {
          errors.push('Invalid number format');
        }
        break;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
} 