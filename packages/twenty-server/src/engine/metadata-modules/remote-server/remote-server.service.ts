import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { v4 } from 'uuid';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { CreateRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/create-remote-server.input';
import {
  RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { encryptText } from 'src/engine/core-modules/auth/auth.util';
import {
  validateObject,
  validateString,
} from 'src/engine/metadata-modules/remote-server/utils/validate-remote-server-input';
import { ForeignDataWrapperQueryFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/foreign-data-wrapper-query.factory';

@Injectable()
export class RemoteServerService<T extends RemoteServerType> {
  constructor(
    @InjectRepository(RemoteServerEntity, 'metadata')
    private readonly remoteServerRepository: Repository<
      RemoteServerEntity<RemoteServerType>
    >,
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    private readonly environmentService: EnvironmentService,
    private readonly foreignDataWrapperQueryFactory: ForeignDataWrapperQueryFactory,
  ) {}

  async createOneRemoteServer(
    remoteServerInput: CreateRemoteServerInput<T>,
    workspaceId: string,
  ): Promise<RemoteServerEntity<RemoteServerType>> {
    validateObject(remoteServerInput.foreignDataWrapperOptions);

    if (remoteServerInput.userMappingOptions) {
      validateObject(remoteServerInput.userMappingOptions);
    }

    const foreignDataWrapperId = v4();

    let remoteServerToCreate = {
      ...remoteServerInput,
      workspaceId,
      foreignDataWrapperId,
    };

    if (remoteServerInput.userMappingOptions) {
      const key = this.environmentService.get('LOGIN_TOKEN_SECRET');
      const encryptedPassword = await encryptText(
        remoteServerInput.userMappingOptions.password,
        key,
      );

      remoteServerToCreate = {
        ...remoteServerToCreate,
        userMappingOptions: {
          ...remoteServerInput.userMappingOptions,
          password: encryptedPassword,
        },
      };
    }

    return this.metadataDataSource.transaction(
      async (entityManager: EntityManager) => {
        const createdRemoteServer = await entityManager.create(
          RemoteServerEntity,
          remoteServerToCreate,
        );

        const foreignDataWrapperQuery =
          this.foreignDataWrapperQueryFactory.createForeignDataWrapper(
            createdRemoteServer.foreignDataWrapperId,
            remoteServerInput.foreignDataWrapperType,
            remoteServerInput.foreignDataWrapperOptions,
          );

        await entityManager.query(foreignDataWrapperQuery);

        if (remoteServerInput.userMappingOptions) {
          const userMappingQuery =
            this.foreignDataWrapperQueryFactory.createUserMapping(
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

  async deleteOneRemoteServer(
    id: string,
    workspaceId: string,
  ): Promise<RemoteServerEntity<RemoteServerType>> {
    validateString(id);

    const remoteServer = await this.remoteServerRepository.findOne({
      where: {
        id,
        workspaceId,
      },
    });

    if (!remoteServer) {
      throw new NotFoundException('Object does not exist');
    }

    return this.metadataDataSource.transaction(
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
}
