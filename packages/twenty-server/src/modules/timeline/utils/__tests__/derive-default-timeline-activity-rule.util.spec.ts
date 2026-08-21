import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { deriveDefaultTimelineActivityRule } from 'src/modules/timeline/utils/derive-default-timeline-activity-rule.util';

const COMPANY_FLAT_OBJECT_METADATA = getFlatObjectMetadataMock({
  universalIdentifier: 'company-universal-identifier',
  id: 'company-object-id',
  nameSingular: 'company',
  isAuditLogged: true,
  isSystem: false,
});

const withOverrides = (
  overrides: Partial<FlatObjectMetadata>,
): FlatObjectMetadata => ({ ...COMPANY_FLAT_OBJECT_METADATA, ...overrides });

describe('deriveDefaultTimelineActivityRule', () => {
  it('should derive a self rule for an audit logged non system object', () => {
    expect(
      deriveDefaultTimelineActivityRule(COMPANY_FLAT_OBJECT_METADATA),
    ).toEqual({
      sourceFlatObjectMetadata: COMPANY_FLAT_OBJECT_METADATA,
      actions: ['created', 'updated', 'deleted', 'restored'],
      triggerFieldNames: null,
      targetShape: { kind: 'SELF' },
    });
  });

  it('should not derive a rule when the object is not audit logged', () => {
    expect(
      deriveDefaultTimelineActivityRule(
        withOverrides({ isAuditLogged: false }),
      ),
    ).toBeUndefined();
  });

  it('should not derive a rule for a system object', () => {
    expect(
      deriveDefaultTimelineActivityRule(
        withOverrides({ isSystem: true, nameSingular: 'noteTarget' }),
      ),
    ).toBeUndefined();
  });
});
