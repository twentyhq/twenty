import {
  CompositeProperty,
  CompositeType,
} from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export enum CreatedBySource {
  EMAIL = 'EMAIL',
  CALENDAR = 'CALENDAR',
  API = 'API',
  IMPORT = 'IMPORT',
  MANUAL = 'MANUAL',
}

export const createdByCompositeType: CompositeType = {
  type: FieldMetadataType.CREATED_BY,
  properties: [
    {
      name: 'source',
      type: FieldMetadataType.SELECT,
      hidden: false,
      isRequired: true,
      options: Object.keys(CreatedBySource).map((key, index) => ({
        label: `Created by ${CreatedBySource[key].toLowerCase()}`,
        value: key,
        position: index,
      })),
    } as CompositeProperty<FieldMetadataType.SELECT>,
    {
      name: 'workspaceMemberId',
      type: FieldMetadataType.UUID,
      hidden: 'input',
      isRequired: false,
    },
    {
      name: 'name',
      type: FieldMetadataType.TEXT,
      hidden: 'input',
      isRequired: true,
    },
  ],
};

export type CreatedByMetadata = {
  source: CreatedBySource;
  workspaceMemberId?: string;
  name: string;
};
