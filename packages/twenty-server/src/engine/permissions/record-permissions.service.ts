import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  type ObjectRecordsOperationType,
  type RecordShareAccessLevel,
} from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordAccessDecisionService } from 'src/engine/permissions/combine/services/record-access-decision.service';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/record-permission-orm/types/record-permission-transaction-scope.type';
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

  public isUpdatePermittedByRole({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<boolean> {
    return this.recordAccessDecisionService.isOperationPermittedByRole({
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
