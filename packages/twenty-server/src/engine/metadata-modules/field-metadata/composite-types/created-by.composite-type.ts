import {
  CompositeProperty,
  CompositeType,
} from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

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
      name: 'workspaceMember',
      type: FieldMetadataType.RELATION,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'workspaceMemberId',
      type: FieldMetadataType.UUID,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'name',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: true,
    },
  ],
};

export type CreatedByMetadata = {
  source: CreatedBySource;
  workspaceMember?: WorkspaceMemberWorkspaceEntity;
  workspaceMemberId?: string;
  name: string;
};
