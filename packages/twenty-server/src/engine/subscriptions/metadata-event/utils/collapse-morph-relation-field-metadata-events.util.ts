import isEqual from 'lodash.isequal';
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

type MorphGroupMaps = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

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

  const before = isDefined(representativeUpdateEvent)
    ? toCollapsedScalarFlatFieldMetadata({
        morphRelationFlatFieldMetadata: {
          ...representative,
          ...representativeUpdateEvent.properties.before,
        } as MorphRelationFlatFieldMetadata,
        flatObjectMetadataMaps,
      })
    : after;

  const updatedFields = (
    Object.keys(after) as (keyof ScalarFlatFieldMetadata)[]
  ).filter((property) => !isEqual(before[property], after[property]));

  return {
    type: 'updated',
    metadataName: 'fieldMetadata',
    recordId: representative.id,
    properties: {
      updatedFields,
      diff: Object.fromEntries(
        updatedFields.map((property) => [
          property,
          { before: before[property], after: after[property] },
        ]),
      ),
      before,
      after,
    },
  } as UpdateMetadataEvent<'fieldMetadata'>;
};

const collapseMorphGroupEvents = ({
  morphGroup,
  morphGroupEvents,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: MorphGroupMaps & {
  morphGroup: MorphGroup;
  morphGroupEvents: FieldMetadataEvent[];
}): FieldMetadataEvent[] => {
  const currentMorphFlatFieldMetadatas = findMorphGroupFlatFieldMetadatas({
    ...morphGroup,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  });

  // The cache already holds the post-migration group, so the batch events are
  // rewound on top of it to find the representative clients currently hold
  const previousMorphFieldById = new Map<
    string,
    Pick<ScalarFlatFieldMetadata, 'id' | 'isActive' | 'isSystem'>
  >(
    currentMorphFlatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.id,
      flatFieldMetadata,
    ]),
  );

  for (const event of morphGroupEvents) {
    if (event.type === 'created') {
      previousMorphFieldById.delete(event.recordId);
    } else {
      previousMorphFieldById.set(event.recordId, event.properties.before);
    }
  }

  const previousMorphFields = [...previousMorphFieldById.values()];
  const previousRepresentativeId = isNonEmptyArray(previousMorphFields)
    ? pickMorphGroupSurvivorOrThrow(previousMorphFields).id
    : undefined;

  const representative = isNonEmptyArray(currentMorphFlatFieldMetadatas)
    ? pickMorphGroupSurvivorOrThrow(currentMorphFlatFieldMetadatas)
    : undefined;

  const representativeEvents: FieldMetadataEvent[] = isDefined(representative)
    ? [
        buildRepresentativeEvent({
          representative,
          previousRepresentativeId,
          morphGroupEvents,
          flatObjectMetadataMaps,
        }),
      ]
    : [];

  const deletedRowEvents = morphGroupEvents.filter(
    (event) => event.type === 'deleted',
  );

  const replacedRepresentative =
    previousRepresentativeId !== representative?.id
      ? currentMorphFlatFieldMetadatas.find(
          (flatFieldMetadata) =>
            flatFieldMetadata.id === previousRepresentativeId,
        )
      : undefined;

  const replacedRepresentativeEvents: FieldMetadataEvent[] = isDefined(
    replacedRepresentative,
  )
    ? [
        {
          type: 'deleted',
          metadataName: 'fieldMetadata',
          recordId: replacedRepresentative.id,
          properties: {
            before: toCollapsedScalarFlatFieldMetadata({
              morphRelationFlatFieldMetadata: replacedRepresentative,
              flatObjectMetadataMaps,
            }),
          },
        },
      ]
    : [];

  // Deletes come after the new representative so clients never go through a
  // state where the morph field is missing
  return [
    ...representativeEvents,
    ...deletedRowEvents,
    ...replacedRepresentativeEvents,
  ];
};

// Clients mirror the objects.fieldsList shape, where each morph group is
// collapsed into its representative row, so per-row events are rewritten into
// that shape instead of leaking sibling rows or dropping the whole field
export const collapseMorphRelationFieldMetadataEvents = ({
  events,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: MorphGroupMaps & {
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

    try {
      return collapseMorphGroupEvents({
        morphGroup,
        morphGroupEvents,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      });
    } catch {
      return morphGroupEvents;
    }
  });
};
