import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  MetadataReadability,
  type ObjectAccessInheritance,
  ObjectAccessInheritanceMatch,
  type ObjectAccessInheritanceRelationRef,
  ObjectAccessInheritanceRelationKind,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export type UniversalInheritanceMaps = {
  universalFlatObjectMetadataMaps: UniversalFlatEntityMaps<UniversalFlatObjectMetadata>;
  universalFlatFieldMetadataMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>;
};

const invalidObjectInput = (
  message: string,
  userFriendlyMessage: FlatObjectMetadataValidationError['userFriendlyMessage'],
): FlatObjectMetadataValidationError => ({
  code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
  message,
  userFriendlyMessage,
});

export const describeInheritanceRelationRef = (
  ref: ObjectAccessInheritanceRelationRef,
): string =>
  ref.kind === ObjectAccessInheritanceRelationKind.MORPH
    ? `morph ${ref.morphId}`
    : `field ${ref.fieldUniversalIdentifier}`;

const isManyToOneRelation = (
  universalFlatFieldMetadata: UniversalFlatFieldMetadata,
): boolean =>
  isMorphOrRelationUniversalFlatFieldMetadata(universalFlatFieldMetadata) &&
  universalFlatFieldMetadata.universalSettings?.relationType ===
    RelationType.MANY_TO_ONE;

const getRelationTargetObjectUniversalIdentifier = (
  universalFlatFieldMetadata: UniversalFlatFieldMetadata,
): string | undefined =>
  isMorphOrRelationUniversalFlatFieldMetadata(universalFlatFieldMetadata)
    ? universalFlatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier
    : undefined;

const getObjectUniversalFlatFieldMetadatas = ({
  universalFlatObjectMetadata,
  universalFlatFieldMetadataMaps,
}: {
  universalFlatObjectMetadata: UniversalFlatObjectMetadata;
  universalFlatFieldMetadataMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>;
}): UniversalFlatFieldMetadata[] =>
  (universalFlatObjectMetadata.fieldUniversalIdentifiers.length > 0
    ? universalFlatObjectMetadata.fieldUniversalIdentifiers.map(
        (fieldUniversalIdentifier) =>
          universalFlatFieldMetadataMaps.byUniversalIdentifier[
            fieldUniversalIdentifier
          ],
      )
    : Object.values(universalFlatFieldMetadataMaps.byUniversalIdentifier)
  )
    .filter(isDefined)
    .filter(
      (universalFlatFieldMetadata) =>
        universalFlatFieldMetadata.objectMetadataUniversalIdentifier ===
        universalFlatObjectMetadata.universalIdentifier,
    );

// Resolves one logical reference to the parent objects it reaches, or to the
// reason why it cannot be used as an access parent
export const resolveInheritanceRefParentObjectUniversalIdentifiers = ({
  ref,
  universalFlatObjectMetadata,
  universalFlatFieldMetadataMaps,
}: {
  ref: ObjectAccessInheritanceRelationRef;
  universalFlatObjectMetadata: UniversalFlatObjectMetadata;
  universalFlatFieldMetadataMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>;
}): { parentUniversalIdentifiers: string[] } | { error: string } => {
  const objectFieldMetadatas = getObjectUniversalFlatFieldMetadatas({
    universalFlatObjectMetadata,
    universalFlatFieldMetadataMaps,
  });

  const matchingFieldMetadatas =
    ref.kind === ObjectAccessInheritanceRelationKind.MORPH
      ? objectFieldMetadatas.filter(
          (fieldMetadata) =>
            fieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
            fieldMetadata.morphId === ref.morphId,
        )
      : objectFieldMetadatas.filter(
          (fieldMetadata) =>
            fieldMetadata.universalIdentifier === ref.fieldUniversalIdentifier,
        );

  if (matchingFieldMetadatas.length === 0) {
    return {
      error: `no relation of this object matches ${describeInheritanceRelationRef(ref)}`,
    };
  }

  if (
    ref.kind === ObjectAccessInheritanceRelationKind.FIELD &&
    matchingFieldMetadatas.some(
      (fieldMetadata) =>
        fieldMetadata.type === FieldMetadataType.MORPH_RELATION,
    )
  ) {
    return {
      error: `${describeInheritanceRelationRef(ref)} belongs to a morph relation and must be referenced through its morph id`,
    };
  }

  if (!matchingFieldMetadatas.every(isManyToOneRelation)) {
    return {
      error: `${describeInheritanceRelationRef(ref)} is not an outgoing to-one relation`,
    };
  }

  const parentUniversalIdentifiers = matchingFieldMetadatas.map(
    getRelationTargetObjectUniversalIdentifier,
  );

  if (!parentUniversalIdentifiers.every(isDefined)) {
    return {
      error: `${describeInheritanceRelationRef(ref)} targets an object that does not exist`,
    };
  }

  return { parentUniversalIdentifiers };
};

