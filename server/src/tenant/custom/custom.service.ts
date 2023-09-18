import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { Workspace } from '@prisma/client';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';
import { findManyCursorConnection } from 'src/utils/pagination';

import { CustomEntity, PaginatedCustomEntity } from './custom.entity';
import {
  getRawTypeORMOrderByClause,
  getRawTypeORMWhereClause,
} from './custom.util';

import { FindManyCustomArgs } from './args/find-many-custom.args';
import { FindUniqueCustomArgs } from './args/find-unique-custom.args';

@Injectable()
export class CustomService {
  constructor(private readonly dataSourceService: DataSourceService) {}

  async findManyCustom(
    args: FindManyCustomArgs,
    workspace: Workspace,
  ): Promise<PaginatedCustomEntity> {
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

    // const objects = await query?.getRawMany();

    return findManyCursorConnection(query, args, {
      // TODO: Fix this
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      recordToEdge({ id, ...data }) {
        return {
          node: {
            id,
            data,
          },
        };
      },
    });

    // return (
    //   objects?.map(
    //     ({ id, ...data }) =>
    //       ({
    //         id,
    //         data,
    //       } as CustomEntity),
    //   ) ?? []
    // );
  }

  async findUniqueCustom(
    args: FindUniqueCustomArgs,
    workspace: Workspace,
  ): Promise<CustomEntity | undefined> {
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

    const { id, ...data } = await query?.getRawOne();

    return {
      id,
      data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
