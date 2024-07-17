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
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';

@Injectable()
export class ServerlessFunctionService {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly codeEngineService: ServerlessService,
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

    return this.codeEngineService.execute(functionToExecute, payload);
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

    const serverlessFunction = await this.serverlessFunctionRepository.save({
      name,
      workspaceId,
    });

    const typescriptCode = await readFileContent(createReadStream());

    const fileFolder = join(
      FileFolder.ServerlessFunction,
      workspaceId,
      serverlessFunction.id,
    );

    await this.fileUploadService.uploadFile({
      file: typescriptCode,
      filename: 'source.ts',
      mimeType: mimetype,
      fileFolder,
      forceName: true,
    });

    await this.codeEngineService.build(serverlessFunction);
    await this.serverlessFunctionRepository.update(serverlessFunction.id, {
      syncStatus: ServerlessFunctionSyncStatus.READY,
    });

    return await this.serverlessFunctionRepository.findOneByOrFail({
      id: serverlessFunction.id,
    });
  }
}