const detectInheritanceCycle = ({
  startUniversalIdentifier,
  maps,
}: {
  startUniversalIdentifier: string;
  maps: UniversalInheritanceMaps;
}): string[] | undefined => {
  const visit = (
    universalIdentifier: string,
    path: string[],
  ): string[] | undefined => {
    if (path.includes(universalIdentifier)) {
      return [...path, universalIdentifier];
    }

    const objectMetadata =
      maps.universalFlatObjectMetadataMaps.byUniversalIdentifier[
        universalIdentifier
      ];

    if (
      !isDefined(objectMetadata) ||
      objectMetadata.readability !== MetadataReadability.INHERITED ||
      !isDefined(objectMetadata.inheritance)
    ) {
      return undefined;
    }

    for (const ref of objectMetadata.inheritance.through) {
      const resolution = resolveInheritanceRefParentObjectUniversalIdentifiers({
        ref,
        universalFlatObjectMetadata: objectMetadata,
        universalFlatFieldMetadataMaps: maps.universalFlatFieldMetadataMaps,
      });

      if ('error' in resolution) {
        continue;
      }

      for (const parentUniversalIdentifier of resolution.parentUniversalIdentifiers) {
        const cycle = visit(parentUniversalIdentifier, [
          ...path,
          universalIdentifier,
        ]);

        if (isDefined(cycle)) {
          return cycle;
        }
      }
    }

    return undefined;
  };

  return visit(startUniversalIdentifier, []);
};

const serializeRef = (ref: ObjectAccessInheritanceRelationRef): string =>
  ref.kind === ObjectAccessInheritanceRelationKind.MORPH
    ? `MORPH:${ref.morphId}`
    : `FIELD:${ref.fieldUniversalIdentifier}`;

export const validateObjectMetadataInheritance = ({
  universalFlatObjectMetadata,
  maps,
}: {
  universalFlatObjectMetadata: UniversalFlatObjectMetadata;
  maps: UniversalInheritanceMaps;
}): FlatObjectMetadataValidationError[] => {
  const { readability, inheritance, nameSingular } =
    universalFlatObjectMetadata;

  if (readability !== MetadataReadability.INHERITED) {
    if (isDefined(inheritance)) {
      return [
        invalidObjectInput(
          `inheritance validation failed: "${nameSingular}" is ${readability} and must not declare inheritance parameters`,
          msg`Only an object whose access level is INHERITED can declare inheritance parameters`,
        ),
      ];
    }

    return [];
  }

  if (!isDefined(inheritance)) {
    return [
      invalidObjectInput(
        `inheritance validation failed: "${nameSingular}" is INHERITED but declares no inheritance parameters`,
        msg`An object inheriting its access must declare the relations it inherits through`,
      ),
    ];
  }

  const errors: FlatObjectMetadataValidationError[] = [];
  const { through, match } = inheritance as ObjectAccessInheritance;

  if (!Array.isArray(through) || through.length === 0) {
    return [
      invalidObjectInput(
        `inheritance validation failed: "${nameSingular}" selects no relation to inherit through`,
        msg`An object inheriting its access must select at least one relation`,
      ),
    ];
  }

  if (
    match !== ObjectAccessInheritanceMatch.ANY &&
    match !== ObjectAccessInheritanceMatch.ALL
  ) {
    errors.push(
      invalidObjectInput(
        `inheritance validation failed: "${nameSingular}" declares an unknown match "${match}"`,
        msg`The inheritance match must be ANY or ALL`,
      ),
    );
  }

  const seenRefs = new Set<string>();

  for (const ref of through) {
    const serializedRef = serializeRef(ref);

    if (seenRefs.has(serializedRef)) {
      errors.push(
        invalidObjectInput(
          `inheritance validation failed: "${nameSingular}" selects ${describeInheritanceRelationRef(ref)} twice`,
          msg`Each inherited relation can only be selected once`,
        ),
      );
      continue;
    }

    seenRefs.add(serializedRef);

    const resolution = resolveInheritanceRefParentObjectUniversalIdentifiers({
      ref,
      universalFlatObjectMetadata,
      universalFlatFieldMetadataMaps: maps.universalFlatFieldMetadataMaps,
    });

    if ('error' in resolution) {
      errors.push(
        invalidObjectInput(
          `inheritance validation failed on "${nameSingular}": ${resolution.error}`,
          msg`An inherited relation must be an outgoing to-one relation of this object`,
        ),
      );
      continue;
    }

    for (const parentUniversalIdentifier of resolution.parentUniversalIdentifiers) {
      if (
        !isDefined(
          maps.universalFlatObjectMetadataMaps.byUniversalIdentifier[
            parentUniversalIdentifier
          ],
        )
      ) {
        errors.push(
          invalidObjectInput(
            `inheritance validation failed on "${nameSingular}": ${describeInheritanceRelationRef(ref)} targets an object that does not exist`,
            msg`An inherited relation must target an existing object`,
          ),
        );
      }
    }
  }

  if (errors.length > 0) {
    return errors;
  }

  const cycle = detectInheritanceCycle({
    startUniversalIdentifier: universalFlatObjectMetadata.universalIdentifier,
    maps,
  });

  if (isDefined(cycle)) {
    errors.push(
      invalidObjectInput(
        `inheritance validation failed on "${nameSingular}": the inherited access is cyclic (${cycle.join(' -> ')})`,
        msg`Objects cannot inherit their access from each other in a cycle`,
      ),
    );
  }

  return errors;
};
