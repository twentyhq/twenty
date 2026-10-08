import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';
import { type WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

const OBJECT_NAME_PREFIX = 'morphEventMirror';

type MirroredMorphField = {
  id: string;
  name: string;
  objectMetadataId: string;
  targetObjectMetadataIds: string[];
};

type MorphRelationPayload = { targetObjectMetadata: { id: string } };

const toMirroredMorphField = ({
  id,
  name,
  objectMetadataId,
  morphRelations,
}: {
  id: string;
  name: string;
  objectMetadataId: string;
  morphRelations?: MorphRelationPayload[] | null;
}): MirroredMorphField => ({
  id,
  name,
  objectMetadataId,
  targetObjectMetadataIds: (morphRelations ?? [])
    .map(({ targetObjectMetadata }) => targetObjectMetadata.id)
    .sort(),
});

const fetchMorphFields = async (): Promise<MirroredMorphField[]> => {
  const { objects } = await findManyObjectMetadata({
    expectToFail: false,
    input: { filter: {}, paging: { first: 1000 } },
    gqlFields: `
      id
      fieldsList {
        id
        name
        type
        morphRelations { targetObjectMetadata { id } }
      }
    `,
  });

  return objects.flatMap((object) =>
    (object.fieldsList ?? [])
      .filter(({ type }) => type === FieldMetadataType.MORPH_RELATION)
      .map(({ id, name, ...field }) =>
        toMirroredMorphField({
          id,
          name,
          objectMetadataId: object.id,
          morphRelations: (field as { morphRelations?: MorphRelationPayload[] })
            .morphRelations,
        }),
      ),
  );
};

const fetchOwnerMorphRelations = async (
  objectMetadataId: string,
): Promise<{
  morphRelations: {
    sourceFieldMetadata: { id: string };
    targetObjectMetadata: { id: string };
  }[];
}> => {
  const { objects } = await findManyObjectMetadata({
    expectToFail: false,
    input: { filter: { id: { eq: objectMetadataId } }, paging: { first: 1 } },
    gqlFields: `
      id
      fieldsList {
        type
        morphRelations {
          sourceFieldMetadata { id }
          targetObjectMetadata { id }
        }
      }
    `,
  });

  const morphField = (objects[0]?.fieldsList ?? []).find(
    ({ type }) => type === FieldMetadataType.MORPH_RELATION,
  ) as
    | {
        morphRelations: {
          sourceFieldMetadata: { id: string };
          targetObjectMetadata: { id: string };
        }[];
      }
    | undefined;

  return { morphRelations: morphField?.morphRelations ?? [] };
};

const sortById = (fields: MirroredMorphField[]) =>
  [...fields].sort((a, b) => a.id.localeCompare(b.id));

describe('Morph relation metadata events', () => {
  let broadcaster: WorkspaceEventBroadcaster;
  let emitter: MetadataEventEmitter;
  const createdObjectMetadataIds = new Set<string>();

  beforeAll(() => {
    broadcaster = getAppProviderByClassName('WorkspaceEventBroadcaster');
    emitter = getAppProviderByClassName('MetadataEventEmitter');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createObject = async (suffix: string): Promise<string> => {
    const nameSingular = `${OBJECT_NAME_PREFIX}${suffix}`;
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular,
        namePlural: `${nameSingular}s`,
        labelSingular: nameSingular,
        labelPlural: `${nameSingular}s`,
        icon: 'IconBox',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataIds.add(data.createOneObject.id);

    return data.createOneObject.id;
  };

  const deleteObject = async (idToDelete: string) => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: { idToUpdate: idToDelete, updatePayload: { isActive: false } },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete },
    });

    createdObjectMetadataIds.delete(idToDelete);
  };

  afterAll(async () => {
    for (const objectMetadataId of [...createdObjectMetadataIds]) {
      await deleteObject(objectMetadataId);
    }

    await emitter.drain();
  });

  const captureFieldMetadataBroadcasts = async (
    mutate: () => Promise<unknown>,
  ): Promise<WorkspaceBroadcastEvent[]> => {
    await emitter.drain();

    const broadcastSpy = jest.spyOn(broadcaster, 'broadcast');

    await mutate();
    await emitter.drain();

    const fieldMetadataEvents = broadcastSpy.mock.calls
      .flatMap(([{ events }]) => events)
      .filter(({ entityName }) => entityName === 'fieldMetadata');

    broadcastSpy.mockRestore();

    return fieldMetadataEvents;
  };

  // Applies events the way the front metadata store does: upsert by id on
  // create and update, remove by id on delete
  const applyToMirror = (
    mirror: Map<string, MirroredMorphField>,
    events: WorkspaceBroadcastEvent[],
  ) => {
    for (const { type, recordId, properties } of events) {
      if (type === 'deleted') {
        mirror.delete(recordId);
        continue;
      }

      const after = properties.after as
        | (Parameters<typeof toMirroredMorphField>[0] & { type: string })
        | undefined;

      if (after?.type === FieldMetadataType.MORPH_RELATION) {
        mirror.set(recordId, toMirroredMorphField(after));
      }
    }
  };

  const expectMirrorToEqualFieldsList = async (
    mirror: Map<string, MirroredMorphField>,
  ) => {
    const morphFields = await fetchMorphFields();

    expect(sortById([...mirror.values()])).toEqual(sortById(morphFields));

    return morphFields;
  };

  const fetchMirror = async () =>
    new Map((await fetchMorphFields()).map((field) => [field.id, field]));

  it('keeps a client mirror of morph fields equal to objects.fieldsList while a target object comes and goes', async () => {
    const mirror = await fetchMirror();
    let objectMetadataId = '';

    const creationEvents = await captureFieldMetadataBroadcasts(async () => {
      objectMetadataId = await createObject('Target');
    });

    expect(
      creationEvents.filter(
        ({ type, properties }) =>
          type !== 'deleted' &&
          (properties.after as { type?: string } | undefined)?.type ===
            FieldMetadataType.MORPH_RELATION &&
          (properties.after as { name: string }).name.endsWith(
            capitalize(`${OBJECT_NAME_PREFIX}Target`),
          ),
      ),
    ).toEqual([]);

    applyToMirror(mirror, creationEvents);

    const fieldsAfterCreation = await expectMirrorToEqualFieldsList(mirror);

    expect(
      fieldsAfterCreation.some(({ targetObjectMetadataIds }) =>
        targetObjectMetadataIds.includes(objectMetadataId),
      ),
    ).toBe(true);

    applyToMirror(
      mirror,
      await captureFieldMetadataBroadcasts(() =>
        deleteObject(objectMetadataId),
      ),
    );

    const fieldsAfterDeletion = await expectMirrorToEqualFieldsList(mirror);

    expect(
      fieldsAfterDeletion.some(({ targetObjectMetadataIds }) =>
        targetObjectMetadataIds.includes(objectMetadataId),
      ),
    ).toBe(false);
  });

  it('hands a morph field over to another row when the target object of its representative is deleted', async () => {
    const ownerObjectMetadataId = await createObject('Owner');
    const firstTargetObjectMetadataId = await createObject('FirstTarget');
    const secondTargetObjectMetadataId = await createObject('SecondTarget');

    await createMorphRelationBetweenObjects({
      objectMetadataId: ownerObjectMetadataId,
      firstTargetObjectMetadataId,
      secondTargetObjectMetadataId,
      type: FieldMetadataType.MORPH_RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'subject',
      label: 'Subject',
    });
    await emitter.drain();

    const mirror = await fetchMirror();
    const ownerMorphField = [...mirror.values()].find(
      ({ objectMetadataId }) => objectMetadataId === ownerObjectMetadataId,
    );

    expect(ownerMorphField?.targetObjectMetadataIds).toHaveLength(2);

    // fieldsList exposes the representative row id, and each row targets one
    // object, so deleting the object the representative row targets always
    // forces a handover to the other row
    const { morphRelations } = await fetchOwnerMorphRelations(
      ownerObjectMetadataId,
    );
    const representativeTargetObjectMetadataId = morphRelations.find(
      ({ sourceFieldMetadata }) =>
        sourceFieldMetadata.id === ownerMorphField?.id,
    )?.targetObjectMetadata.id as string;

    const deletionEvents = await captureFieldMetadataBroadcasts(() =>
      deleteObject(representativeTargetObjectMetadataId),
    );

    expect(
      deletionEvents.some(
        ({ type, properties }) =>
          type === 'created' &&
          (properties.after as { objectMetadataId?: string } | undefined)
            ?.objectMetadataId === ownerObjectMetadataId,
      ),
    ).toBe(true);

    applyToMirror(mirror, deletionEvents);

    const fieldsAfterDeletion = await expectMirrorToEqualFieldsList(mirror);
    const handedOverMorphField = fieldsAfterDeletion.find(
      ({ objectMetadataId }) => objectMetadataId === ownerObjectMetadataId,
    );

    expect(handedOverMorphField?.id).not.toBe(ownerMorphField?.id);
    expect(handedOverMorphField?.targetObjectMetadataIds).toHaveLength(1);
  });
});
