import { getFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-field-universal-identifier.util';
import { getSystemRelationFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-system-relation-field-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const HOST_OBJECT = '22222222-2222-4222-8222-222222222222';
const RELATION_TARGET_OBJECT = '33333333-3333-4333-8333-333333333333';

describe('getSystemRelationFieldUniversalIdentifier', () => {
  it('derives a deterministic id from the host and relation target object identifiers', () => {
    expect(
      getSystemRelationFieldUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        objectUniversalIdentifier: HOST_OBJECT,
        relationTargetObjectUniversalIdentifier: RELATION_TARGET_OBJECT,
      }),
    ).toBe('d3a641a1-f0fd-5213-a28e-af81e00c991e');
  });

  it('derives distinct ids for the two sides of the same relation (host and target swapped)', () => {
    const reverseSide = getSystemRelationFieldUniversalIdentifier({
      applicationUniversalIdentifier: APP,
      objectUniversalIdentifier: HOST_OBJECT,
      relationTargetObjectUniversalIdentifier: RELATION_TARGET_OBJECT,
    });
    const forwardSide = getSystemRelationFieldUniversalIdentifier({
      applicationUniversalIdentifier: APP,
      objectUniversalIdentifier: RELATION_TARGET_OBJECT,
      relationTargetObjectUniversalIdentifier: HOST_OBJECT,
    });

    expect(reverseSide).not.toBe(forwardSide);
  });

  it('cannot collide with a name-based field identifier for any real field name', () => {
    // The seed collides only if a field name equals
    // `systemRelation:${relationTargetUID}`, which is unreachable because field
    // names cannot contain colons. Any real (colon-free) field name on the host
    // object therefore derives a distinct id.
    const systemRelationIdentifier = getSystemRelationFieldUniversalIdentifier({
      applicationUniversalIdentifier: APP,
      objectUniversalIdentifier: HOST_OBJECT,
      relationTargetObjectUniversalIdentifier: RELATION_TARGET_OBJECT,
    });
    const nameBasedIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier: APP,
      objectUniversalIdentifier: HOST_OBJECT,
      name: 'targetCompany',
    });

    expect(systemRelationIdentifier).not.toBe(nameBasedIdentifier);
  });
});
