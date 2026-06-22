export type EntityId = string;
export type ISODateString = string;

export interface Project {
  id: EntityId;
  name: string;
  description?: string;
  folderId?: EntityId;
  templateIds: EntityId[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Folder {
  id: EntityId;
  name: string;
  parentId?: EntityId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Template {
  id: EntityId;
  name: string;
  description?: string;
  content: string;
  variableIds: EntityId[];
  folderId?: EntityId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type VariableValue = string | number | boolean;

export interface Variable {
  id: EntityId;
  name: string;
  key: string;
  description?: string;
  defaultValue?: VariableValue;
  required: boolean;
}

export interface Preset {
  id: EntityId;
  name: string;
  description?: string;
  projectId: EntityId;
  templateId: EntityId;
  values: Record<string, VariableValue>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
