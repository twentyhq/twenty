import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { BlocklistScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import {
  type CreateManyResolverArgs,
  type UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { isDomain } from 'src/engine/utils/is-domain';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { type BlocklistItem } from 'src/modules/blocklist/types/blocklist-item.type';
import { type BlocklistMutationContext } from 'src/modules/blocklist/types/blocklist-mutation-context.type';

type BlocklistCreateEntry = {
  item: Partial<BlocklistItem>;
  existingRecord: BlocklistWorkspaceEntity | null;
};

const resolveUniquenessOwner = ({
  existingRecord,
  context,
}: {
  existingRecord: Pick<BlocklistWorkspaceEntity, 'workspaceMemberId'> | null;
  context: BlocklistMutationContext;
}): string => existingRecord?.workspaceMemberId ?? context.workspaceMemberId;

const emailOrDomainSchema = z
  .string()
  .trim()
  .pipe(z.email({ error: 'Invalid email or domain' }))
  .or(
    z
      .string()
      .refine(
        (value) => value.startsWith('@') && isDomain(value.slice(1)),
        'Invalid email or domain',
      ),
  );

@Injectable()
export class BlocklistValidationService {
  constructor(
    private readonly blocklistRepository: BlocklistRepository,
    private readonly permissionsService: PermissionsService,
  ) {}

  public async validateBlocklistForCreateMany({
    payload,
    context,
  }: {
    payload: CreateManyResolverArgs<Partial<BlocklistItem>>;
    context: BlocklistMutationContext;
  }): Promise<void> {
    this.validateHandleFormat(payload.data);

    const entries: BlocklistCreateEntry[] = [];

    for (const item of payload.data) {
      const existingRecord = isDefined(item.id)
        ? await this.blocklistRepository.getById({
            id: item.id,
            workspaceId: context.workspaceId,
          })
        : null;

      if (isDefined(existingRecord)) {
        await this.assertCanManageExistingRecord({ existingRecord, context });
        this.assertScopeAndOwnerAreUnchanged({ data: item, existingRecord });
      } else {
        await this.assertCallerCanCreateEntry({ item, context });
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

    await this.assertCanManageExistingRecord({ existingRecord, context });
    this.assertScopeAndOwnerAreUnchanged({
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
      workspaceMemberId: resolveUniquenessOwner({ existingRecord, context }),
      context,
    });

    this.assertHandlesAreNew({
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

    await this.assertCanManageExistingRecord({ existingRecord, context });
  }

  public async validateBlocklistForRestoreOne({
    id,
    context,
  }: {
    id: string;
    context: BlocklistMutationContext;
  }): Promise<void> {
    const existingRecord = await this.getExistingRecordOrThrow({ id, context });

    await this.assertCanManageExistingRecord({ existingRecord, context });

    if (!isDefined(existingRecord.handle)) {
      return;
    }

    const liveHandles = await this.getExistingHandlesForOwner({
      scope: existingRecord.scope,
      workspaceMemberId: resolveUniquenessOwner({ existingRecord, context }),
      context,
    });

    this.assertHandlesAreNew({
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

      const result = emailOrDomainSchema.safeParse(handle);

      if (!result.success) {
        throw new CommonQueryRunnerException(
          result.error.issues[0].message,
          CommonQueryRunnerExceptionCode.BAD_REQUEST,
          { userFriendlyMessage: msg`Invalid email or domain.` },
        );
      }
    }
  }

  private async assertCallerCanCreateEntry({
    item,
    context,
  }: {
    item: Partial<Pick<BlocklistItem, 'scope' | 'workspaceMemberId'>>;
    context: BlocklistMutationContext;
  }): Promise<void> {
    if (
      (item.scope ?? BlocklistScope.WORKSPACE_MEMBER) ===
      BlocklistScope.WORKSPACE
    ) {
      if (isDefined(item.workspaceMemberId)) {
        throw new CommonQueryRunnerException(
          'A workspace-scoped blocklist entry cannot target a workspace member',
          CommonQueryRunnerExceptionCode.BAD_REQUEST,
          {
            userFriendlyMessage: msg`A workspace-wide blocklist entry cannot target a workspace member.`,
          },
        );
      }

      await this.assertHasWorkspaceBlocklistPermission(context);

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

  private async assertCanManageExistingRecord({
    existingRecord,
    context,
  }: {
    existingRecord: BlocklistWorkspaceEntity;
    context: BlocklistMutationContext;
  }): Promise<void> {
    if (
      existingRecord.scope === BlocklistScope.WORKSPACE_MEMBER &&
      existingRecord.workspaceMemberId === context.workspaceMemberId
    ) {
      return;
    }

    await this.assertHasWorkspaceBlocklistPermission(context);
  }

  private async assertHasWorkspaceBlocklistPermission(
    context: BlocklistMutationContext,
  ): Promise<void> {
    const hasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId: context.userWorkspaceId,
        setting: PermissionFlagType.WORKSPACE,
        workspaceId: context.workspaceId,
      });

    if (!hasPermission) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`You do not have permission to manage the workspace blocklist.`,
        },
      );
    }
  }

  private assertScopeAndOwnerAreUnchanged({
    data,
    existingRecord,
  }: {
    data: Partial<BlocklistItem>;
    existingRecord: BlocklistWorkspaceEntity;
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
    const groups = new Map<
      string,
      {
        scope: BlocklistScope;
        workspaceMemberId: string;
        handles: string[];
        retainedHandles: string[];
      }
    >();

    for (const { item, existingRecord } of entries) {
      if (!isDefined(item.handle)) {
        continue;
      }

      if (existingRecord?.handle === item.handle) {
        continue;
      }

      const scope =
        existingRecord?.scope ?? item.scope ?? BlocklistScope.WORKSPACE_MEMBER;
      const workspaceMemberId = resolveUniquenessOwner({
        existingRecord,
        context,
      });

      const groupKey = `${scope}:${workspaceMemberId}`;
      const group = groups.get(groupKey) ?? {
        scope,
        workspaceMemberId,
        handles: [],
        retainedHandles: [],
      };

      group.handles.push(item.handle);

      if (isDefined(existingRecord?.handle)) {
        group.retainedHandles.push(existingRecord.handle);
      }

      groups.set(groupKey, group);
    }

    for (const {
      scope,
      workspaceMemberId,
      handles,
      retainedHandles,
    } of groups.values()) {
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

      this.assertHandlesAreNew({
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

  private assertHandlesAreNew({
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
