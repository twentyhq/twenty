import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isNonEmptyArray,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type ScalarFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/scalar-flat-entity.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { renameMorphRelationFlatFieldMetadataToMorphName } from 'src/engine/metadata-modules/flat-field-metadata/utils/rename-morph-relation-flat-field-metadata-to-morph-name.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type MetadataEvent,
  type UpdateMetadataEvent,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';
import { flatEntityToScalarFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/flat-entity-to-scalar-flat-entity.util';

type FieldMetadataEvent = MetadataEvent<'fieldMetadata'>;

type ScalarFlatFieldMetadata = ScalarFlatEntity<
  MetadataEntity<'fieldMetadata'>
>;

type MorphRelationFlatFieldMetadata =
  FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

export type ResolveFieldMetadataIsActive = (
  fieldMetadata: Pick<
    ScalarFlatFieldMetadata,
    'isActive' | 'overrides' | 'applicationId'
  >,
) => boolean;

type MorphGroupMaps = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

// The runner asserts its partial diffs the same way: the diff type maps every
// compared property, so a diff with no changed property cannot be expressed
const EMPTY_FIELD_METADATA_DIFF =
  {} as UpdateMetadataEvent<'fieldMetadata'>['properties']['diff'];

const getEventRecord = (event: FieldMetadataEvent): ScalarFlatFieldMetadata =>
  event.type === 'deleted' ? event.properties.before : event.properties.after;

type MorphGroup = {
  objectMetadataId: string;
  morphId: string;
};

const getMorphGroup = (event: FieldMetadataEvent): MorphGroup | undefined => {
  const { type, objectMetadataId, morphId } = getEventRecord(event);

  return type === FieldMetadataType.MORPH_RELATION && isDefined(morphId)
    ? { objectMetadataId, morphId }
    : undefined;
};

const getMorphGroupKey = ({ objectMetadataId, morphId }: MorphGroup) =>
  `${objectMetadataId}:${morphId}`;

export const isMorphRelationFieldMetadataEvent = (event: FieldMetadataEvent) =>
  isDefined(getMorphGroup(event));

const findMorphGroupFlatFieldMetadatas = ({
  objectMetadataId,
  morphId,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: MorphGroupMaps & MorphGroup): MorphRelationFlatFieldMetadata[] => {
  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    return [];
  }

  return findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: flatObjectMetadata.fieldIds,
    flatEntityMaps: flatFieldMetadataMaps,
  }).filter(
    (flatFieldMetadata): flatFieldMetadata is MorphRelationFlatFieldMetadata =>
      isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      ) && flatFieldMetadata.morphId === morphId,
  );
};

