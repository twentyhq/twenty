import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { In, Repository } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import {
  ConnectedAccountException,
  ConnectedAccountExceptionCode,
} from 'src/engine/metadata-modules/connected-account/connected-account.exception';
import { ConnectedAccountDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account.dto';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

@Injectable()
export class ConnectedAccountMetadataService {
  private readonly logger = new Logger(ConnectedAccountMetadataService.name);

  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly repository: Repository<ConnectedAccountEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async findAll(workspaceId: string): Promise<ConnectedAccountDTO[]> {
    return this.repository.find({ where: { workspaceId } });
  }

  async findByUserWorkspaceId({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<ConnectedAccountDTO[]> {
    return this.repository.find({
      where: { userWorkspaceId, workspaceId },
    });
  }

  async findById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<ConnectedAccountDTO | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
  }

  async findByIds({
    ids,
    workspaceId,
  }: {
    ids: string[];
    workspaceId: string;
  }): Promise<ConnectedAccountDTO[]> {
    return this.repository.find({
      where: { id: In(ids), workspaceId },
    });
  }

  async verifyOwnership({
    id,
    userWorkspaceId,
    workspaceId,
  }: {
    id: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<ConnectedAccountEntity> {
    const connectedAccount = await this.repository.findOne({
      where: { id, workspaceId },
    });

    if (!connectedAccount) {
      throw new ConnectedAccountException(
        `Connected account ${id} not found`,
        ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
      );
    }

    if (connectedAccount.userWorkspaceId !== userWorkspaceId) {
      throw new ConnectedAccountException(
        `Connected account ${id} does not belong to user workspace ${userWorkspaceId}`,
        ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_OWNERSHIP_VIOLATION,
      );
    }

    return connectedAccount;
  }

  async getUserConnectedAccountIds({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<string[]> {
    const accounts = await this.repository.find({
      where: { userWorkspaceId, workspaceId },
      select: ['id'],
    });

    return accounts.map((account) => account.id);
  }

  async create(
    data: Partial<ConnectedAccountEntity> & {
      workspaceId: string;
      handle: string;
      provider: string;
      userWorkspaceId: string;
    },
  ): Promise<ConnectedAccountDTO> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async update({
    id,
    workspaceId,
    data,
  }: {
    id: string;
    workspaceId: string;
    data: Partial<ConnectedAccountEntity>;
  }): Promise<ConnectedAccountDTO> {
    await this.repository.update(
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<ConnectedAccountDTO> {
    const connectedAccount = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    const authContext = buildSystemAuthContext(workspaceId);

    const [messageChannels, calendarChannels] = await Promise.all([
      this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.messageChannelRepository.find({
            where: { connectedAccountId: id, workspaceId },
          }),
        authContext,
      ),
      this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.calendarChannelRepository.find({
            where: { connectedAccountId: id, workspaceId },
          }),
        authContext,
      ),
    ]);

    this.logger.log(
      `WorkspaceId: ${workspaceId} Deleting connected account ${id} with ${messageChannels.length} message channel(s) and ${calendarChannels.length} calendar channel(s)`,
    );

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.repository.delete({
        id,
        workspaceId,
      });
    }, authContext);

    const { flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    if (messageChannels.length > 0) {
      const flatMessageChannelMetadata =
        findFlatEntityByUniversalIdentifierOrThrow({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier:
            STANDARD_OBJECTS.messageChannel.universalIdentifier,
        });

      this.workspaceEventEmitter.emitDatabaseBatchEvent({
        objectMetadataNameSingular: 'messageChannel',
        action: DatabaseEventAction.DESTROYED,
        objectMetadata: flatMessageChannelMetadata,
        events: messageChannels.map((messageChannel) => ({
          recordId: messageChannel.id,
          properties: {
            before: messageChannel,
          },
        })),
        workspaceId,
      });
    }

    if (calendarChannels.length > 0) {
      const flatCalendarChannelMetadata =
        findFlatEntityByUniversalIdentifierOrThrow({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier:
            STANDARD_OBJECTS.calendarChannel.universalIdentifier,
        });

      this.workspaceEventEmitter.emitDatabaseBatchEvent({
        objectMetadataNameSingular: 'calendarChannel',
        action: DatabaseEventAction.DESTROYED,
        objectMetadata: flatCalendarChannelMetadata,
        events: calendarChannels.map((calendarChannel) => ({
          recordId: calendarChannel.id,
          properties: {
            before: calendarChannel,
          },
        })),
        workspaceId,
      });
    }

    return connectedAccount;
  }
}
