import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 } from 'uuid';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CreatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout-tab.input';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-tab.entity';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
  PageLayoutTabExceptionMessageKey,
  generatePageLayoutTabExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout-tab.exception';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';

@Injectable()
export class PageLayoutTabService {
  constructor(
    @InjectRepository(PageLayoutTabEntity)
    private readonly pageLayoutTabRepository: Repository<PageLayoutTabEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly pageLayoutService: PageLayoutService,
  ) {}

  private getPageLayoutTabRepository(
    transactionManager?: EntityManager,
  ): Repository<PageLayoutTabEntity> {
    return transactionManager
      ? transactionManager.getRepository(PageLayoutTabEntity)
      : this.pageLayoutTabRepository;
  }

  async findByPageLayoutId(
    workspaceId: string,
    pageLayoutId: string,
    transactionManager?: EntityManager,
    withDeleted = false,
  ): Promise<PageLayoutTabEntity[]> {
    const repository = this.getPageLayoutTabRepository(transactionManager);

    return repository.find({
      where: {
        pageLayoutId,
        pageLayout: { workspaceId },
      },
      order: { position: 'ASC' },
      relations: ['widgets'],
      withDeleted,
    });
  }

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutTabEntity> {
    const repository = this.getPageLayoutTabRepository(transactionManager);

    const pageLayoutTab = await repository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['widgets'],
    });

    if (!isDefined(pageLayoutTab)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          id,
        ),
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    }

    return pageLayoutTab;
  }

  async create(
    pageLayoutTabData: CreatePageLayoutTabInput,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutTabEntity> {
    if (!isDefined(pageLayoutTabData.title)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.TITLE_REQUIRED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    if (!isDefined(pageLayoutTabData.pageLayoutId)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_ID_REQUIRED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    try {
      await this.pageLayoutService.findByIdOrThrow(
        pageLayoutTabData.pageLayoutId,
        workspaceId,
        transactionManager,
      );

      const workspace = await this.workspaceRepository.findOneOrFail({
        where: { id: workspaceId },
        select: ['workspaceCustomApplicationId'],
      });

      const repository = this.getPageLayoutTabRepository(transactionManager);

      const insertResult = await repository.insert({
        ...pageLayoutTabData,
        workspaceId,
        universalIdentifier: v4(),
        applicationId: workspace.workspaceCustomApplicationId,
      });

      return this.findByIdOrThrow(
        insertResult.identifiers[0].id,
        workspaceId,
        transactionManager,
      );
    } catch (error) {
      if (
        error instanceof PageLayoutException &&
        error.code === PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND
      ) {
        throw new PageLayoutTabException(
          generatePageLayoutTabExceptionMessage(
            PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          ),
          PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: QueryDeepPartialEntity<PageLayoutTabEntity>,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutTabEntity> {
    const repository = this.getPageLayoutTabRepository(transactionManager);

    const existingTab = await repository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(existingTab)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          id,
        ),
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    }

    await repository.update({ id }, updateData);

    return this.findByIdOrThrow(id, workspaceId, transactionManager);
  }

  async delete(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutTabEntity> {
    const pageLayoutTab = await this.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );

    const repository = this.getPageLayoutTabRepository(transactionManager);

    await repository.softDelete(id);

    return pageLayoutTab;
  }

  async destroy(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repository = this.getPageLayoutTabRepository(transactionManager);

    const pageLayoutTab = await repository.findOne({
      where: {
        id,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(pageLayoutTab)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          id,
        ),
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    }

    await repository.delete(id);

    return true;
  }

  async restore(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutTabEntity> {
    const repository = this.getPageLayoutTabRepository(transactionManager);

    const pageLayoutTab = await repository.findOne({
      select: {
        id: true,
        deletedAt: true,
        pageLayoutId: true,
      },
      where: {
        id,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(pageLayoutTab)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          id,
        ),
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    }

    if (!isDefined(pageLayoutTab.deletedAt)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_DELETED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    try {
      await this.pageLayoutService.findByIdOrThrow(
        pageLayoutTab.pageLayoutId,
        workspaceId,
        transactionManager,
      );
    } catch (error) {
      if (
        error instanceof PageLayoutException &&
        error.code === PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND
      ) {
        throw new PageLayoutTabException(
          generatePageLayoutTabExceptionMessage(
            PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          ),
          PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
        );
      }
      throw error;
    }

    await repository.restore(id);

    const restoredPageLayoutTab = await this.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );

    return restoredPageLayoutTab;
  }
}
