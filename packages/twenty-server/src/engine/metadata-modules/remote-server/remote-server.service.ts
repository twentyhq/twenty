import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import isEmpty from 'lodash.isempty';
import { DataSource, type EntityManager, Repository } from 'typeorm';
import { type DeepPartial } from 'typeorm/common/DeepPartial';
import { v4 } from 'uuid';

import { ForeignDataWrapperServerQueryFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/foreign-data-wrapper-server-query.factory';
import { encryptText } from 'src/engine/core-modules/auth/auth.util';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type CreateRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/create-remote-server.input';
import { type UpdateRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/update-remote-server.input';
import {
  RemoteServerEntity,
  type RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import {
  RemoteServerException,
  RemoteServerExceptionCode,
} from 'src/engine/metadata-modules/remote-server/remote-server.exception';
import { RemoteTableService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.service';
import { buildUpdateRemoteServerRawQuery } from 'src/engine/metadata-modules/remote-server/utils/build-update-remote-server-raw-query.utils';
import {
  validateObjectAgainstInjections,
  validateStringAgainstInjections,
} from 'src/engine/metadata-modules/remote-server/utils/validate-remote-server-input.utils';
import { validateRemoteServerType } from 'src/engine/metadata-modules/remote-server/utils/validate-remote-server-type.util';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class RemoteServerService<T extends RemoteServerType> {
  constructor(
    @InjectRepository(RemoteServerEntity)
    private readonly remoteServerRepository: Repository<
      RemoteServerEntity<RemoteServerType>
    >,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly foreignDataWrapperServerQueryFactory: ForeignDataWrapperServerQueryFactory,
    private readonly remoteTableService: RemoteTableService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  public async createOneRemoteServer(
    remoteServerInput: CreateRemoteServerInput<T>,
    workspaceId: string,
  ): Promise<RemoteServerEntity<RemoteServerType>> {
    this.validateRemoteServerInputAgainstInjections(remoteServerInput);

    validateRemoteServerType(
      remoteServerInput.foreignDataWrapperType,
      this.featureFlagRepository,
      workspaceId,
    );

    const foreignDataWrapperId = v4();

    let remoteServerToCreate = {
      ...remoteServerInput,
      workspaceId,
      foreignDataWrapperId,
    };

    if (remoteServerInput.userMappingOptions) {
      remoteServerToCreate = {
        ...remoteServerToCreate,
        userMappingOptions: {
          ...remoteServerInput.userMappingOptions,
          password: this.encryptPassword(
            remoteServerInput.userMappingOptions.password,
            workspaceId,
          ),
        },
      };
    }

    return this.coreDataSource.transaction(
      async (entityManager: WorkspaceEntityManager) => {
        const createdRemoteServer = entityManager.create(
          RemoteServerEntity,
          remoteServerToCreate,
        ) as RemoteServerEntity<RemoteServerType>;

        const foreignDataWrapperQuery =
          this.foreignDataWrapperServerQueryFactory.createForeignDataWrapperServer(
            createdRemoteServer.foreignDataWrapperId,
            remoteServerInput.foreignDataWrapperType,
            remoteServerInput.foreignDataWrapperOptions,
          );

        await entityManager.query(foreignDataWrapperQuery);

        if (remoteServerInput.userMappingOptions) {
          const userMappingQuery =
            this.foreignDataWrapperServerQueryFactory.createUserMapping(
              createdRemoteServer.foreignDataWrapperId,
              remoteServerInput.userMappingOptions,
            );

          await entityManager.query(userMappingQuery);
        }

        await entityManager.save(RemoteServerEntity, createdRemoteServer);

        return createdRemoteServer;
      },
    );
  }

  public async updateOneRemoteServer(
    remoteServerInput: UpdateRemoteServerInput<T>,
    workspaceId: string,
  ): Promise<RemoteServerEntity<RemoteServerType>> {
    this.validateRemoteServerInputAgainstInjections(remoteServerInput);

    const remoteServer = await this.findOneByIdWithinWorkspace(
      remoteServerInput.id,
      workspaceId,
    );

    if (!remoteServer) {
      throw new RemoteServerException(
        'Remote server does not exist',
        RemoteServerExceptionCode.REMOTE_SERVER_NOT_FOUND,
      );
    }

    const currentRemoteTablesForServer =
      await this.remoteTableService.findRemoteTablesByServerId({
        remoteServerId: remoteServer.id,
        workspaceId,
      });

    if (currentRemoteTablesForServer.length > 0) {
      throw new RemoteServerException(
        'Cannot update remote server with synchronized tables',
        RemoteServerExceptionCode.REMOTE_SERVER_MUTATION_NOT_ALLOWED,
      );
    }

    const foreignDataWrapperId = remoteServer.foreignDataWrapperId;

    let partialRemoteServerWithUpdates = {
      ...remoteServerInput,
      workspaceId,
      foreignDataWrapperId,
    };

    if (partialRemoteServerWithUpdates?.userMappingOptions?.password) {
      partialRemoteServerWithUpdates = {
        ...partialRemoteServerWithUpdates,
        userMappingOptions: {
          ...partialRemoteServerWithUpdates.userMappingOptions,
          password: this.encryptPassword(
            partialRemoteServerWithUpdates.userMappingOptions.password,
            workspaceId,
          ),
        },
      };
    }

    return this.coreDataSource.transaction(
      async (entityManager: EntityManager) => {
        const updatedRemoteServer = await this.updateRemoteServer(
          partialRemoteServerWithUpdates,
        );

        if (
          !isEmpty(partialRemoteServerWithUpdates.foreignDataWrapperOptions)
        ) {
          const foreignDataWrapperQuery =
            this.foreignDataWrapperServerQueryFactory.updateForeignDataWrapperServer(
              {
                foreignDataWrapperId,
                foreignDataWrapperOptions:
                  partialRemoteServerWithUpdates.foreignDataWrapperOptions,
              },
            );

          await entityManager.query(foreignDataWrapperQuery);
        }

        if (!isEmpty(partialRemoteServerWithUpdates.userMappingOptions)) {
          const userMappingQuery =
            this.foreignDataWrapperServerQueryFactory.updateUserMapping(
              foreignDataWrapperId,
              partialRemoteServerWithUpdates.userMappingOptions,
            );

          await entityManager.query(userMappingQuery);
        }

        return updatedRemoteServer;
      },
    );
  }

  public async deleteOneRemoteServer(
    id: string,
    workspaceId: string,
  ): Promise<RemoteServerEntity<RemoteServerType>> {
    validateStringAgainstInjections(id);

    const remoteServer = await this.remoteServerRepository.findOne({
      where: {
        id,
        workspaceId,
      },
    });

    if (!remoteServer) {
      throw new RemoteServerException(
        'Remote server does not exist',
        RemoteServerExceptionCode.REMOTE_SERVER_NOT_FOUND,
      );
    }

    await this.remoteTableService.unsyncAll(workspaceId, remoteServer);

    return this.coreDataSource.transaction(
      async (entityManager: EntityManager) => {
        await entityManager.query(
          `DROP SERVER "${remoteServer.foreignDataWrapperId}" CASCADE`,
        );
        await entityManager.delete(RemoteServerEntity, id);

        return remoteServer;
      },
    );
  }

  public async findOneByIdWithinWorkspace(id: string, workspaceId: string) {
    return this.remoteServerRepository.findOne({
      where: {
        id,
        workspaceId,
      },
    });
  }

  public async findManyByTypeWithinWorkspace<T extends RemoteServerType>(
    foreignDataWrapperType: T,
    workspaceId: string,
  ) {
    return this.remoteServerRepository.find({
      where: {
        foreignDataWrapperType,
        workspaceId,
      },
    });
  }

  private encryptPassword(password: string, workspaceId: string) {
    const key = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.REMOTE_SERVER,
      workspaceId,
    );

    return encryptText(password, key);
  }

  private async updateRemoteServer(
    remoteServerToUpdate: DeepPartial<RemoteServerEntity<RemoteServerType>> &
      Pick<RemoteServerEntity<RemoteServerType>, 'workspaceId' | 'id'>,
  ): Promise<RemoteServerEntity<RemoteServerType>> {
    const [parameters, rawQuery] =
      buildUpdateRemoteServerRawQuery(remoteServerToUpdate);

    // TO DO: executeRawQuery is deprecated and will throw
    const updateResult = await this.workspaceDataSourceService.executeRawQuery(
      rawQuery,
      parameters,
      remoteServerToUpdate.workspaceId,
    );

    return updateResult[0][0];
  }

  private validateRemoteServerInputAgainstInjections(
    remoteServerInput: CreateRemoteServerInput<T> | UpdateRemoteServerInput<T>,
  ) {
    if (remoteServerInput.foreignDataWrapperOptions) {
      validateObjectAgainstInjections(
        remoteServerInput.foreignDataWrapperOptions,
      );
    }

    if (remoteServerInput.userMappingOptions) {
      validateObjectAgainstInjections(remoteServerInput.userMappingOptions);
    }
  }
}
