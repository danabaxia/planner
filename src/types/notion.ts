export interface NotionConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface NotionAuthResponse {
  access_token: string;
  bot_id: string;
  duplicated_template_id: string | null;
  owner: {
    workspace: boolean;
    user: {
      id: string;
      name: string;
      avatar_url: string | null;
      type: 'person';
      person: {
        email: string;
      };
    };
  };
  workspace_icon: string | null;
  workspace_id: string;
  workspace_name: string;
}

export interface RichTextItemResponse {
  type: 'text';
  text: {
    content: string;
    link: string | null;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href: string | null;
}

export type NotionPropertyType =
  | 'title'
  | 'rich_text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'people'
  | 'files'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'phone_number'
  | 'formula'
  | 'relation'
  | 'rollup'
  | 'created_time'
  | 'created_by'
  | 'last_edited_time'
  | 'last_edited_by'
  | 'status';

export interface NotionPropertyConfig {
  id: string;
  name: string;
  type: NotionPropertyType;
  options?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  format?: string;
  formula?: {
    expression: string;
  };
  relation?: {
    database_id: string;
    synced_property_id: string;
    synced_property_name: string;
  };
  rollup?: {
    function: string;
    relation_property_name: string;
    rollup_property_name: string;
  };
}

export interface NotionDatabase {
  id: string;
  object: "database";
  created_time: string;
  last_edited_time: string;
  title: Array<{
    type: 'text';
    text: {
      content: string;
      link: string | null;
    };
    annotations: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
      color: string;
    };
    plain_text: string;
    href: string | null;
  }>;
  description: Array<{ text: { content: string } }>;
  properties: Record<string, NotionPropertyConfig>;
  url: string;
  parent: {
    type: "page_id" | "workspace";
    page_id?: string;
    workspace?: boolean;
  };
  archived: boolean;
}

export interface NotionPage {
  id: string;
  object: "page";
  created_time: string;
  last_edited_time: string;
  url: string;
  properties: Record<string, NotionPropertyValue>;
  parent: {
    type: "database_id" | "page_id" | "workspace";
    database_id?: string;
    page_id?: string;
  };
  archived: boolean;
}

export interface NotionPropertyValue {
  id: string;
  type: NotionPropertyType;
}

export interface NotionTitlePropertyValue extends NotionPropertyValue {
  type: 'title';
  title: Array<{
    type: 'text';
    text: {
      content: string;
      link: string | null;
    };
    annotations: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
      color: string;
    };
    plain_text: string;
    href: string | null;
  }>;
}

export interface NotionRichTextPropertyValue extends NotionPropertyValue {
  type: 'rich_text';
  rich_text: NotionTitlePropertyValue['title'];
}

export interface NotionSelectPropertyValue extends NotionPropertyValue {
  type: 'select';
  select: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface NotionMultiSelectPropertyValue extends NotionPropertyValue {
  type: 'multi_select';
  multi_select: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export interface NotionDatePropertyValue extends NotionPropertyValue {
  type: 'date';
  date: {
    start: string;
    end: string | null;
    time_zone: string | null;
  } | null;
}

export interface NotionPeoplePropertyValue extends NotionPropertyValue {
  type: 'people';
  people: Array<{
    id: string;
    name: string | null;
    avatar_url: string | null;
    type: 'person';
    person: {
      email: string;
    };
  }>;
}

export interface NotionNumberPropertyValue extends NotionPropertyValue {
  type: 'number';
  number: number | null;
}

export interface NotionStatusPropertyValue extends NotionPropertyValue {
  type: 'status';
  status: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface NotionUser {
  id: string;
  name: string;
  avatar_url: string | null;
  type: 'person' | 'bot';
  person?: {
    email: string;
  };
  bot?: {
    owner: {
      type: 'workspace' | 'user';
      workspace?: boolean;
    };
    workspace_name?: string;
  };
}

export interface SchemaMapping {
  databaseId: string;
  properties: Record<string, NotionPropertyConfig>;
  defaultMappings: Record<string, string>;
  customMappings?: Record<string, {
    propertyId: string;
    transformFn?: string;
  }>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
} 