import { ContextStorePageType, type CommandMenuContextApi } from '@/types';
import { evaluateConditionalAvailabilityExpression } from '../evaluateConditionalAvailabilityExpression';

const buildContext = (
  overrides: Partial<CommandMenuContextApi> = {},
): CommandMenuContextApi => ({
  pageType: ContextStorePageType.Index,
  isInSidePanel: false,
  isPageInEditMode: false,
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
  objectMetadataLabel: '',
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

    it('should reject favoriteRecordIds.length (expr-eval-fork parses "length" as unary op)', () => {
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

  describe('includesSome', () => {
    it('should return true when some records include the value in the array prop', () => {
      const expression = 'includesSome(selectedRecords, "statuses", "ACTIVE")';

      const context = buildContext({
        selectedRecords: [
          { id: 'id-1', statuses: ['ACTIVE'] },
          { id: 'id-2', statuses: ['DRAFT'] },
        ],
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should return false when no record includes the value in the array prop', () => {
      const expression = 'includesSome(selectedRecords, "statuses", "ACTIVE")';

      const context = buildContext({
        selectedRecords: [
          { id: 'id-1', statuses: ['DRAFT'] },
          { id: 'id-2', statuses: ['DRAFT'] },
        ],
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });
  });

  describe('includesNone', () => {
    it('should return true when no record includes the value in the array prop', () => {
      const expression = 'includesNone(selectedRecords, "statuses", "ACTIVE")';

      const context = buildContext({
        selectedRecords: [
          { id: 'id-1', statuses: ['DRAFT'] },
          { id: 'id-2', statuses: ['DRAFT'] },
        ],
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should return false when any record includes the value in the array prop', () => {
      const expression = 'includesNone(selectedRecords, "statuses", "ACTIVE")';

      const context = buildContext({
        selectedRecords: [
          { id: 'id-1', statuses: ['ACTIVE'] },
          { id: 'id-2', statuses: ['DRAFT'] },
        ],
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });

    it('should return false when all records include the value in the array prop', () => {
      const expression = 'includesNone(selectedRecords, "statuses", "ACTIVE")';

      const context = buildContext({
        selectedRecords: [
          { id: 'id-1', statuses: ['ACTIVE', 'DRAFT'] },
          { id: 'id-2', statuses: ['ACTIVE'] },
        ],
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });
  });

  describe('empty array guard against vacuous truth', () => {
    it('should return false for every() on empty selectedRecords', () => {
      const context = buildContext({ selectedRecords: [] });

      expect(
        evaluateConditionalAvailabilityExpression(
          'every(selectedRecords, "active")',
          context,
        ),
      ).toBe(false);
    });

    it('should return false for everyDefined() on empty selectedRecords', () => {
      const context = buildContext({ selectedRecords: [] });

      expect(
        evaluateConditionalAvailabilityExpression(
          'everyDefined(selectedRecords, "name")',
          context,
        ),
      ).toBe(false);
    });

    it('should return false for none() on empty selectedRecords', () => {
      const context = buildContext({ selectedRecords: [] });

      expect(
        evaluateConditionalAvailabilityExpression(
          'none(selectedRecords, "deletedAt")',
          context,
        ),
      ).toBe(false);
    });

    it('should return false for noneDefined() on empty selectedRecords', () => {
      const context = buildContext({ selectedRecords: [] });

      expect(
        evaluateConditionalAvailabilityExpression(
          'noneDefined(selectedRecords, "deletedAt")',
          context,
        ),
      ).toBe(false);
    });

    it('should return false for everyEquals() on empty selectedRecords', () => {
      const context = buildContext({ selectedRecords: [] });

      expect(
        evaluateConditionalAvailabilityExpression(
          'everyEquals(selectedRecords, "status", "DRAFT")',
          context,
        ),
      ).toBe(false);
    });

    it('should return false for noneEquals() on empty selectedRecords', () => {
      const context = buildContext({ selectedRecords: [] });

      expect(
        evaluateConditionalAvailabilityExpression(
          'noneEquals(selectedRecords, "status", "ACTIVE")',
          context,
        ),
      ).toBe(false);
    });

    it('should return false for includesEvery() on empty selectedRecords', () => {
      const context = buildContext({ selectedRecords: [] });

      expect(
        evaluateConditionalAvailabilityExpression(
          'includesEvery(selectedRecords, "statuses", "ACTIVE")',
          context,
        ),
      ).toBe(false);
    });

    it('should return false for includesNone() on empty selectedRecords', () => {
      const context = buildContext({ selectedRecords: [] });

      expect(
        evaluateConditionalAvailabilityExpression(
          'includesNone(selectedRecords, "statuses", "ACTIVE")',
          context,
        ),
      ).toBe(false);
    });

    it('should return false for some() on empty selectedRecords', () => {
      const context = buildContext({ selectedRecords: [] });

      expect(
        evaluateConditionalAvailabilityExpression(
          'some(selectedRecords, "active")',
          context,
        ),
      ).toBe(false);
    });

    it('should return false for someDefined() on empty selectedRecords', () => {
      const context = buildContext({ selectedRecords: [] });

      expect(
        evaluateConditionalAvailabilityExpression(
          'someDefined(selectedRecords, "name")',
          context,
        ),
      ).toBe(false);
    });

    it('should return false for includesSome() on empty selectedRecords', () => {
      const context = buildContext({ selectedRecords: [] });

      expect(
        evaluateConditionalAvailabilityExpression(
          'includesSome(selectedRecords, "statuses", "ACTIVE")',
          context,
        ),
      ).toBe(false);
    });
  });

  describe('isSelectAll bypasses selectedRecords array checks', () => {
    it('should return true for "isSelectAll or noneDefined(...)" when isSelectAll is true and selectedRecords is empty', () => {
      const context = buildContext({
        isSelectAll: true,
        selectedRecords: [],
      });

      expect(
        evaluateConditionalAvailabilityExpression(
          'isSelectAll or noneDefined(selectedRecords, "deletedAt")',
          context,
        ),
      ).toBe(true);
    });

    it('should return true for "isSelectAll or everyDefined(...)" when isSelectAll is true and selectedRecords is empty', () => {
      const context = buildContext({
        isSelectAll: true,
        selectedRecords: [],
      });

      expect(
        evaluateConditionalAvailabilityExpression(
          'isSelectAll or everyDefined(selectedRecords, "deletedAt")',
          context,
        ),
      ).toBe(true);
    });

    it('should evaluate the full deleteRecords expression to true in select-all mode', () => {
      const expression =
        'numberOfSelectedRecords >= 1 and not hasAnySoftDeleteFilterOnView and objectPermissions.canSoftDeleteObjectRecords and (isSelectAll or noneDefined(selectedRecords, "deletedAt"))';

      const context = buildContext({
        isSelectAll: true,
        selectedRecords: [],
        numberOfSelectedRecords: 50,
        hasAnySoftDeleteFilterOnView: false,
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
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should still respect noneDefined when isSelectAll is false and records are present', () => {
      const expression =
        'isSelectAll or noneDefined(selectedRecords, "deletedAt")';

      const contextWithDeletedRecord = buildContext({
        isSelectAll: false,
        selectedRecords: [
          { id: 'id-1', createdAt: '', updatedAt: '', deletedAt: '2024-01-01' },
        ],
      });

      expect(
        evaluateConditionalAvailabilityExpression(
          expression,
          contextWithDeletedRecord,
        ),
      ).toBe(false);
    });
  });

  describe('activateWorkflow expression regression', () => {
    const activateWorkflowExpression =
      'everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and (everyEquals(selectedRecords, "currentVersion.status", "DRAFT") or includesNone(selectedRecords, "statuses", "ACTIVE")) and noneDefined(selectedRecords, "deletedAt")';

    it('should not show Activate for an already-active workflow', () => {
      const context = buildContext({
        selectedRecords: [
          {
            id: 'wf-1',
            deletedAt: null,
            statuses: ['ACTIVE'],
            currentVersion: {
              status: 'ACTIVE',
              trigger: { type: 'MANUAL' },
              steps: [{ id: 'step-1' }],
            },
          },
        ],
      });

      expect(
        evaluateConditionalAvailabilityExpression(
          activateWorkflowExpression,
          context,
        ),
      ).toBe(false);
    });

    it('should show Activate for a draft workflow with no active version', () => {
      const context = buildContext({
        selectedRecords: [
          {
            id: 'wf-1',
            deletedAt: null,
            statuses: ['DRAFT'],
            currentVersion: {
              status: 'DRAFT',
              trigger: { type: 'MANUAL' },
              steps: [{ id: 'step-1' }],
            },
          },
        ],
      });

      expect(
        evaluateConditionalAvailabilityExpression(
          activateWorkflowExpression,
          context,
        ),
      ).toBe(true);
    });

    it('should show Activate for a draft version when another version is active', () => {
      const context = buildContext({
        selectedRecords: [
          {
            id: 'wf-1',
            deletedAt: null,
            statuses: ['ACTIVE', 'DRAFT'],
            currentVersion: {
              status: 'DRAFT',
              trigger: { type: 'MANUAL' },
              steps: [{ id: 'step-1' }],
            },
          },
        ],
      });

      expect(
        evaluateConditionalAvailabilityExpression(
          activateWorkflowExpression,
          context,
        ),
      ).toBe(true);
    });
  });
});
