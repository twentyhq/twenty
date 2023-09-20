import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { Workspace } from '@prisma/client';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';
import { findManyCursorConnection } from 'src/utils/pagination';

import { UniversalEntity, PaginatedUniversalEntity } from './universal.entity';
import {
  getRawTypeORMOrderByClause,
  getRawTypeORMWhereClause,
} from './universal.util';

import { FindManyUniversalArgs } from './args/find-many-universal.args';
import { FindUniqueUniversalArgs } from './args/find-unique-universal.args';

@Injectable()
export class UniversalService {
  constructor(private readonly dataSourceService: DataSourceService) {}

  async findManyUniversal(
    args: FindManyUniversalArgs,
    workspace: Workspace,
  ): Promise<PaginatedUniversalEntity> {
    await this.dataSourceService.createWorkspaceSchema(workspace.id);

    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspace.id);

    let query = workspaceDataSource
      ?.createQueryBuilder()
      .select()
      .from(args.entity, args.entity);

    if (!query) {
      throw new InternalServerErrorException();
    }

    if (query && args.where) {
      const { where, parameters } = getRawTypeORMWhereClause(
        args.entity,
        args.where,
      );

      query = query.where(where, parameters);
    }

    if (query && args.orderBy) {
      const orderBy = getRawTypeORMOrderByClause(args.entity, args.orderBy);

      query = query.orderBy(orderBy);
    }

    return findManyCursorConnection(query, args, {
      recordToEdge({ id, createdAt, updatedAt, ...data }) {
        return {
          node: {
            id,
            data,
            createdAt,
            updatedAt,
          },
        };
      },
    });
  }

  async findUniqueUniversal(
    args: FindUniqueUniversalArgs,
    workspace: Workspace,
  ): Promise<UniversalEntity | undefined> {
    await this.dataSourceService.createWorkspaceSchema(workspace.id);

    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspace.id);

    let query = workspaceDataSource
      ?.createQueryBuilder()
      .select()
      .from(args.entity, args.entity);

    if (query && args.where) {
      const { where, parameters } = getRawTypeORMWhereClause(
        args.entity,
        args.where,
      );

      query = query.where(where, parameters);
    }

    const { id, createdAt, updatedAt, ...data } = await query?.getRawOne();

    return {
      id,
      data,
      createdAt,
      updatedAt,
    };
  }
}
