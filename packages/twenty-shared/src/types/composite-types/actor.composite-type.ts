import { v4 } from 'uuid';

import { FieldMetadataType } from '../FieldMetadataType';
import { type CompositeType } from '../composite-types/composite-type.interface';
import type { ConnectedAccountProvider } from '../ConnectedAccountProvider';
import { type FieldMetadataDefaultOption } from '../FieldMetadataOptions';

export enum FieldActorSource {
  EMAIL = 'EMAIL',
  CALENDAR = 'CALENDAR',
  WORKFLOW = 'WORKFLOW',
  AGENT = 'AGENT',
  API = 'API',
  IMPORT = 'IMPORT',
  MANUAL = 'MANUAL',
  SYSTEM = 'SYSTEM',
  WEBHOOK = 'WEBHOOK',
  APPLICATION = 'APPLICATION',
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
