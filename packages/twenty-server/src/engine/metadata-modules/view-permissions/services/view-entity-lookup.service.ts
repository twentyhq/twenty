import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';

@Injectable()
export class ViewEntityLookupService {
  constructor(
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
    @InjectRepository(ViewFilterEntity)
    private readonly viewFilterRepository: Repository<ViewFilterEntity>,
    @InjectRepository(ViewFilterGroupEntity)
    private readonly viewFilterGroupRepository: Repository<ViewFilterGroupEntity>,
    @InjectRepository(ViewGroupEntity)
    private readonly viewGroupRepository: Repository<ViewGroupEntity>,
    @InjectRepository(ViewSortEntity)
    private readonly viewSortRepository: Repository<ViewSortEntity>,
  ) {}

  async findViewIdByEntityId(
    entityId: string,
    workspaceId: string,
  ): Promise<string> {
    const viewField = await this.viewFieldRepository.findOne({
      where: { id: entityId, workspaceId },
      select: ['viewId'],
    });

    if (viewField) return viewField.viewId;

    const viewFilter = await this.viewFilterRepository.findOne({
      where: { id: entityId, workspaceId },
      select: ['viewId'],
    });

    if (viewFilter) return viewFilter.viewId;

    const viewFilterGroup = await this.viewFilterGroupRepository.findOne({
      where: { id: entityId, workspaceId },
      select: ['viewId'],
    });

    if (viewFilterGroup) return viewFilterGroup.viewId;

    const viewGroup = await this.viewGroupRepository.findOne({
      where: { id: entityId, workspaceId },
      select: ['viewId'],
    });

    if (viewGroup) return viewGroup.viewId;

    const viewSort = await this.viewSortRepository.findOne({
      where: { id: entityId, workspaceId },
      select: ['viewId'],
    });

    if (viewSort) return viewSort.viewId;

    throw new Error(`Could not find entity with id ${entityId}`);
  }
}
