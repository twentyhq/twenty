import { v4 } from 'uuid';
import {
  ConnectedAccountProvider,
  FieldMetadataType,
} from 'twenty-shared/types';

import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataDefaultOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum FieldActorSource {
  EMAIL = 'EMAIL',
  CALENDAR = 'CALENDAR',
  WORKFLOW = 'WORKFLOW',
  API = 'API',
  IMPORT = 'IMPORT',
  MANUAL = 'MANUAL',
  SYSTEM = 'SYSTEM',
  WEBHOOK = 'WEBHOOK',
}

export const actorCompositeType: CompositeType = {
  type: FieldMetadataType.ACTOR,
  properties: [
    {
      name: 'source',
      type: FieldMetadataType.SELECT,
      hidden: false,
      isRequired: true,
      options: Object.keys(FieldActorSource).map(
        (key, index) =>
          ({
            id: v4(),
            // @ts-expect-error legacy noImplicitAny
            label: `${FieldActorSource[key].toLowerCase()}`,
            value: key,
            position: index,
          }) satisfies Required<FieldMetadataDefaultOption>,
      ),
    },
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
  workspaceMemberId: string | null;
  name: string;
  context: {
    provider?: ConnectedAccountProvider;
  };
};
