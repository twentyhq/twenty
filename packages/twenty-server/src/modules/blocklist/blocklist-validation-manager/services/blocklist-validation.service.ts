import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { BlocklistScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type CreateManyResolverArgs,
  type UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { BlocklistAccessService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-access.service';
import { groupBlocklistEntriesForUniqueness } from 'src/modules/blocklist/utils/group-blocklist-entries-for-uniqueness.util';
import { BLOCKLIST_HANDLE_SCHEMA } from 'src/modules/blocklist/constants/blocklist-handle-schema.constant';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { type BlocklistItem } from 'src/modules/blocklist/types/blocklist-item.type';
import { type BlocklistMutationContext } from 'src/modules/blocklist/types/blocklist-mutation-context.type';

type BlocklistCreateEntry = {
  item: Partial<BlocklistItem>;
  existingRecord: BlocklistWorkspaceEntity | null;
};

@Injectable()
export class BlocklistValidationService {
  constructor(
    private readonly blocklistRepository: BlocklistRepository,
    private readonly blocklistAccessService: BlocklistAccessService,
  ) {}

  public async validateBlocklistForCreateMany({
    payload,
    context,
  }: {
    payload: CreateManyResolverArgs<Partial<BlocklistItem>>;
    context: BlocklistMutationContext;
  }): Promise<void> {
    this.validateHandleFormat(payload.data);

    const existingRecords = await this.blocklistRepository.getByIds({
      ids: payload.data.map((item) => item.id).filter(isDefined),
      workspaceId: context.workspaceId,
    });
    const existingRecordById = new Map(
      existingRecords.map((record) => [record.id, record]),
    );

    const entries: BlocklistCreateEntry[] = [];

    for (const item of payload.data) {
      const existingRecord = isDefined(item.id)
        ? (existingRecordById.get(item.id) ?? null)
        : null;

      if (isDefined(existingRecord)) {
        await this.blocklistAccessService.assertCanModifyBlocklistEntryOrThrow({
          entry: existingRecord,
          context,
        });
        this.validateScopeAndOwnerAreUnchanged({
          data: item,
          existingRecord,
        });
      } else {
        this.validateScopeTarget({ item, context });
        await this.blocklistAccessService.assertCanCreateBlocklistEntryOrThrow({
          item,
          context,
        });
      }

      entries.push({ item, existingRecord });
    }

    await this.validateUniquenessForCreateMany({ entries, context });
  }

  public async validateBlocklistForUpdateOne({
    payload,
    context,
  }: {
    payload: UpdateOneResolverArgs<Partial<BlocklistItem>>;
    context: BlocklistMutationContext;
  }): Promise<void> {
    const existingRecord = await this.getExistingRecordOrThrow({
      id: payload.id,
      context,
    });

    await this.blocklistAccessService.assertCanModifyBlocklistEntryOrThrow({
      entry: existingRecord,
      context,
    });
    this.validateScopeAndOwnerAreUnchanged({
      data: payload.data,
      existingRecord,
    });

    if (!isDefined(payload.data.handle)) {
      return;
    }

    this.validateHandleFormat([payload.data]);

    if (payload.data.handle === existingRecord.handle) {
      return;
    }

    const siblingHandles = await this.getExistingHandlesForOwner({
      scope: existingRecord.scope,
      workspaceMemberId:
        existingRecord.workspaceMemberId ?? context.workspaceMemberId,
      context,
    });

    this.validateHandlesAreNew({
      handles: [payload.data.handle],
      existingHandles: siblingHandles.filter(
        (handle) => handle !== existingRecord.handle,
      ),
    });
  }

  public async validateBlocklistRecordIsManageable({
    id,
    context,
  }: {
    id: string;
    context: BlocklistMutationContext;
  }): Promise<void> {
    const existingRecord = await this.getExistingRecordOrThrow({ id, context });

    await this.blocklistAccessService.assertCanModifyBlocklistEntryOrThrow({
      entry: existingRecord,
      context,
    });
  }

  public async validateBlocklistForRestoreOne({
    id,
    context,
  }: {
    id: string;
    context: BlocklistMutationContext;
  }): Promise<void> {
    const existingRecord = await this.getExistingRecordOrThrow({ id, context });

    await this.blocklistAccessService.assertCanModifyBlocklistEntryOrThrow({
      entry: existingRecord,
      context,
    });

    if (!isDefined(existingRecord.handle)) {
      return;
    }

    const liveHandles = await this.getExistingHandlesForOwner({
      scope: existingRecord.scope,
      workspaceMemberId:
        existingRecord.workspaceMemberId ?? context.workspaceMemberId,
      context,
    });

    this.validateHandlesAreNew({
      handles: [existingRecord.handle],
      existingHandles: liveHandles,
    });
  }

  private validateHandleFormat(blocklist: Partial<BlocklistItem>[]): void {
    for (const { handle } of blocklist) {
      if (!isDefined(handle)) {
        throw new CommonQueryRunnerException(
          'Blocklist handle is required',
          CommonQueryRunnerExceptionCode.BAD_REQUEST,
          { userFriendlyMessage: msg`Blocklist handle is required.` },
        );
      }

      const result = BLOCKLIST_HANDLE_SCHEMA.safeParse(handle);

      if (!result.success) {
        throw new CommonQueryRunnerException(
          result.error.issues[0].message,
          CommonQueryRunnerExceptionCode.BAD_REQUEST,
          { userFriendlyMessage: msg`Invalid email or domain.` },
        );
      }
    }
  }

  private validateScopeTarget({
    item,
    context,
  }: {
    item: Partial<Pick<BlocklistItem, 'scope' | 'workspaceMemberId'>>;
    context: BlocklistMutationContext;
  }): void {
    const scope = item.scope ?? BlocklistScope.WORKSPACE_MEMBER;

    if (scope === BlocklistScope.WORKSPACE) {
      if (isDefined(item.workspaceMemberId)) {
        throw new CommonQueryRunnerException(
          'A workspace-scoped blocklist entry cannot target a workspace member',
          CommonQueryRunnerExceptionCode.BAD_REQUEST,
          {
            userFriendlyMessage: msg`A workspace-wide blocklist entry cannot target a workspace member.`,
          },
        );
      }

      return;
    }

    if (item.workspaceMemberId !== context.workspaceMemberId) {
      throw new CommonQueryRunnerException(
        'A workspace-member-scoped blocklist entry must target its own workspace member',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`Cannot manage a blocklist entry of another workspace member.`,
        },
      );
    }
  }

  private validateScopeAndOwnerAreUnchanged({
    data,
    existingRecord,
  }: {
    data: Partial<BlocklistItem>;
    existingRecord: Pick<
      BlocklistWorkspaceEntity,
      'scope' | 'workspaceMemberId'
    >;
  }): void {
    if ('scope' in data && data.scope !== existingRecord.scope) {
      throw new CommonQueryRunnerException(
        'Blocklist scope cannot be updated',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        { userFriendlyMessage: msg`Blocklist scope cannot be updated.` },
      );
    }

    if (
      'workspaceMemberId' in data &&
      data.workspaceMemberId !== existingRecord.workspaceMemberId
    ) {
      throw new CommonQueryRunnerException(
        'Workspace member cannot be updated',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        { userFriendlyMessage: msg`Workspace member cannot be updated.` },
      );
    }
  }

  private async validateUniquenessForCreateMany({
    entries,
    context,
  }: {
    entries: BlocklistCreateEntry[];
    context: BlocklistMutationContext;
  }): Promise<void> {
    const groups = groupBlocklistEntriesForUniqueness({ entries, context });

    for (const {
      scope,
      workspaceMemberId,
      handles,
      retainedHandles,
    } of groups) {
      if (new Set(handles).size !== handles.length) {
        throw new CommonQueryRunnerException(
          'Blocklist handle is duplicated in the payload',
          CommonQueryRunnerExceptionCode.BAD_REQUEST,
          { userFriendlyMessage: msg`Blocklist handle already exists.` },
        );
      }

      const existingHandles = await this.getExistingHandlesForOwner({
        scope,
        workspaceMemberId,
        context,
      });

      this.validateHandlesAreNew({
        handles,
        existingHandles: existingHandles.filter(
          (handle) => !retainedHandles.includes(handle),
        ),
      });
    }
  }

  private async getExistingHandlesForOwner({
    scope,
    workspaceMemberId,
    context,
  }: {
    scope: BlocklistScope;
    workspaceMemberId: string;
    context: BlocklistMutationContext;
  }): Promise<string[]> {
    if (scope === BlocklistScope.WORKSPACE) {
      const workspaceBlocklist =
        await this.blocklistRepository.getWorkspaceScopedEntries(
          context.workspaceId,
        );

      return workspaceBlocklist
        .map((blocklistItem) => blocklistItem.handle)
        .filter(isDefined);
    }

    const memberBlocklist =
      await this.blocklistRepository.getMemberScopedEntries({
        workspaceMemberId,
        workspaceId: context.workspaceId,
      });

    return memberBlocklist
      .map((blocklistItem) => blocklistItem.handle)
      .filter(isDefined);
  }

  private validateHandlesAreNew({
    handles,
    existingHandles,
  }: {
    handles: string[];
    existingHandles: string[];
  }): void {
    if (handles.some((handle) => existingHandles.includes(handle))) {
      throw new CommonQueryRunnerException(
        'Blocklist handle already exists',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        { userFriendlyMessage: msg`Blocklist handle already exists.` },
      );
    }
  }

  private async getExistingRecordOrThrow({
    id,
    context,
  }: {
    id: string;
    context: BlocklistMutationContext;
  }): Promise<BlocklistWorkspaceEntity> {
    const existingRecord = await this.blocklistRepository.getById({
      id,
      workspaceId: context.workspaceId,
    });

    if (!isDefined(existingRecord)) {
      throw new CommonQueryRunnerException(
        'Blocklist item not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        { userFriendlyMessage: msg`Blocklist item not found.` },
      );
    }

    return existingRecord;
  }
}
