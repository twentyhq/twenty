import {
  FieldMetadataType,
  RelationType,
  type UniversalDashboardFilterBinding,
} from 'twenty-shared/types';

import { validateDashboardFilterBindings } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-dashboard-filter-bindings.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-aaaa-4aaa-8aaa-000000000001';
const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-bbbb-4bbb-8bbb-000000000002';
const WORKSPACE_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-cccc-4ccc-8ccc-000000000003';

const COMPANY_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-1111-4111-8111-000000000001';
const COMPANY_ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-2222-4222-8222-000000000002';
const COMPANY_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-000000000003';
const PERSON_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-4444-4444-8444-000000000004';
const WORKSPACE_MEMBER_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-5555-4555-8555-000000000005';
const UNKNOWN_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-9999-4999-8999-000000000009';

const flatFieldMetadata = ({
  universalIdentifier,
  objectMetadataUniversalIdentifier,
  type,
  relationType,
  relationTargetObjectMetadataUniversalIdentifier,
}: {
  universalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  type: FieldMetadataType;
  relationType?: RelationType;
  relationTargetObjectMetadataUniversalIdentifier?: string;
}) => ({
  universalIdentifier,
  objectMetadataUniversalIdentifier,
  type,
  label: 'Some field',
  isActive: true,
  universalSettings: relationType ? { relationType } : null,
  relationTargetObjectMetadataUniversalIdentifier:
    relationTargetObjectMetadataUniversalIdentifier ?? null,
});

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    [COMPANY_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER]: flatFieldMetadata({
      universalIdentifier: COMPANY_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.DATE_TIME,
    }),
    [COMPANY_ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER]: flatFieldMetadata({
      universalIdentifier: COMPANY_ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      relationTargetObjectMetadataUniversalIdentifier:
        WORKSPACE_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
    }),
    [COMPANY_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER]: flatFieldMetadata({
      universalIdentifier: COMPANY_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.ONE_TO_MANY,
      relationTargetObjectMetadataUniversalIdentifier:
        PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
    }),
    [PERSON_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER]: flatFieldMetadata({
      universalIdentifier: PERSON_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.DATE_TIME,
    }),
    [WORKSPACE_MEMBER_NAME_FIELD_UNIVERSAL_IDENTIFIER]: flatFieldMetadata({
      universalIdentifier: WORKSPACE_MEMBER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier:
        WORKSPACE_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.FULL_NAME,
    }),
  },
} as unknown as MetadataUniversalFlatEntityMaps<'fieldMetadata'>;

const validateBindings = (
  dashboardFilterBindings: Record<
    string,
    UniversalDashboardFilterBinding | null
  >,
) =>
  validateDashboardFilterBindings({
    dashboardFilterBindings,
    widgetTitle: 'Companies per month',
    widgetObjectMetadataUniversalIdentifier:
      COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
    flatFieldMetadataMaps,
  });

describe('validateDashboardFilterBindings', () => {
  it('should accept undefined bindings', () => {
    expect(
      validateDashboardFilterBindings({
        dashboardFilterBindings: undefined,
        widgetTitle: 'Companies per month',
        widgetObjectMetadataUniversalIdentifier:
          COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
        flatFieldMetadataMaps,
      }),
    ).toEqual([]);
  });

  it('should accept a binding to a field of the widget object', () => {
    expect(
      validateBindings({
        date: {
          fieldMetadataUniversalIdentifier:
            COMPANY_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
        },
      }),
    ).toEqual([]);
  });

  it('should accept a null binding as an explicit opt-out', () => {
    expect(validateBindings({ date: null })).toEqual([]);
  });

  it('should accept a many-to-one relation traversal to a field of the target object', () => {
    expect(
      validateBindings({
        owner: {
          fieldMetadataUniversalIdentifier:
            COMPANY_ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
          relationTargetFieldMetadataUniversalIdentifier:
            WORKSPACE_MEMBER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
        },
      }),
    ).toEqual([]);
  });

  it('should reject a binding without a field', () => {
    const errors = validateBindings({
      date: { fieldMetadataUniversalIdentifier: null },
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_PAGE_LAYOUT_WIDGET_DATA');
    expect(errors[0].message).toContain('"date"');
    expect(errors[0].message).toContain('Companies per month');
    expect(errors[0].message).toContain('has no field');
  });

  it('should reject a binding to a field that does not exist', () => {
    const errors = validateBindings({
      date: {
        fieldMetadataUniversalIdentifier: UNKNOWN_FIELD_UNIVERSAL_IDENTIFIER,
      },
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('does not exist');
  });

  it('should reject a binding to a field of another object', () => {
    const errors = validateBindings({
      date: {
        fieldMetadataUniversalIdentifier:
          PERSON_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      },
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain(
      'must use a field of the widget object',
    );
  });

  it('should reject a relation traversal on a field that is not a many-to-one relation', () => {
    const errors = validateBindings({
      owner: {
        fieldMetadataUniversalIdentifier:
          COMPANY_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER,
        relationTargetFieldMetadataUniversalIdentifier:
          PERSON_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      },
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('not a many-to-one relation');
  });

  it('should reject a relation traversal on a non-relation field', () => {
    const errors = validateBindings({
      owner: {
        fieldMetadataUniversalIdentifier:
          COMPANY_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
        relationTargetFieldMetadataUniversalIdentifier:
          WORKSPACE_MEMBER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      },
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('not a many-to-one relation');
  });

  it('should reject a relation target field that does not exist', () => {
    const errors = validateBindings({
      owner: {
        fieldMetadataUniversalIdentifier:
          COMPANY_ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        relationTargetFieldMetadataUniversalIdentifier:
          UNKNOWN_FIELD_UNIVERSAL_IDENTIFIER,
      },
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain(
      'relation target field that does not exist',
    );
  });

  it('should reject a relation target field that belongs to another object than the relation target', () => {
    const errors = validateBindings({
      owner: {
        fieldMetadataUniversalIdentifier:
          COMPANY_ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        relationTargetFieldMetadataUniversalIdentifier:
          PERSON_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      },
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain(
      'does not belong to the relation target object',
    );
  });

  it('should report one error per invalid binding and skip valid ones', () => {
    const errors = validateBindings({
      date: {
        fieldMetadataUniversalIdentifier:
          COMPANY_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      },
      owner: null,
      broken: {
        fieldMetadataUniversalIdentifier:
          PERSON_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      },
      missing: {
        fieldMetadataUniversalIdentifier: UNKNOWN_FIELD_UNIVERSAL_IDENTIFIER,
      },
    });

    expect(errors).toHaveLength(2);
    expect(errors.map((error) => error.value)).toEqual([
      PERSON_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      UNKNOWN_FIELD_UNIVERSAL_IDENTIFIER,
    ]);
  });
});
