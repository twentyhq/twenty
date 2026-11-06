import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  type ObjectRecord,
  type ObjectRecordsOperationType,
  type RecordShareAccessLevel,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  RecordAccessDecisionService,
  type RecordOperationQuestion,
} from 'src/engine/permissions/internal/combine/services/record-access-decision.service';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type RecordPermissionsDTO } from 'src/engine/permissions/record-permissions/dtos/record-permissions.dto';

type ObjectQuestion = {
  principals: PermissionsPrincipalsWithRolesContext | undefined;
  objectMetadataId: string;
};

type RecordsQuestion = ObjectQuestion & {
  recordIds: string[];
  hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
  transactionScope?: RecordPermissionTransactionScope;
};

type FieldsQuestion = Omit<ObjectQuestion, 'principals'> & {
  principals: PermissionsPrincipalsWithRolesContext;
};

@Injectable()
export class RecordPermissionsService {
  constructor(
    private readonly recordAccessDecisionService: RecordAccessDecisionService,
  ) {}

  async findRecordsPermissions({
    authContext,
    objectNameSingular,
    recordIds,
  }: {
    authContext: WorkspaceAuthContext;
    objectNameSingular: string;
    recordIds: string[];
  }): Promise<Map<string, RecordPermissionsDTO>> {
    const allowedRecordIds =
      await this.recordAccessDecisionService.findGrantedRecordIdsByOperationType(
        {
          authContext,
          objectNameSingular,
          recordIds,
          operationTypes: ['select', 'update', 'delete', 'soft-delete'],
        },
      );
    const isGranted = (
      recordId: string,
      operationType: ObjectRecordsOperationType,
    ) => allowedRecordIds.get(operationType)?.has(recordId) ?? false;
    const isAllowed = (
      recordId: string,
      operationType: ObjectRecordsOperationType,
    ) => isGranted(recordId, 'select') && isGranted(recordId, operationType);

    return new Map(
      recordIds.map((recordId) => [
        recordId,
        {
          canRead: isGranted(recordId, 'select'),
          canUpdate: isAllowed(recordId, 'update'),
          canDelete: isAllowed(recordId, 'delete'),
          canSoftDelete: isAllowed(recordId, 'soft-delete'),
        },
      ]),
    );
  }

