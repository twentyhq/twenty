import {
  NOTE_TARGET_NOTE_FIELD_ID,
  getMorphRelationGroupFlatEntityMapsMock,
} from 'src/engine/subscriptions/metadata-event/__mocks__/get-morph-relation-group-flat-entity-maps.mock';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type ScalarFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/scalar-flat-entity.type';
import { collapseMorphRelationFieldMetadataEvents } from 'src/engine/subscriptions/metadata-event/utils/collapse-morph-relation-field-metadata-events.util';
import {
  type MetadataEvent,
  type UpdateMetadataEvent,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

// Survivors are picked by lowest id among active rows, so ids encode the order
const ROCKET_ROW_ID = 'morph-row-1';
const PERSON_ROW_ID = 'morph-row-2';
const COMPANY_ROW_ID = 'morph-row-3';
const LATE_ROCKET_ROW_ID = 'morph-row-9';

const PERSON_ROW = { id: PERSON_ROW_ID, targetNameSingular: 'person' };
const COMPANY_ROW = { id: COMPANY_ROW_ID, targetNameSingular: 'company' };
const ROCKET_ROW = { id: ROCKET_ROW_ID, targetNameSingular: 'rocket' };

type ScalarFlatFieldMetadata = ScalarFlatEntity<
  MetadataEntity<'fieldMetadata'>
>;

const buildCreatedEvent = (
  after: ScalarFlatFieldMetadata,
): MetadataEvent<'fieldMetadata'> => ({
  type: 'created',
  metadataName: 'fieldMetadata',
  recordId: after.id,
  properties: { after },
});

const buildDeletedEvent = (
  before: ScalarFlatFieldMetadata,
): MetadataEvent<'fieldMetadata'> => ({
  type: 'deleted',
  metadataName: 'fieldMetadata',
  recordId: before.id,
  properties: { before },
});

const buildUpdatedEvent = ({
  before,
  after,
  updatedFields,
}: {
  before: ScalarFlatFieldMetadata;
  after: ScalarFlatFieldMetadata;
  updatedFields: (keyof ScalarFlatFieldMetadata)[];
}): MetadataEvent<'fieldMetadata'> =>
  ({
    type: 'updated',
    metadataName: 'fieldMetadata',
    recordId: after.id,
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
  }) as UpdateMetadataEvent<'fieldMetadata'>;

const summarize = (events: MetadataEvent<'fieldMetadata'>[]) =>
  events.map((event) => ({
    type: event.type,
    recordId: event.recordId,
    name:
      event.type === 'deleted'
        ? event.properties.before.name
        : event.properties.after.name,
  }));

describe('collapseMorphRelationFieldMetadataEvents', () => {
  it('should refresh the representative when a non-representative row is created', () => {
    const lateRocketRow = {
      id: LATE_ROCKET_ROW_ID,
      targetNameSingular: 'rocket',
    };
    const after = getMorphRelationGroupFlatEntityMapsMock([
      PERSON_ROW,
      COMPANY_ROW,
      lateRocketRow,
    ]);

    const events = collapseMorphRelationFieldMetadataEvents({
      events: [
        buildCreatedEvent(after.getScalarFlatFieldMetadata(LATE_ROCKET_ROW_ID)),
      ],
      ...after,
    });

    expect(summarize(events)).toEqual([
      { type: 'updated', recordId: PERSON_ROW_ID, name: 'target' },
    ]);
    expect(events[0].properties).toMatchObject({ updatedFields: [] });
  });

  it('should replace the representative when a row with a lower id is created', () => {
    const after = getMorphRelationGroupFlatEntityMapsMock([
      PERSON_ROW,
      COMPANY_ROW,
      ROCKET_ROW,
    ]);

    const events = collapseMorphRelationFieldMetadataEvents({
      events: [
        buildCreatedEvent(after.getScalarFlatFieldMetadata(ROCKET_ROW_ID)),
      ],
      ...after,
    });

    expect(summarize(events)).toEqual([
      { type: 'created', recordId: ROCKET_ROW_ID, name: 'target' },
      { type: 'deleted', recordId: PERSON_ROW_ID, name: 'target' },
    ]);
  });

  it('should hand the morph field over to a new representative when the representative is deleted', () => {
    const before = getMorphRelationGroupFlatEntityMapsMock([
      PERSON_ROW,
      COMPANY_ROW,
      ROCKET_ROW,
    ]);
    const after = getMorphRelationGroupFlatEntityMapsMock([
      PERSON_ROW,
      COMPANY_ROW,
    ]);

    const events = collapseMorphRelationFieldMetadataEvents({
      events: [
        buildDeletedEvent(before.getScalarFlatFieldMetadata(ROCKET_ROW_ID)),
      ],
      ...after,
    });

    expect(summarize(events)).toEqual([
      { type: 'created', recordId: PERSON_ROW_ID, name: 'target' },
      { type: 'deleted', recordId: ROCKET_ROW_ID, name: 'targetRocket' },
    ]);
  });

  it('should keep the representative when a non-representative row is deleted', () => {
    const before = getMorphRelationGroupFlatEntityMapsMock([
      PERSON_ROW,
      COMPANY_ROW,
    ]);
    const after = getMorphRelationGroupFlatEntityMapsMock([PERSON_ROW]);

    const events = collapseMorphRelationFieldMetadataEvents({
      events: [
        buildDeletedEvent(before.getScalarFlatFieldMetadata(COMPANY_ROW_ID)),
      ],
      ...after,
    });

    expect(summarize(events)).toEqual([
      { type: 'updated', recordId: PERSON_ROW_ID, name: 'target' },
      { type: 'deleted', recordId: COMPANY_ROW_ID, name: 'targetCompany' },
    ]);
  });

  it('should only emit deletes when the whole morph group is deleted', () => {
    const before = getMorphRelationGroupFlatEntityMapsMock([
      PERSON_ROW,
      COMPANY_ROW,
    ]);
    const after = getMorphRelationGroupFlatEntityMapsMock([]);

    const events = collapseMorphRelationFieldMetadataEvents({
      events: [PERSON_ROW_ID, COMPANY_ROW_ID].map((recordId) =>
        buildDeletedEvent(before.getScalarFlatFieldMetadata(recordId)),
      ),
      ...after,
    });

    expect(summarize(events)).toEqual([
      { type: 'deleted', recordId: PERSON_ROW_ID, name: 'targetPerson' },
      { type: 'deleted', recordId: COMPANY_ROW_ID, name: 'targetCompany' },
    ]);
  });

  it('should fold sibling updates into a single update of the representative', () => {
    const before = getMorphRelationGroupFlatEntityMapsMock([
      PERSON_ROW,
      COMPANY_ROW,
    ]);
    const after = getMorphRelationGroupFlatEntityMapsMock([
      { ...PERSON_ROW, label: 'Subject' },
      { ...COMPANY_ROW, label: 'Subject' },
    ]);

    const events = collapseMorphRelationFieldMetadataEvents({
      events: [PERSON_ROW_ID, COMPANY_ROW_ID].map((recordId) =>
        buildUpdatedEvent({
          before: before.getScalarFlatFieldMetadata(recordId),
          after: after.getScalarFlatFieldMetadata(recordId),
          updatedFields: ['label'],
        }),
      ),
      ...after,
    });

    expect(summarize(events)).toEqual([
      { type: 'updated', recordId: PERSON_ROW_ID, name: 'target' },
    ]);
    expect(events[0].properties).toMatchObject({
      updatedFields: ['label'],
      diff: { label: { before: 'Target', after: 'Subject' } },
    });
  });

  it('should replace the representative when it is deactivated', () => {
    const before = getMorphRelationGroupFlatEntityMapsMock([
      PERSON_ROW,
      COMPANY_ROW,
    ]);
    const after = getMorphRelationGroupFlatEntityMapsMock([
      { ...PERSON_ROW, isActive: false },
      COMPANY_ROW,
    ]);

    const events = collapseMorphRelationFieldMetadataEvents({
      events: [
        buildUpdatedEvent({
          before: before.getScalarFlatFieldMetadata(PERSON_ROW_ID),
          after: after.getScalarFlatFieldMetadata(PERSON_ROW_ID),
          updatedFields: ['isActive'],
        }),
      ],
      ...after,
    });

    expect(summarize(events)).toEqual([
      { type: 'created', recordId: COMPANY_ROW_ID, name: 'target' },
      { type: 'deleted', recordId: PERSON_ROW_ID, name: 'target' },
    ]);
  });

  it('should leave non-morph field events untouched', () => {
    const after = getMorphRelationGroupFlatEntityMapsMock([PERSON_ROW]);
    const noteFieldEvent = buildCreatedEvent(
      after.getScalarFlatFieldMetadata(NOTE_TARGET_NOTE_FIELD_ID),
    );

    const events = collapseMorphRelationFieldMetadataEvents({
      events: [noteFieldEvent],
      ...after,
    });

    expect(events).toEqual([noteFieldEvent]);
    expect(events[0]).toBe(noteFieldEvent);
  });
});
