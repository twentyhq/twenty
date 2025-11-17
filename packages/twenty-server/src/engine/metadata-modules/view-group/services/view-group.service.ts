import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
  ViewGroupExceptionMessageKey,
  generateViewGroupExceptionMessage,
  generateViewGroupUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION } from 'src/engine/metadata-modules/view/constants/find-all-core-views-graphql-operation.constant';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class ViewGroupService {
  constructor(
    @InjectRepository(ViewGroupEntity)
    private readonly viewGroupRepository: Repository<ViewGroupEntity>,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewGroupEntity[]> {
    return this.viewGroupRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: ['workspace', 'view'],
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewGroupEntity[]> {
    return this.viewGroupRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: ['workspace', 'view'],
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ViewGroupEntity | null> {
    const viewGroup = await this.viewGroupRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });

    return viewGroup || null;
  }

  async create(
    viewGroupData: Partial<ViewGroupEntity>,
  ): Promise<ViewGroupEntity> {
    if (!isDefined(viewGroupData.workspaceId)) {
      throw new ViewGroupException(
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
        {
          userFriendlyMessage: generateViewGroupUserFriendlyExceptionMessage(
            ViewGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewGroupData.viewId)) {
      throw new ViewGroupException(
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_ID_REQUIRED,
        ),
        ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
        {
          userFriendlyMessage: generateViewGroupUserFriendlyExceptionMessage(
            ViewGroupExceptionMessageKey.VIEW_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewGroupData.fieldMetadataId)) {
      throw new ViewGroupException(
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
        ),
        ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
        {
          userFriendlyMessage: generateViewGroupUserFriendlyExceptionMessage(
            ViewGroupExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
          ),
        },
      );
    }

    const viewGroup = this.viewGroupRepository.create(viewGroupData);

    await this.flushGraphQLCache(viewGroupData.workspaceId);

    const savedViewGroup = await this.viewGroupRepository.save(viewGroup);

    await this.flushGraphQLCache(viewGroupData.workspaceId);

    return savedViewGroup;
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewGroupEntity>,
  ): Promise<ViewGroupEntity> {
    const existingViewGroup = await this.findById(id, workspaceId);

    if (!isDefined(existingViewGroup)) {
      throw new ViewGroupException(
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          id,
        ),
        ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
      );
    }

    const updatedViewGroup = await this.viewGroupRepository.save({
      id,
      ...updateData,
    });

    await this.flushGraphQLCache(workspaceId);

    return { ...existingViewGroup, ...updatedViewGroup };
  }

  async delete(id: string, workspaceId: string): Promise<ViewGroupEntity> {
    const viewGroup = await this.findById(id, workspaceId);

    if (!isDefined(viewGroup)) {
      throw new ViewGroupException(
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          id,
        ),
        ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
      );
    }

    await this.viewGroupRepository.softDelete(id);

    await this.flushGraphQLCache(workspaceId);

    return viewGroup;
  }

  async destroy(id: string, workspaceId: string): Promise<ViewGroupEntity> {
    const viewGroup = await this.viewGroupRepository.findOne({
      where: {
        id,
        workspaceId,
      },
      relations: ['workspace', 'view'],
      withDeleted: true,
    });

    if (!isDefined(viewGroup)) {
      throw new ViewGroupException(
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          id,
        ),
        ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
      );
    }

    await this.viewGroupRepository.delete(id);

    await this.flushGraphQLCache(workspaceId);

    return viewGroup;
  }

  private async flushGraphQLCache(workspaceId: string): Promise<void> {
    await this.workspaceCacheStorageService.flushGraphQLOperation({
      operationName: FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION,
      workspaceId,
    });
  }
}