const toCollapsedScalarFlatFieldMetadata = ({
  morphRelationFlatFieldMetadata,
  flatObjectMetadataMaps,
}: {
  morphRelationFlatFieldMetadata: MorphRelationFlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): ScalarFlatFieldMetadata =>
  flatEntityToScalarFlatEntity({
    metadataName: 'fieldMetadata',
    flatEntity: renameMorphRelationFlatFieldMetadataToMorphName({
      morphRelationFlatFieldMetadata,
      flatObjectMetadataMaps,
    }),
  });

// objects.fieldsList picks the representative on effective values, where an
// override can deactivate a row whose raw isActive is still true
const pickRepresentativeId = ({
  fieldMetadatas,
  resolveIsActive,
}: {
  fieldMetadatas: Pick<
    ScalarFlatFieldMetadata,
    'id' | 'isActive' | 'isSystem' | 'overrides' | 'applicationId'
  >[];
  resolveIsActive: ResolveFieldMetadataIsActive;
}): string | undefined =>
  isNonEmptyArray(fieldMetadatas)
    ? pickMorphGroupSurvivorOrThrow(
        fieldMetadatas.map((fieldMetadata) => ({
          id: fieldMetadata.id,
          isActive: resolveIsActive(fieldMetadata),
          isSystem: fieldMetadata.isSystem,
        })),
      ).id
    : undefined;

const buildRepresentativeEvent = ({
  representative,
  previousRepresentativeId,
  morphGroupEvents,
  flatObjectMetadataMaps,
}: {
  representative: MorphRelationFlatFieldMetadata;
  previousRepresentativeId: string | undefined;
  morphGroupEvents: FieldMetadataEvent[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): FieldMetadataEvent => {
  const after = toCollapsedScalarFlatFieldMetadata({
    morphRelationFlatFieldMetadata: representative,
    flatObjectMetadataMaps,
  });

  if (previousRepresentativeId !== representative.id) {
    return {
      type: 'created',
      metadataName: 'fieldMetadata',
      recordId: representative.id,
      properties: { after },
    };
  }

  const representativeUpdateEvent = morphGroupEvents.find(
    (event): event is UpdateMetadataEvent<'fieldMetadata'> =>
      event.type === 'updated' && event.recordId === representative.id,
  );

  if (!isDefined(representativeUpdateEvent)) {
    return {
      type: 'updated',
      metadataName: 'fieldMetadata',
      recordId: representative.id,
      properties: {
        updatedFields: [],
        diff: EMPTY_FIELD_METADATA_DIFF,
        before: after,
        after,
      },
    };
  }

  const { before } = representativeUpdateEvent.properties;

  return {
    ...representativeUpdateEvent,
    properties: {
      ...representativeUpdateEvent.properties,
      before: {
        ...before,
        name: renameMorphRelationFlatFieldMetadataToMorphName({
          morphRelationFlatFieldMetadata: {
            ...representative,
            name: before.name,
          },
          flatObjectMetadataMaps,
        }).name,
      },
      after,
    },
  };
};

const collapseMorphGroupEvents = ({
  morphGroup,
  morphGroupEvents,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  resolveIsActive,
}: CollapseMorphRelationFieldMetadataEventsArgs & {
  morphGroup: MorphGroup;
  morphGroupEvents: FieldMetadataEvent[];
}): FieldMetadataEvent[] => {
  const currentMorphFlatFieldMetadatas = findMorphGroupFlatFieldMetadatas({
    ...morphGroup,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  });

  const representativeId = pickRepresentativeId({
    fieldMetadatas: currentMorphFlatFieldMetadatas,
    resolveIsActive,
  });
  const representative = currentMorphFlatFieldMetadatas.find(
    (flatFieldMetadata) => flatFieldMetadata.id === representativeId,
  );

  // Only decides between created and updated for the representative, so a
  // rewind that is off because the cache moved on stays harmless
  const previousMorphFieldMetadataById = new Map<
    string,
    Pick<
      ScalarFlatFieldMetadata,
      'id' | 'isActive' | 'isSystem' | 'overrides' | 'applicationId'
    >
  >(
    currentMorphFlatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.id,
      flatFieldMetadata,
    ]),
  );

  for (const event of morphGroupEvents) {
    if (event.type === 'created') {
      previousMorphFieldMetadataById.delete(event.recordId);
    } else {
      previousMorphFieldMetadataById.set(
        event.recordId,
        event.properties.before,
      );
    }
  }

  const representativeEvents: FieldMetadataEvent[] = isDefined(representative)
    ? [
        buildRepresentativeEvent({
          representative,
          previousRepresentativeId: pickRepresentativeId({
            fieldMetadatas: [...previousMorphFieldMetadataById.values()],
            resolveIsActive,
          }),
          morphGroupEvents,
          flatObjectMetadataMaps,
        }),
      ]
    : [];

  const deletedRowEvents = morphGroupEvents.filter(
    (event) => event.type === 'deleted',
  );

  // The cache can already hold later migrations when this batch is published,
  // so the id clients hold cannot be known: every other row id is deleted
  const siblingRowEvents: FieldMetadataEvent[] = currentMorphFlatFieldMetadatas
    .filter((flatFieldMetadata) => flatFieldMetadata.id !== representativeId)
    .map((flatFieldMetadata) => ({
      type: 'deleted',
      metadataName: 'fieldMetadata',
      recordId: flatFieldMetadata.id,
      properties: {
        before: toCollapsedScalarFlatFieldMetadata({
          morphRelationFlatFieldMetadata: flatFieldMetadata,
          flatObjectMetadataMaps,
        }),
      },
    }));

  // Deletes come after the representative so clients never go through a state
  // where the morph field is missing
  return [...representativeEvents, ...deletedRowEvents, ...siblingRowEvents];
};

type CollapseMorphRelationFieldMetadataEventsArgs = MorphGroupMaps & {
  resolveIsActive: ResolveFieldMetadataIsActive;
};

// Clients mirror the objects.fieldsList shape, where each morph group is
// collapsed into its representative row, so per-row events are rewritten into
// that shape instead of leaking sibling rows or dropping the whole field
export const collapseMorphRelationFieldMetadataEvents = ({
  events,
  ...collapseArgs
}: CollapseMorphRelationFieldMetadataEventsArgs & {
  events: FieldMetadataEvent[];
}): FieldMetadataEvent[] => {
  const morphGroupEventsByKey = new Map<string, FieldMetadataEvent[]>();

  for (const event of events) {
    const morphGroup = getMorphGroup(event);

    if (!isDefined(morphGroup)) {
      continue;
    }

    const morphGroupKey = getMorphGroupKey(morphGroup);

    morphGroupEventsByKey.set(morphGroupKey, [
      ...(morphGroupEventsByKey.get(morphGroupKey) ?? []),
      event,
    ]);
  }

  if (morphGroupEventsByKey.size === 0) {
    return events;
  }

  return events.flatMap((event) => {
    const morphGroup = getMorphGroup(event);

    if (!isDefined(morphGroup)) {
      return [event];
    }

    const morphGroupEvents = morphGroupEventsByKey.get(
      getMorphGroupKey(morphGroup),
    );

    if (!isDefined(morphGroupEvents) || morphGroupEvents[0] !== event) {
      return [];
    }

    return collapseMorphGroupEvents({
      ...collapseArgs,
      morphGroup,
      morphGroupEvents,
    });
  });
};
