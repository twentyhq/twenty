import { type AllMetadataName } from 'twenty-shared/metadata';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

type ManyToOneRelationsConfig<T extends AllMetadataName> =
  (typeof ALL_MANY_TO_ONE_METADATA_RELATIONS)[T];

// Mirrors ResolvedForeignKeyIds from resolveUniversalRelationIdentifiersToIds but
// keyed on universalForeignKey, so the resolved record is the many-to-one part of a
// flat entity (plus the always-present applicationUniversalIdentifier).
export type ResolvedManyToOneRelationUniversalIdentifiers<
  T extends AllMetadataName,
> = {
  [K in keyof ManyToOneRelationsConfig<T> as ManyToOneRelationsConfig<T>[K] extends {
    universalForeignKey: infer UniversalForeignKey extends string;
  }
    ? UniversalForeignKey
    : never]: ManyToOneRelationsConfig<T>[K] extends { isNullable: true }
    ? string | null
    : string;
} & {
  applicationUniversalIdentifier: string;
};

export const resolveManyToOneRelationIdsToUniversalIdentifiers = <
  T extends AllMetadataName,
>({
  metadataName,
  entity,
  ...idToUniversalIdentifierMaps
}: {
  metadataName: T;
} & FromEntityToFlatEntityArgs<T>): ResolvedManyToOneRelationUniversalIdentifiers<T> => {
  const readEntityForeignKey = (
    propertyName: string,
  ): string | null | undefined =>
    entity[propertyName as keyof typeof entity] as string | null | undefined;

  const entityId = readEntityForeignKey('id');
  const resolvedUniversalIdentifierByForeignKey: Record<string, string | null> =
    {};

  const applicationId = readEntityForeignKey('applicationId');
  const applicationUniversalIdentifier = isDefined(applicationId)
    ? idToUniversalIdentifierMaps.applicationIdToUniversalIdentifierMap.get(
        applicationId,
      )
    : undefined;

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${applicationId} not found for ${metadataName} ${entityId}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  resolvedUniversalIdentifierByForeignKey.applicationUniversalIdentifier =
    applicationUniversalIdentifier;

  const relationEntries = ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName];

  for (const relationPropertyName of Object.keys(relationEntries)) {
    const relationEntry = relationEntries[
      relationPropertyName as keyof typeof relationEntries
    ] as {
      foreignKey: string;
      metadataName: AllMetadataName;
      isNullable: boolean;
      universalForeignKey: string;
    } | null;

    if (!isDefined(relationEntry)) {
      continue;
    }

    const {
      foreignKey,
      metadataName: targetMetadataName,
      universalForeignKey,
      isNullable,
    } = relationEntry;
    const foreignKeyId = readEntityForeignKey(foreignKey);

    if (isNullable && !isDefined(foreignKeyId)) {
      resolvedUniversalIdentifierByForeignKey[universalForeignKey] = null;

      continue;
    }

    const targetIdToUniversalIdentifierMap = idToUniversalIdentifierMaps[
      `${targetMetadataName}IdToUniversalIdentifierMap` as keyof typeof idToUniversalIdentifierMaps
    ] as Map<string, string>;
    const universalIdentifier = isDefined(foreignKeyId)
      ? targetIdToUniversalIdentifierMap.get(foreignKeyId)
      : undefined;

    if (!isDefined(universalIdentifier)) {
      throw new FlatEntityMapsException(
        `${capitalize(targetMetadataName)} with id ${foreignKeyId} not found for ${metadataName} ${entityId}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    resolvedUniversalIdentifierByForeignKey[universalForeignKey] =
      universalIdentifier;
  }

  return resolvedUniversalIdentifierByForeignKey as ResolvedManyToOneRelationUniversalIdentifiers<T>;
};
