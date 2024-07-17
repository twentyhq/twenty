import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { join } from 'path';

import { FileUpload } from 'graphql-upload';
import { Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { ServerlessService } from 'src/engine/integrations/serverless/serverless.service';
import {
  ServerlessFunctionEntity,
  ServerlessFunctionSyncStatus,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { SOURCE_FILE_NAME } from 'src/engine/integrations/serverless/drivers/constants/source-file-name';
import { serverlessFunctionCreateHash } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-create-hash.utils';

@Injectable()
export class ServerlessFunctionService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly serverlessService: ServerlessService,
    @InjectRepository(ServerlessFunctionEntity, 'metadata')
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
  ) {}

  async executeOne(
    name: string,
    workspaceId: string,
    payload: object | undefined = undefined,
  ) {
    const functionToExecute = await this.serverlessFunctionRepository.findOne({
      where: {
        name,
        workspaceId,
      },
    });

    if (!functionToExecute) {
      throw new ServerlessFunctionException(
        `Function does not exist`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }

    if (
      functionToExecute.syncStatus === ServerlessFunctionSyncStatus.NOT_READY
    ) {
      throw new ServerlessFunctionException(
        `Function is not ready to be executed`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }

    return this.serverlessService.execute(functionToExecute, payload);
  }

  async createOne(
    name: string,
    workspaceId: string,
    { createReadStream, mimetype }: FileUpload,
  ) {
    const existingServerlessFunction =
      await this.serverlessFunctionRepository.findOne({
        where: { name, workspaceId },
      });

    if (existingServerlessFunction) {
      throw new ServerlessFunctionException(
        `Function already exists`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_ALREADY_EXIST,
      );
    }

    const typescriptCode = await readFileContent(createReadStream());

    const serverlessFunction = await this.serverlessFunctionRepository.save({
      name,
      workspaceId,
      sourceCodeHash: serverlessFunctionCreateHash(typescriptCode),
    });

    const fileFolder = join(
      FileFolder.ServerlessFunction,
      workspaceId,
      serverlessFunction.id,
    );

    await this.fileStorageService.write({
      file: typescriptCode,
      name: SOURCE_FILE_NAME,
      mimeType: mimetype,
      folder: fileFolder,
    });

    await this.serverlessService.build(serverlessFunction);
    await this.serverlessFunctionRepository.update(serverlessFunction.id, {
      syncStatus: ServerlessFunctionSyncStatus.READY,
    });

    return await this.serverlessFunctionRepository.findOneByOrFail({
      id: serverlessFunction.id,
    });
  }
}
