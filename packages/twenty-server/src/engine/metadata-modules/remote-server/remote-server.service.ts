import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { CreateRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/create-remote-server.input';
import { RemoteServerEntity } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { encryptText } from 'src/engine/core-modules/auth/auth.util';

@Injectable()
export class RemoteServerService extends TypeOrmQueryService<RemoteServerEntity> {
  constructor(
    @InjectRepository(RemoteServerEntity, 'metadata')
    private readonly remoteServerRepository: Repository<RemoteServerEntity>,
    private readonly typeORMService: TypeORMService,
    private readonly environmentService: EnvironmentService,
  ) {
    super(remoteServerRepository);
  }

  async createOneRemoteServer(
    remoteServerInput: CreateRemoteServerInput,
    workspaceId: string,
  ): Promise<RemoteServerEntity> {
    const mainDatasource = this.typeORMService.getMainDataSource();
    const key = this.environmentService.get('LOGIN_TOKEN_SECRET');
    const iv = this.environmentService.get('IV_SECRET');
    const encryptedPassword = await encryptText(
      remoteServerInput.password,
      key,
      iv,
    );

    const createdRemoteServer = await super.createOne({
      ...remoteServerInput,
      password: encryptedPassword,
      workspaceId,
    });

    await mainDatasource.query(
      `CREATE SERVER IF NOT EXISTS "${createdRemoteServer.fdwId}" FOREIGN DATA WRAPPER postgres_fdw OPTIONS (dbname '${remoteServerInput.database}', host '${remoteServerInput.host}', port '${remoteServerInput.port}')`,
    );

    await mainDatasource.query(
      `CREATE USER MAPPING IF NOT EXISTS FOR ${remoteServerInput.username} SERVER "${createdRemoteServer.fdwId}" OPTIONS (user '${remoteServerInput.username}', password '${remoteServerInput.password}')`,
    );

    return createdRemoteServer;
  }

  async deleteOneRemoteServer(
    id: string,
    workspaceId: string,
  ): Promise<RemoteServerEntity> {
    const remoteServer = await this.remoteServerRepository.findOne({
      where: {
        id,
        workspaceId,
      },
    });

    if (!remoteServer) {
      throw new NotFoundException('Object does not exist');
    }

    await this.remoteServerRepository.delete(id);

    const mainDatasource = this.typeORMService.getMainDataSource();

    await mainDatasource.query(`DROP SERVER "${remoteServer.fdwId}" CASCADE`);

    return remoteServer;
  }
}
