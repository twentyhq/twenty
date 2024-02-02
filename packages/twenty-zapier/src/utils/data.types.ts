export type InputData = { [x: string]: any };

export type ObjectData = { id: string } | { [x: string]: any };

export type Node = {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  isCustom: boolean;
  labelIdentifierFieldMetadataId: string | null;
  imageIdentifierFieldMetadataId: string | null;
  fields: {
    edges: {
      node: {
        id: string;
        type: string;
        name: string;
        label: string;
        description: string | null;
        icon: string | null;
        isCustom: boolean;
        targetColumnMap: object;
        isActive: boolean;
        isSystem: boolean;
        isNullable: boolean;
        createdAt: string;
        updatedAt: string;
        defaultValue: object | null;
        options: object | null;
        fromRelationMetadata: object | null;
        toRelationMetadata: object | null;
      };
    }[];
  };
};

export type InputField = {
  key: string;
  label: string;
  type: string;
  helpText: string | null;
  required: boolean;
};

export enum FieldMetadataType {
  UUID = 'UUID',
  TEXT = 'TEXT',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  DATE_TIME = 'DATE_TIME',
  BOOLEAN = 'BOOLEAN',
  NUMBER = 'NUMBER',
  NUMERIC = 'NUMERIC',
  PROBABILITY = 'PROBABILITY',
  LINK = 'LINK',
  CURRENCY = 'CURRENCY',
  FULL_NAME = 'FULL_NAME',
  RATING = 'RATING',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  RELATION = 'RELATION',
}

export type Schema = {
  data: {
    objects: {
      edges: { node: Node }[];
    };
  };
};
