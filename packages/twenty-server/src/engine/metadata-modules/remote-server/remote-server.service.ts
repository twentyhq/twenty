import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { CreateRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/create-remote-server.input';
import {
  FdwOptions,
  RemoteServerEntity,
  RemoteServerType,
  UserMappingOptions,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { encryptText } from 'src/engine/core-modules/auth/auth.util';

@Injectable()
export class RemoteServerService<T extends RemoteServerType> {
  constructor(
    @InjectRepository(RemoteServerEntity, 'metadata')
    private readonly remoteServerRepository: Repository<
      RemoteServerEntity<RemoteServerType>
    >,
    private readonly typeORMService: TypeORMService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async createOneRemoteServer(
    remoteServerInput: CreateRemoteServerInput<T>,
    workspaceId: string,
  ): Promise<RemoteServerEntity<RemoteServerType>> {
    const mainDatasource = this.typeORMService.getMainDataSource();

    let remoteServerToCreate = {
      ...remoteServerInput,
      workspaceId,
    };

    if (remoteServerInput.userMappingOptions) {
      const key = this.environmentService.get('LOGIN_TOKEN_SECRET');
      const iv = this.environmentService.get('IV_SECRET');
      const encryptedPassword = await encryptText(
        remoteServerInput.userMappingOptions.password,
        key,
        iv,
      );

      remoteServerToCreate = {
        ...remoteServerToCreate,
        userMappingOptions: {
          ...remoteServerInput.userMappingOptions,
          password: encryptedPassword,
        },
      };
    }

    const createdRemoteServer =
      await this.remoteServerRepository.create(remoteServerToCreate);

    const fdwQuery = this.buildFDWQuery(
      createdRemoteServer.fdwId,
      remoteServerInput.fdwType,
      remoteServerInput.fdwOptions,
    );

    await mainDatasource.query(fdwQuery);

    if (remoteServerInput.userMappingOptions) {
      const userMappingQuery = this.buildUserMappingQuery(
        createdRemoteServer.fdwId,
        remoteServerInput.userMappingOptions,
      );

      await mainDatasource.query(userMappingQuery);
    }

    await this.remoteServerRepository.save(createdRemoteServer);

    return createdRemoteServer;
  }

  async deleteOneRemoteServer(
    id: string,
    workspaceId: string,
  ): Promise<RemoteServerEntity<RemoteServerType>> {
    const remoteServer = await this.remoteServerRepository.findOne({
      where: {
        id,
        workspaceId,
      },
    });

    if (!remoteServer) {
      throw new NotFoundException('Object does not exist');
    }

    const mainDatasource = this.typeORMService.getMainDataSource();

    await mainDatasource.query(`DROP SERVER "${remoteServer.fdwId}" CASCADE`);
    await this.remoteServerRepository.delete(id);

    return remoteServer;
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
    fdwType: T,
    workspaceId: string,
  ) {
    return this.remoteServerRepository.find({
      where: {
        fdwType,
        workspaceId,
      },
    });
  }

  // TODO: Move to a query builder once the logic is validated
  private buildUserMappingQuery(
    fdwId: string,
    userMappingOptions: UserMappingOptions,
  ) {
    return `CREATE USER MAPPING IF NOT EXISTS FOR ${userMappingOptions.username} SERVER "${fdwId}" OPTIONS (user '${userMappingOptions.username}', password '${userMappingOptions.password}')`;
  }

  // TODO: Move to a query builder once the logic is validated
  private buildFDWQuery(fdwId: string, fdwType: T, fdwOptions: FdwOptions<T>) {
    let fdwQueryOptions = '';

    switch (fdwType) {
      case RemoteServerType.POSTGRES_FDW:
        fdwQueryOptions = this.buildPostgresFDWQueryOptions(fdwOptions);
        break;
      default:
        throw new Error('FDW type not supported');
    }

    return `CREATE SERVER IF NOT EXISTS "${fdwId}" FOREIGN DATA WRAPPER postgres_fdw OPTIONS (${fdwQueryOptions})`;
  }

  private buildPostgresFDWQueryOptions(fdwOptions: FdwOptions<T>) {
    return `dbname '${fdwOptions.dbname}', host '${fdwOptions.host}', port '${fdwOptions.port}'`;
  }
}
