import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { buildTimelineActivitySelfRule } from 'src/modules/timeline/utils/build-timeline-activity-self-rule.util';

const COMPANY_FLAT_OBJECT_METADATA = getFlatObjectMetadataMock({
  universalIdentifier: 'company-universal-identifier',
  id: 'company-object-id',
  nameSingular: 'company',
  isAuditLogged: true,
  isSystem: false,
});

const createdSelfEmitter = {
  action: 'created' as const,
  objectUniversalIdentifier: COMPANY_FLAT_OBJECT_METADATA.universalIdentifier,
  targetRelationFieldUniversalIdentifier: null,
};

describe('buildTimelineActivitySelfRule', () => {
  it('combines default audit actions with declared emitters without duplicates', () => {
    expect(
      buildTimelineActivitySelfRule({
        flatObjectMetadata: COMPANY_FLAT_OBJECT_METADATA,
        timelineActivityTypes: [createdSelfEmitter],
      }),
    ).toMatchObject({
      actions: ['created', 'updated', 'deleted', 'restored'],
      targetShape: { kind: 'SELF' },
    });
  });

  it('builds a self rule from a declaration when default audit is disabled', () => {
    expect(
      buildTimelineActivitySelfRule({
        flatObjectMetadata: {
          ...COMPANY_FLAT_OBJECT_METADATA,
          isAuditLogged: false,
        },
        timelineActivityTypes: [createdSelfEmitter],
      }),
    ).toMatchObject({
      actions: ['created'],
      targetShape: { kind: 'SELF' },
    });
  });

  it('omits a self rule when neither defaults nor declarations apply', () => {
    expect(
      buildTimelineActivitySelfRule({
        flatObjectMetadata: {
          ...COMPANY_FLAT_OBJECT_METADATA,
          isAuditLogged: false,
        },
        timelineActivityTypes: [],
      }),
    ).toBeUndefined();
  });

  it('does not add default actions to system objects', () => {
    expect(
      buildTimelineActivitySelfRule({
        flatObjectMetadata: {
          ...COMPANY_FLAT_OBJECT_METADATA,
          isSystem: true,
        },
        timelineActivityTypes: [],
      }),
    ).toBeUndefined();
  });

  it('does not derive self actions from through emitters', () => {
    expect(
      buildTimelineActivitySelfRule({
        flatObjectMetadata: {
          ...COMPANY_FLAT_OBJECT_METADATA,
          isAuditLogged: false,
        },
        timelineActivityTypes: [
          {
            ...createdSelfEmitter,
            targetRelationFieldUniversalIdentifier: 'relation-identifier',
          },
        ],
      }),
    ).toBeUndefined();
  });
});
