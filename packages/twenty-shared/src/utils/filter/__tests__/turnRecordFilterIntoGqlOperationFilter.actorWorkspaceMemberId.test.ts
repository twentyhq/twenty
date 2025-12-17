import { FieldMetadataType } from '@/types/FieldMetadataType';
import type { PartialFieldMetadataItem } from '@/types/PartialFieldMetadataItem';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';

import { turnRecordFilterIntoRecordGqlOperationFilter } from '../turnRecordFilterIntoGqlOperationFilter';

describe('turnRecordFilterIntoRecordGqlOperationFilter - ACTOR workspaceMemberId subfield', () => {
  const createdByField: PartialFieldMetadataItem = {
    id: 'created-by-field-id',
    name: 'createdBy',
    label: 'Created by',
    type: FieldMetadataType.ACTOR,
  };

  const workspaceMemberId1 = '550e8400-e29b-41d4-a716-446655440001';
  const workspaceMemberId2 = '550e8400-e29b-41d4-a716-446655440002';
  const currentWorkspaceMemberId = '550e8400-e29b-41d4-a716-446655440000';

  describe('IS operand', () => {
    it('should generate filter for selected workspace member IDs', () => {
      const filterValue = JSON.stringify({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: [workspaceMemberId1, workspaceMemberId2],
      });

      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        recordFilter: {
          id: 'filter-id',
          fieldMetadataId: createdByField.id,
          value: filterValue,
          type: 'ACTOR',
          operand: ViewFilterOperand.IS,
          subFieldName: 'workspaceMemberId',
        },
        fieldMetadataItems: [createdByField],
        filterValueDependencies: { currentWorkspaceMemberId },
      });

      expect(result).toEqual({
        createdBy: {
          workspaceMemberId: {
            in: [workspaceMemberId1, workspaceMemberId2],
          },
        },
      });
    });

    it('should include current workspace member ID when "Me" is selected', () => {
      const filterValue = JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: [workspaceMemberId1],
      });

      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        recordFilter: {
          id: 'filter-id',
          fieldMetadataId: createdByField.id,
          value: filterValue,
          type: 'ACTOR',
          operand: ViewFilterOperand.IS,
          subFieldName: 'workspaceMemberId',
        },
        fieldMetadataItems: [createdByField],
        filterValueDependencies: { currentWorkspaceMemberId },
      });

      expect(result).toEqual({
        createdBy: {
          workspaceMemberId: {
            in: [workspaceMemberId1, currentWorkspaceMemberId],
          },
        },
      });
    });

    it('should include only current workspace member ID when only "Me" is selected', () => {
      const filterValue = JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: [],
      });

      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        recordFilter: {
          id: 'filter-id',
          fieldMetadataId: createdByField.id,
          value: filterValue,
          type: 'ACTOR',
          operand: ViewFilterOperand.IS,
          subFieldName: 'workspaceMemberId',
        },
        fieldMetadataItems: [createdByField],
        filterValueDependencies: { currentWorkspaceMemberId },
      });

      expect(result).toEqual({
        createdBy: {
          workspaceMemberId: {
            in: [currentWorkspaceMemberId],
          },
        },
      });
    });

    it('should return undefined when no members are selected', () => {
      const filterValue = JSON.stringify({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: [],
      });

      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        recordFilter: {
          id: 'filter-id',
          fieldMetadataId: createdByField.id,
          value: filterValue,
          type: 'ACTOR',
          operand: ViewFilterOperand.IS,
          subFieldName: 'workspaceMemberId',
        },
        fieldMetadataItems: [createdByField],
        filterValueDependencies: { currentWorkspaceMemberId },
      });

      expect(result).toBeUndefined();
    });
  });

  describe('IS_NOT operand', () => {
    it('should generate NOT filter for selected workspace member IDs', () => {
      const filterValue = JSON.stringify({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: [workspaceMemberId1],
      });

      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        recordFilter: {
          id: 'filter-id',
          fieldMetadataId: createdByField.id,
          value: filterValue,
          type: 'ACTOR',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'workspaceMemberId',
        },
        fieldMetadataItems: [createdByField],
        filterValueDependencies: { currentWorkspaceMemberId },
      });

      expect(result).toEqual({
        or: [
          {
            not: {
              createdBy: {
                workspaceMemberId: {
                  in: [workspaceMemberId1],
                },
              },
            },
          },
          {
            createdBy: {
              workspaceMemberId: {
                is: 'NULL',
              },
            },
          },
        ],
      });
    });

    it('should generate NOT filter including current workspace member when "Me" is selected', () => {
      const filterValue = JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: [],
      });

      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        recordFilter: {
          id: 'filter-id',
          fieldMetadataId: createdByField.id,
          value: filterValue,
          type: 'ACTOR',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'workspaceMemberId',
        },
        fieldMetadataItems: [createdByField],
        filterValueDependencies: { currentWorkspaceMemberId },
      });

      expect(result).toEqual({
        or: [
          {
            not: {
              createdBy: {
                workspaceMemberId: {
                  in: [currentWorkspaceMemberId],
                },
              },
            },
          },
          {
            createdBy: {
              workspaceMemberId: {
                is: 'NULL',
              },
            },
          },
        ],
      });
    });

    it('should return undefined when no members are selected for IS_NOT', () => {
      const filterValue = JSON.stringify({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: [],
      });

      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        recordFilter: {
          id: 'filter-id',
          fieldMetadataId: createdByField.id,
          value: filterValue,
          type: 'ACTOR',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'workspaceMemberId',
        },
        fieldMetadataItems: [createdByField],
        filterValueDependencies: { currentWorkspaceMemberId },
      });

      expect(result).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle missing currentWorkspaceMemberId in dependencies', () => {
      const filterValue = JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: [workspaceMemberId1],
      });

      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        recordFilter: {
          id: 'filter-id',
          fieldMetadataId: createdByField.id,
          value: filterValue,
          type: 'ACTOR',
          operand: ViewFilterOperand.IS,
          subFieldName: 'workspaceMemberId',
        },
        fieldMetadataItems: [createdByField],
        filterValueDependencies: {},
      });

      // Should only include the explicitly selected member, not undefined
      expect(result).toEqual({
        createdBy: {
          workspaceMemberId: {
            in: [workspaceMemberId1],
          },
        },
      });
    });

    it('should handle legacy array format for filter value', () => {
      // Legacy format: just an array of UUIDs
      const filterValue = JSON.stringify([workspaceMemberId1, workspaceMemberId2]);

      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        recordFilter: {
          id: 'filter-id',
          fieldMetadataId: createdByField.id,
          value: filterValue,
          type: 'ACTOR',
          operand: ViewFilterOperand.IS,
          subFieldName: 'workspaceMemberId',
        },
        fieldMetadataItems: [createdByField],
        filterValueDependencies: { currentWorkspaceMemberId },
      });

      expect(result).toEqual({
        createdBy: {
          workspaceMemberId: {
            in: [workspaceMemberId1, workspaceMemberId2],
          },
        },
      });
    });
  });
});

