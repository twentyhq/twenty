import { ConnectedAccountProvider, FieldMetadataType } from 'twenty-shared';

import {
  CompositeProperty,
  CompositeType,
} from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

export enum FieldActorSource {
  EMAIL = 'EMAIL',
  CALENDAR = 'CALENDAR',
  WORKFLOW = 'WORKFLOW',
  API = 'API',
  IMPORT = 'IMPORT',
  MANUAL = 'MANUAL',
  SYSTEM = 'SYSTEM',
}

export const actorCompositeType: CompositeType = {
  type: FieldMetadataType.ACTOR,
  properties: [
    {
      name: 'source',
      type: FieldMetadataType.SELECT,
      hidden: false,
      isRequired: true,
      options: Object.keys(FieldActorSource).map((key, index) => ({
        label: `${FieldActorSource[key].toLowerCase()}`,
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
    {
      name: 'context',
      type: FieldMetadataType.RAW_JSON,
      hidden: false,
      isRequired: false,
    },
  ],
};

export type ActorMetadata = {
  source: FieldActorSource;
  workspaceMemberId?: string;
  name: string;
  context?: {
    provider?: ConnectedAccountProvider;
  };
};
