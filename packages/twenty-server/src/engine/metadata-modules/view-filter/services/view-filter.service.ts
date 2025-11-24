import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
  ViewFilterExceptionMessageKey,
  generateViewFilterExceptionMessage,
  generateViewFilterUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION } from 'src/engine/metadata-modules/view/constants/find-all-core-views-graphql-operation.constant';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class ViewFilterService {
  constructor(
    @InjectRepository(ViewFilterEntity)
    private readonly viewFilterRepository: Repository<ViewFilterEntity>,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewFilterEntity[]> {
    return this.viewFilterRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
      relations: ['workspace', 'view', 'viewFilterGroup'],
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewFilterEntity[]> {
    return this.viewFilterRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
      relations: ['workspace', 'view', 'viewFilterGroup'],
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ViewFilterEntity | null> {
    const viewFilter = await this.viewFilterRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view', 'viewFilterGroup'],
    });

    return viewFilter || null;
  }

  async create(
    viewFilterData: Partial<ViewFilterEntity>,
  ): Promise<ViewFilterEntity> {
    if (!isDefined(viewFilterData.workspaceId)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        {
          userFriendlyMessage: generateViewFilterUserFriendlyExceptionMessage(
            ViewFilterExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewFilterData.viewId)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_ID_REQUIRED,
        ),
        ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        {
          userFriendlyMessage: generateViewFilterUserFriendlyExceptionMessage(
            ViewFilterExceptionMessageKey.VIEW_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewFilterData.fieldMetadataId)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
        ),
        ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        {
          userFriendlyMessage: generateViewFilterUserFriendlyExceptionMessage(
            ViewFilterExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
          ),
        },
      );
    }

    const viewFilter = this.viewFilterRepository.create(viewFilterData);

    await this.flushGraphQLCache(viewFilterData.workspaceId);

    const savedViewFilter = await this.viewFilterRepository.save(viewFilter);

    await this.flushGraphQLCache(viewFilterData.workspaceId);

    return savedViewFilter;
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewFilterEntity>,
  ): Promise<ViewFilterEntity> {
    const existingViewFilter = await this.findById(id, workspaceId);

    if (!isDefined(existingViewFilter)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          id,
        ),
        ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
      );
    }

    const updatedViewFilter = await this.viewFilterRepository.save({
      id,
      ...updateData,
    });

    await this.flushGraphQLCache(workspaceId);

    return { ...existingViewFilter, ...updatedViewFilter };
  }

  async delete(id: string, workspaceId: string): Promise<ViewFilterEntity> {
    const viewFilter = await this.findById(id, workspaceId);

    if (!isDefined(viewFilter)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          id,
        ),
        ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
      );
    }

    await this.viewFilterRepository.softDelete(id);

    await this.flushGraphQLCache(workspaceId);

    return viewFilter;
  }

  async destroy(id: string, workspaceId: string): Promise<ViewFilterEntity> {
    const viewFilter = await this.viewFilterRepository.findOne({
      where: {
        id,
        workspaceId,
      },
      relations: ['workspace', 'view', 'viewFilterGroup'],
      withDeleted: true,
    });

    if (!isDefined(viewFilter)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          id,
        ),
        ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
      );
    }

    await this.viewFilterRepository.delete(id);

    await this.flushGraphQLCache(workspaceId);

    return viewFilter;
  }

  private async flushGraphQLCache(workspaceId: string): Promise<void> {
    await this.workspaceCacheStorageService.flushGraphQLOperation({
      operationName: FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION,
      workspaceId,
    });
  }
}
