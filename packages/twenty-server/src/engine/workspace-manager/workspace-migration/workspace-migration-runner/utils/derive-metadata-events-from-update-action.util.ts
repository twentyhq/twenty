import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';
import { type AllFlatWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import {
  type UpdateMetadataEventDiff,
  type CreateMetadataEvent,
  type DeleteMetadataEvent,
  type MetadataEvent,
  type UpdateMetadataEvent,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

export type DeriveMetadataEventsFromUpdateActionArgs = {
  flatAction: AllFlatWorkspaceMigrationAction<'update'>;
  allFlatEntityMaps: AllFlatEntityMaps;
};

const buildUpdateMetadataEvent = <TMetadataName extends AllMetadataName>({
  metadataName,
  before,
  after,
  updatedFields,
}: {
  metadataName: TMetadataName;
  before: MetadataFlatEntity<TMetadataName>;
  after: MetadataFlatEntity<TMetadataName>;
  updatedFields: MetadataUniversalFlatEntityPropertiesToCompare<TMetadataName>[];
}): UpdateMetadataEvent<TMetadataName> => {
  const diff = Object.fromEntries(
    updatedFields.map((field) => [
      field,
      {
        before: before[field],
        after: after[field],
      },
    ]),
  ) as UpdateMetadataEventDiff<TMetadataName, (typeof updatedFields)[number]>;

  return {
    type: 'update',
    metadataName,
    properties: {
      updatedFields,
      diff,
      before,
      after,
    },
  };
};

export const deriveMetadataEventsFromUpdateAction = ({
  flatAction,
  allFlatEntityMaps,
}: DeriveMetadataEventsFromUpdateActionArgs): MetadataEvent[] => {
  switch (flatAction.metadataName) {
    case 'index': {
      const fromFlatEntity = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatAction.entityId,
        flatEntityMaps: allFlatEntityMaps['flatIndexMaps'],
      });

      const toFlatEntity = flatAction.updatedFlatIndex;

      const deleteIndexMetadataEvent: DeleteMetadataEvent<'index'> = {
        metadataName: 'index',
        properties: {
          before: fromFlatEntity,
        },
        type: 'delete',
      };

      const createIndexMetadataEvent: CreateMetadataEvent<'index'> = {
        metadataName: 'index',
        properties: {
          after: toFlatEntity,
        },
        type: 'create',
      };

      return [deleteIndexMetadataEvent, createIndexMetadataEvent];
    }
    case 'fieldMetadata':
    case 'objectMetadata':
    case 'view':
    case 'viewField':
    case 'viewGroup':
    case 'rowLevelPermissionPredicate':
    case 'rowLevelPermissionPredicateGroup':
    case 'viewFilterGroup':
    case 'logicFunction':
    case 'viewFilter':
    case 'role':
    case 'roleTarget':
    case 'agent':
    case 'skill':
    case 'pageLayout':
    case 'pageLayoutWidget':
    case 'pageLayoutTab':
    case 'commandMenuItem':
    case 'frontComponent':
    case 'navigationMenuItem':
    case 'webhook': {
      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(
        flatAction.metadataName,
      );

      const fromFlatEntity = findFlatEntityByIdInFlatEntityMapsOrThrow<
        MetadataFlatEntity<typeof flatAction.metadataName>
      >({
        flatEntityId: flatAction.entityId,
        flatEntityMaps: allFlatEntityMaps[flatEntityMapsKey],
      });

      const toFlatEntity = {
        ...fromFlatEntity,
        ...flatAction.update,
      } as MetadataFlatEntity<typeof flatAction.metadataName>;

      const updatedFields = Object.keys(
        flatAction.update,
      ) as MetadataUniversalFlatEntityPropertiesToCompare<
        typeof flatAction.metadataName
      >[];

      return [
        buildUpdateMetadataEvent({
          metadataName: flatAction.metadataName,
          before: fromFlatEntity,
          after: toFlatEntity,
          updatedFields,
        }),
      ];
    }
    default: {
      assertUnreachable(flatAction);
    }
  }
};
