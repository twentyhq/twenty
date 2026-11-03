import {
  type ConditionalDisplay,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { fromConditionalDisplayToUniversalConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/from-conditional-display-to-universal-conditional-display.util';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { fromUniversalConditionalDisplayToConditionalDisplay } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-universal-conditional-display-to-conditional-display.util';

const FIELD_ID = '11111111-1111-4111-8111-111111111111';
const FIELD_UNIVERSAL_IDENTIFIER = '20202020-1111-4111-8111-111111111111';
const ADMIN_ROLE_ID = '22222222-2222-4222-8222-222222222222';
const ADMIN_ROLE_UNIVERSAL_IDENTIFIER = '20202020-2222-4222-8222-222222222222';
const SALES_ROLE_ID = '33333333-3333-4333-8333-333333333333';
const SALES_ROLE_UNIVERSAL_IDENTIFIER = '20202020-3333-4333-8333-333333333333';

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    [FIELD_UNIVERSAL_IDENTIFIER]: {
      id: FIELD_ID,
      universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
    },
  },
} as unknown as MetadataFlatEntityMaps<'fieldMetadata'>;

const flatRoleMaps = {
  byUniversalIdentifier: {
    [ADMIN_ROLE_UNIVERSAL_IDENTIFIER]: {
      id: ADMIN_ROLE_ID,
      universalIdentifier: ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
    },
    [SALES_ROLE_UNIVERSAL_IDENTIFIER]: {
      id: SALES_ROLE_ID,
      universalIdentifier: SALES_ROLE_UNIVERSAL_IDENTIFIER,
    },
  },
} as unknown as MetadataFlatEntityMaps<'role'>;

const CONDITIONAL_DISPLAY: ConditionalDisplay = {
  recordFilters: [
    {
      id: '0',
      contextKey: 'currentRoleId',
      operand: ViewFilterOperand.IS,
      value: JSON.stringify([ADMIN_ROLE_ID, SALES_ROLE_ID]),
      recordFilterGroupId: 'root',
    },
    {
      id: '1',
      fieldMetadataId: FIELD_ID,
      operand: ViewFilterOperand.IS_NOT_EMPTY,
      value: '',
      recordFilterGroupId: 'root',
    },
  ],
  recordFilterGroups: [
    { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.OR },
  ],
};

describe('fromConditionalDisplayToUniversalConditionalDisplay', () => {
  it('should map field and role ids to universal identifiers and back', () => {
    const universalConditionalDisplay =
      fromConditionalDisplayToUniversalConditionalDisplay({
        conditionalDisplay: CONDITIONAL_DISPLAY,
        fieldMetadataUniversalIdentifierById: {
          [FIELD_ID]: FIELD_UNIVERSAL_IDENTIFIER,
        },
        roleUniversalIdentifierById: {
          [ADMIN_ROLE_ID]: ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
          [SALES_ROLE_ID]: SALES_ROLE_UNIVERSAL_IDENTIFIER,
        },
      });

    expect(universalConditionalDisplay?.recordFilters).toEqual([
      expect.objectContaining({
        value: JSON.stringify([
          ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
          SALES_ROLE_UNIVERSAL_IDENTIFIER,
        ]),
      }),
      expect.objectContaining({
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      }),
    ]);

    expect(
      fromUniversalConditionalDisplayToConditionalDisplay({
        universalConditionalDisplay,
        flatFieldMetadataMaps,
        flatRoleMaps,
      }),
    ).toEqual(CONDITIONAL_DISPLAY);
  });
});
