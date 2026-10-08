import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';
import { type WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

const OBJECT_NAME_PREFIX = 'morphEventMirrorTest';
const MAX_ATTEMPTS = 20;

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

const sortById = (fields: MirroredMorphField[]) =>
  [...fields].sort((a, b) => a.id.localeCompare(b.id));

describe('Morph relation metadata events', () => {
  let broadcaster: WorkspaceEventBroadcaster;
  let emitter: MetadataEventEmitter;
  let objectMetadataId: string | undefined;

  beforeAll(() => {
    broadcaster = getAppProviderByClassName('WorkspaceEventBroadcaster');
    emitter = getAppProviderByClassName('MetadataEventEmitter');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createTargetObject = async (nameSingular: string) => {
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

    objectMetadataId = data.createOneObject.id;
  };

  const deleteTargetObject = async (idToDelete: string) => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: { idToUpdate: idToDelete, updatePayload: { isActive: false } },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete },
    });

    objectMetadataId = undefined;
  };

  afterAll(async () => {
    if (isDefined(objectMetadataId)) {
      await deleteTargetObject(objectMetadataId);
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

  const isMorphFieldUpsert = ({ type, properties }: WorkspaceBroadcastEvent) =>
    type !== 'deleted' &&
    (properties.after as { type?: string } | undefined)?.type ===
      FieldMetadataType.MORPH_RELATION;

  // Row ids are random, so target objects are created until one of their
  // morph rows becomes a group representative and the handover is exercised
  it('keeps a client mirror of morph fields equal to objects.fieldsList while target objects come and go', async () => {
    const mirror = new Map(
      (await fetchMorphFields()).map((field) => [field.id, field]),
    );
    let hasHandedOverMorphField = false;

    for (
      let attempt = 0;
      attempt < MAX_ATTEMPTS && !hasHandedOverMorphField;
      attempt++
    ) {
      const nameSingular = `${OBJECT_NAME_PREFIX}${attempt}`;

      const creationEvents = await captureFieldMetadataBroadcasts(() =>
        createTargetObject(nameSingular),
      );

      expect(
        creationEvents.filter(
          (event) =>
            isMorphFieldUpsert(event) &&
            (event.properties.after as { name: string }).name.endsWith(
              capitalize(nameSingular),
            ),
        ),
      ).toEqual([]);

      hasHandedOverMorphField = creationEvents.some(
        (event) => isMorphFieldUpsert(event) && event.type === 'created',
      );

      applyToMirror(mirror, creationEvents);

      const createdObjectMetadataId = objectMetadataId as string;
      const fieldsAfterCreation = await fetchMorphFields();

      expect(
        fieldsAfterCreation.some(({ targetObjectMetadataIds }) =>
          targetObjectMetadataIds.includes(createdObjectMetadataId),
        ),
      ).toBe(true);
      expect(sortById([...mirror.values()])).toEqual(
        sortById(fieldsAfterCreation),
      );

      applyToMirror(
        mirror,
        await captureFieldMetadataBroadcasts(() =>
          deleteTargetObject(createdObjectMetadataId),
        ),
      );

      const fieldsAfterDeletion = await fetchMorphFields();

      expect(
        fieldsAfterDeletion.some(({ targetObjectMetadataIds }) =>
          targetObjectMetadataIds.includes(createdObjectMetadataId),
        ),
      ).toBe(false);
      expect(sortById([...mirror.values()])).toEqual(
        sortById(fieldsAfterDeletion),
      );
    }

    expect(hasHandedOverMorphField).toBe(true);
  }, 120000);
});
