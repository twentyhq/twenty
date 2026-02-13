import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type RowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';

export const fromCreateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup =
  ({
    input,
    roleUniversalIdentifier,
    flatApplication,
    flatObjectMetadataMaps,
    flatRowLevelPermissionPredicateGroupMaps,
  }: {
    input: RowLevelPermissionPredicateGroupInput;
    roleUniversalIdentifier: string;
    flatApplication: FlatApplication;
  } & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'> & {
      flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
    }): UniversalFlatRowLevelPermissionPredicateGroup => {
    const createdAt = new Date().toISOString();

    const {
      objectMetadataUniversalIdentifier,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier,
    } = resolveEntityRelationUniversalIdentifiers({
      metadataName: 'rowLevelPermissionPredicateGroup',
      foreignKeyValues: {
        objectMetadataId: input.objectMetadataId,
        parentRowLevelPermissionPredicateGroupId:
          input.parentRowLevelPermissionPredicateGroupId,
      },
      flatEntityMaps: {
        flatObjectMetadataMaps,
        flatRowLevelPermissionPredicateGroupMaps,
      },
    });

    return {
      roleUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      logicalOperator: input.logicalOperator,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      positionInRowLevelPermissionPredicateGroup:
        input.positionInRowLevelPermissionPredicateGroup ?? null,
      childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
      rowLevelPermissionPredicateUniversalIdentifiers: [],
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: v4(),
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
    };
  };