  public findRestrictedFields({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<RestrictedFieldsPermissions> {
    return this.recordAccessDecisionService.findRestrictedFields({
      principals,
      objectMetadataId,
    });
  }

  public findRecordReadRestrictions({
    principals,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
  }): Promise<RecordReadRestrictions> {
    return this.recordAccessDecisionService.findRecordReadRestrictions(
      principals,
    );
  }

  public isOperationDisabled(
    question: RecordOperationQuestion,
  ): Promise<boolean> {
    return this.recordAccessDecisionService.isOperationDisabled(question);
  }

  public assertObjectOperationAccessibleOrThrow(
    question: RecordOperationQuestion,
  ): Promise<void> {
    return this.recordAccessDecisionService.assertObjectOperationAccessibleOrThrow(
      question,
    );
  }

  public assertColumnsReadableAndUpdatableOrThrow(
    question: RecordOperationQuestion & {
      selectedColumns: string[];
      updatedColumns: string[];
    },
  ): Promise<void> {
    return this.recordAccessDecisionService.assertColumnsReadableAndUpdatableOrThrow(
      question,
    );
  }

  public buildRecordsAccessCondition(
    question: RecordOperationQuestion & { tableAlias: string },
  ): Promise<SqlCondition | boolean> {
    return this.recordAccessDecisionService.buildRecordsAccessCondition(
      question,
    );
  }

  public assertCreatedRecordsMatchRowLevelPermissionsOrThrow(question: {
    principals: PermissionsPrincipalsWithRolesContext;
    flatObjectMetadata: FlatObjectMetadata;
    records: ObjectRecord[];
  }): Promise<void> {
    return this.recordAccessDecisionService.assertCreatedRecordsMatchRowLevelPermissionsOrThrow(
      question,
    );
  }

  public assertUpdatesKeepRecordAccessOrThrow(question: {
    principals: PermissionsPrincipalsWithRolesContext;
    flatObjectMetadata: FlatObjectMetadata;
    updates: {
      rawRecordBefore: ObjectRecord;
      setColumns: Record<string, unknown>;
    }[];
    formatRecords: (rawRecords: ObjectRecord[]) => ObjectRecord[];
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    return this.recordAccessDecisionService.assertUpdatesKeepRecordAccessOrThrow(
      question,
    );
  }

  public canReadSomeRecords({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<boolean> {
    return this.recordAccessDecisionService.hasAccessToSomeRecords({
      principals,
      objectMetadataId,
      operationType: 'select',
    });
  }

  public canCreateSomeRecords({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<boolean> {
    return this.recordAccessDecisionService.hasAccessToSomeRecords({
      principals,
      objectMetadataId,
      operationType: 'insert',
    });
  }

  public canUpdateSomeRecords({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<boolean> {
    return this.recordAccessDecisionService.hasAccessToSomeRecords({
      principals,
      objectMetadataId,
      operationType: 'update',
    });
  }

  public canSoftDeleteSomeRecords({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<boolean> {
    return this.recordAccessDecisionService.hasAccessToSomeRecords({
      principals,
      objectMetadataId,
      operationType: 'soft-delete',
    });
  }

  public canDestroySomeRecords({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<boolean> {
    return this.recordAccessDecisionService.hasAccessToSomeRecords({
      principals,
      objectMetadataId,
      operationType: 'delete',
    });
  }

  public canReadRecords(question: RecordsQuestion): Promise<boolean> {
    return this.coversEveryRecord({ question, operationType: 'select' });
  }

  public canUpdateRecords(question: RecordsQuestion): Promise<boolean> {
    return this.coversEveryRecord({ question, operationType: 'update' });
  }

  public findGrantedRecordIdsForOperation({
    operationType,
    ...question
  }: RecordsQuestion & {
    operationType: ObjectRecordsOperationType;
  }): Promise<Set<string>> {
    return this.recordAccessDecisionService.findGrantedRecordIdsOnReadableObject(
      { ...question, operationType },
    );
  }

  public findUnreadableFieldMetadataIdsOrThrow({
    principals,
    objectMetadataId,
  }: FieldsQuestion): Promise<Set<string>> {
    return this.recordAccessDecisionService.findDeniedFieldMetadataIdsOrThrow({
      principals,
      objectMetadataId,
      fieldPermission: 'canRead',
    });
  }

  public findNonUpdatableFieldMetadataIdsOrThrow({
    principals,
    objectMetadataId,
  }: FieldsQuestion): Promise<Set<string>> {
    return this.recordAccessDecisionService.findDeniedFieldMetadataIdsOrThrow({
      principals,
      objectMetadataId,
      fieldPermission: 'canUpdate',
    });
  }

  public findReadableEventRecordIds(question: {
    authContext: PermissionsAuthContext;
    eventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  }): Promise<Set<string>> {
    return this.recordAccessDecisionService.findReadableEventRecordIds(
      question,
    );
  }

  public findReadableEvents<TEvent extends ObjectRecordEvent>(question: {
    authContext: PermissionsAuthContext;
    eventBatch: WorkspaceEventBatch<TEvent>;
    events?: TEvent[];
  }): Promise<TEvent[]> {
    return this.recordAccessDecisionService.findReadableEvents(question);
  }

  public canRoleReadSomeRecords({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<boolean> {
    return this.recordAccessDecisionService.canRoleReachSomeRecords({
      principals,
      objectMetadataId,
      operationType: 'select',
    });
  }

  public findRoleIdsUnableToReadObject(question: {
    workspaceId: string;
    roleIds: string[];
    objectMetadataId: string;
  }): Promise<Set<string>> {
    return this.recordAccessDecisionService.findRoleIdsUnableToReachObject({
      ...question,
      operationType: 'select',
    });
  }

  public canRoleCreateSomeRecords({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<boolean> {
    return this.recordAccessDecisionService.canRoleReachSomeRecords({
      principals,
      objectMetadataId,
      operationType: 'insert',
    });
  }

  public canRoleUpdateSomeRecords({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<boolean> {
    return this.recordAccessDecisionService.canRoleReachSomeRecords({
      principals,
      objectMetadataId,
      operationType: 'update',
    });
  }

  private async coversEveryRecord({
    question,
    operationType,
  }: {
    question: RecordsQuestion;
    operationType: ObjectRecordsOperationType;
  }): Promise<boolean> {
    const grantedRecordIds = await this.findGrantedRecordIds({
      question,
      operationType,
    });

    return (
      question.recordIds.length > 0 &&
      question.recordIds.every((recordId) =>
        grantedRecordIds.has(recordId.toLowerCase()),
      )
    );
  }

  private findGrantedRecordIds({
    question: {
      principals,
      objectMetadataId,
      recordIds,
      hypotheticalRecordShareAccessLevel,
      transactionScope,
    },
    operationType,
  }: {
    question: RecordsQuestion;
    operationType: ObjectRecordsOperationType;
  }): Promise<Set<string>> {
    return this.recordAccessDecisionService.findGrantedRecordIds({
      principals,
      objectMetadataId,
      operationType,
      recordIds,
      hypotheticalRecordShareAccessLevel,
      transactionScope,
    });
  }
}
