import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import {
  ViewSortException,
  ViewSortExceptionCode,
  ViewSortExceptionMessageKey,
  generateViewSortExceptionMessage,
  generateViewSortUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION } from 'src/engine/metadata-modules/view/constants/find-all-core-views-graphql-operation.constant';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class ViewSortService {
  constructor(
    @InjectRepository(ViewSortEntity)
    private readonly viewSortRepository: Repository<ViewSortEntity>,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewSortEntity[]> {
    return this.viewSortRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewSortEntity[]> {
    return this.viewSortRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ViewSortEntity | null> {
    const viewSort = await this.viewSortRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });

    return viewSort || null;
  }

  async create(viewSortData: Partial<ViewSortEntity>): Promise<ViewSortEntity> {
    if (!isDefined(viewSortData.workspaceId)) {
      throw new ViewSortException(
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        {
          userFriendlyMessage: generateViewSortUserFriendlyExceptionMessage(
            ViewSortExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewSortData.viewId)) {
      throw new ViewSortException(
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_ID_REQUIRED,
        ),
        ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        {
          userFriendlyMessage: generateViewSortUserFriendlyExceptionMessage(
            ViewSortExceptionMessageKey.VIEW_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewSortData.fieldMetadataId)) {
      throw new ViewSortException(
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
        ),
        ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        {
          userFriendlyMessage: generateViewSortUserFriendlyExceptionMessage(
            ViewSortExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
          ),
        },
      );
    }

    const viewSort = this.viewSortRepository.create(viewSortData);

    const savedViewSort = await this.viewSortRepository.save(viewSort);

    await this.flushGraphQLCache(viewSortData.workspaceId);

    return savedViewSort;
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewSortEntity>,
  ): Promise<ViewSortEntity> {
    const existingViewSort = await this.findById(id, workspaceId);

    if (!isDefined(existingViewSort)) {
      throw new ViewSortException(
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          id,
        ),
        ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
      );
    }

    const updatedViewSort = await this.viewSortRepository.save({
      id,
      ...updateData,
    });

    await this.flushGraphQLCache(workspaceId);

    return { ...existingViewSort, ...updatedViewSort };
  }

  async delete(id: string, workspaceId: string): Promise<ViewSortEntity> {
    const viewSort = await this.findById(id, workspaceId);

    if (!isDefined(viewSort)) {
      throw new ViewSortException(
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          id,
        ),
        ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
      );
    }

    await this.viewSortRepository.softDelete(id);

    await this.flushGraphQLCache(workspaceId);

    return viewSort;
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
    const viewSort = await this.viewSortRepository.findOne({
      where: {
        id,
        workspaceId,
      },
      relations: ['workspace', 'view'],
      withDeleted: true,
    });

    if (!isDefined(viewSort)) {
      throw new ViewSortException(
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          id,
        ),
        ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
      );
    }

    await this.viewSortRepository.delete(id);

    await this.flushGraphQLCache(workspaceId);

    return true;
  }

  private async flushGraphQLCache(workspaceId: string): Promise<void> {
    await this.workspaceCacheStorageService.flushGraphQLOperation({
      operationName: FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION,
      workspaceId,
    });
  }
}
