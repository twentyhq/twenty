import {
  CommandMenuContextApiPageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { evaluateConditionalAvailabilityExpression } from '../evaluateConditionalAvailabilityExpression';

const buildContext = (
  overrides: Partial<CommandMenuContextApi> = {},
): CommandMenuContextApi => ({
  pageType: CommandMenuContextApiPageType.INDEX_PAGE,
  isInSidePanel: false,
  favoriteRecordIds: [],
  isSelectAll: false,
  hasAnySoftDeleteFilterOnView: false,
  numberOfSelectedRecords: 0,
  objectPermissions: {
    objectMetadataId: '',
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
  selectedRecords: [],
  featureFlags: {},
  targetObjectReadPermissions: {},
  targetObjectWritePermissions: {},
  objectMetadataItem: {},
  ...overrides,
});

describe('evaluateConditionalAvailabilityExpression', () => {
  describe('arrayLength for favoriteRecordIds', () => {
    it('should evaluate arrayLength(favoriteRecordIds) < numberOfSelectedRecords when some selected are not favorites', () => {
      const expression =
        'arrayLength(favoriteRecordIds) < numberOfSelectedRecords and noneDefined(selectedRecords, "deletedAt") and not hasAnySoftDeleteFilterOnView';

      const context = buildContext({
        favoriteRecordIds: ['id-1'],
        numberOfSelectedRecords: 2,
        selectedRecords: [
          { id: 'id-1', createdAt: '', updatedAt: '', deletedAt: null },
          { id: 'id-2', createdAt: '', updatedAt: '', deletedAt: null },
        ],
        hasAnySoftDeleteFilterOnView: false,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should deny when all selected are already favorites', () => {
      const expression =
        'arrayLength(favoriteRecordIds) < numberOfSelectedRecords and noneDefined(selectedRecords, "deletedAt") and not hasAnySoftDeleteFilterOnView';

      const context = buildContext({
        favoriteRecordIds: ['id-1', 'id-2'],
        numberOfSelectedRecords: 2,
        selectedRecords: [
          { id: 'id-1', createdAt: '', updatedAt: '', deletedAt: null },
          { id: 'id-2', createdAt: '', updatedAt: '', deletedAt: null },
        ],
        hasAnySoftDeleteFilterOnView: false,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });

    it('should evaluate arrayLength(favoriteRecordIds) == numberOfSelectedRecords when all selected are favorites', () => {
      const expression =
        'arrayLength(favoriteRecordIds) == numberOfSelectedRecords and noneDefined(selectedRecords, "deletedAt") and not hasAnySoftDeleteFilterOnView';

      const context = buildContext({
        favoriteRecordIds: ['id-1', 'id-2'],
        numberOfSelectedRecords: 2,
        selectedRecords: [
          { id: 'id-1', createdAt: '', updatedAt: '', deletedAt: null },
          { id: 'id-2', createdAt: '', updatedAt: '', deletedAt: null },
        ],
        hasAnySoftDeleteFilterOnView: false,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should reject favoriteRecordIds.length (expr-eval parses "length" as unary op)', () => {
      const expression = 'favoriteRecordIds.length < numberOfSelectedRecords';
      const context = buildContext({
        favoriteRecordIds: ['id-1'],
        numberOfSelectedRecords: 2,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });
  });
});
