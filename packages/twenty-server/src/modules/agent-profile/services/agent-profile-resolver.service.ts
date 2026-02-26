import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Injectable()
export class AgentProfileResolverService {
  private readonly logger = new Logger(AgentProfileResolverService.name);

  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  // Resolve the agent profile ID for a given workspace member
  async resolveAgentProfileId(
    workspaceId: string,
    workspaceMemberId: string,
  ): Promise<string | null> {
    const agentObjectMetadata = await this.objectMetadataRepository.findOne({
      where: {
        nameSingular: 'agent',
        workspaceId,
        isActive: true,
      },
    });

    if (!isDefined(agentObjectMetadata)) {
      this.logger.warn(
        `Agent object metadata not found in workspace ${workspaceId}`,
      );

      return null;
    }

    const workspaceMemberObjectMetadata =
      await this.objectMetadataRepository.findOne({
        where: {
          nameSingular: 'workspaceMember',
          workspaceId,
          isActive: true,
        },
      });

    if (!isDefined(workspaceMemberObjectMetadata)) {
      return null;
    }

    const workspaceMemberRelationField =
      await this.fieldMetadataRepository.findOne({
        where: {
          objectMetadataId: agentObjectMetadata.id,
          type: FieldMetadataType.RELATION,
          relationTargetObjectMetadataId: workspaceMemberObjectMetadata.id,
          workspaceId,
          isActive: true,
        },
      });

    if (!isDefined(workspaceMemberRelationField)) {
      this.logger.warn(
        `No workspace member relation field found on agent in workspace ${workspaceId}`,
      );

      return null;
    }

    const foreignKeyColumn = `${workspaceMemberRelationField.name}Id`;

    const agentRepo = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'agentProfile',
      { shouldBypassPermissionChecks: true },
    );

    const agent = await agentRepo.findOne({
      where: {
        [foreignKeyColumn]: workspaceMemberId,
      },
    });

    if (!isDefined(agent)) {
      this.logger.warn(
        `No agent profile found for workspace member ${workspaceMemberId}`,
      );

      return null;
    }

    return (agent as Record<string, unknown>).id as string;
  }
}
