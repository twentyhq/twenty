import {
  type ObjectRecordCreateEvent,
  type ObjectRecordEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { omitReadDisabledFieldsFromWebhookEvents } from 'src/engine/metadata-modules/webhook/utils/omit-read-disabled-fields-from-webhook-events.util';

const OBJECT_METADATA_ID = 'invoice-object-id';
const OWNING_APPLICATION_ID = 'stripe-application-id';

const invoice = getFlatObjectMetadataMock({
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_ID,
  nameSingular: 'invoice',
  applicationId: OWNING_APPLICATION_ID,
});

const flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: invoice,
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: 'name-field-id',
    universalIdentifier: 'name-field-id',
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'name',
    applicationId: OWNING_APPLICATION_ID,
  }),
  getFlatFieldMetadataMock({
    id: 'secret-field-id',
    universalIdentifier: 'secret-field-id',
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'secret',
    applicationId: OWNING_APPLICATION_ID,
    disabledFieldPermissionActions: ['canReadFieldValue'],
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const omitFromEvents = <TEvent extends ObjectRecordEvent>(events: TEvent[]) =>
  omitReadDisabledFieldsFromWebhookEvents({
    events,
    objectMetadata: invoice,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('omitReadDisabledFieldsFromWebhookEvents', () => {
  it('should omit a read-disabled field from a created record', () => {
    const createEvent: ObjectRecordCreateEvent = {
      recordId: 'record-1',
      properties: { after: { id: 'record-1', name: 'Acme', secret: 'x' } },
    };

    const [event] = omitFromEvents([createEvent]);

    expect(event.properties.after).toEqual({ id: 'record-1', name: 'Acme' });
  });

  it('should omit a read-disabled field from an updated record', () => {
    const updateEvent: ObjectRecordUpdateEvent = {
      recordId: 'record-1',
      properties: {
        updatedFields: ['name', 'secret'],
        before: { id: 'record-1', name: 'Old', secret: 'old' },
        after: { id: 'record-1', name: 'New', secret: 'new' },
        diff: {
          name: { before: 'Old', after: 'New' },
          secret: { before: 'old', after: 'new' },
        },
      },
    };

    const [event] = omitFromEvents([updateEvent]);

    expect(event.properties).toEqual({
      updatedFields: ['name'],
      before: { id: 'record-1', name: 'Old' },
      after: { id: 'record-1', name: 'New' },
      diff: { name: { before: 'Old', after: 'New' } },
    });
  });

  it('should drop an update that only changed read-disabled fields', () => {
    const updateEvent: ObjectRecordUpdateEvent = {
      recordId: 'record-1',
      properties: {
        updatedFields: ['secret'],
        before: { id: 'record-1', secret: 'old' },
        after: { id: 'record-1', secret: 'new' },
        diff: { secret: { before: 'old', after: 'new' } },
      },
    };

    expect(omitFromEvents([updateEvent])).toEqual([]);
  });
});
