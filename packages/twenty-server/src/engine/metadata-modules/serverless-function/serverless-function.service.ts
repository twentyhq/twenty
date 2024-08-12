import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { join } from 'path';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { FileUpload } from 'graphql-upload';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { ServerlessExecuteResult } from 'src/engine/integrations/serverless/drivers/interfaces/serverless-driver.interface';

import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { SOURCE_FILE_NAME } from 'src/engine/integrations/serverless/drivers/constants/source-file-name';
import { ServerlessService } from 'src/engine/integrations/serverless/serverless.service';
import { CreateServerlessFunctionFromFileInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function-from-file.input';
import { UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import {
  ServerlessFunctionEntity,
  ServerlessFunctionSyncStatus,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { serverlessFunctionCreateHash } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-create-hash.utils';

@Injectable()
export class ServerlessFunctionService extends TypeOrmQueryService<ServerlessFunctionEntity> {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly serverlessService: ServerlessService,
    @InjectRepository(ServerlessFunctionEntity, 'metadata')
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
  ) {
    super(serverlessFunctionRepository);
  }

  async executeOne(
    id: string,
    workspaceId: string,
    payload: object | undefined = undefined,
  ): Promise<ServerlessExecuteResult> {
    const functionToExecute = await this.serverlessFunctionRepository.findOne({
      where: {
        id,
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

  async deleteOneServerlessFunction(id: string, workspaceId: string) {
    const existingServerlessFunction =
      await this.serverlessFunctionRepository.findOne({
        where: { id, workspaceId },
      });

    if (!existingServerlessFunction) {
      throw new ServerlessFunctionException(
        `Function does not exist`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }

    await super.deleteOne(id);

    await this.serverlessService.delete(existingServerlessFunction);

    return existingServerlessFunction;
  }

  async updateOneServerlessFunction(
    serverlessFunctionInput: UpdateServerlessFunctionInput,
    workspaceId: string,
  ) {
    const existingServerlessFunction =
      await this.serverlessFunctionRepository.findOne({
        where: { id: serverlessFunctionInput.id, workspaceId },
      });

    if (!existingServerlessFunction) {
      throw new ServerlessFunctionException(
        `Function does not exist`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }

    const codeHasChanged =
      serverlessFunctionCreateHash(serverlessFunctionInput.code) !==
      existingServerlessFunction.sourceCodeHash;

    await super.updateOne(existingServerlessFunction.id, {
      name: serverlessFunctionInput.name,
      description: serverlessFunctionInput.description,
      sourceCodeHash: serverlessFunctionCreateHash(
        serverlessFunctionInput.code,
      ),
    });

    if (codeHasChanged) {
      const fileFolder = join(
        'workspace-' + workspaceId,
        FileFolder.ServerlessFunction,
        existingServerlessFunction.id,
      );

      await this.fileStorageService.write({
        file: serverlessFunctionInput.code,
        name: SOURCE_FILE_NAME,
        mimeType: undefined,
        folder: fileFolder,
      });

      await this.serverlessService.build(existingServerlessFunction);
    }

    return await this.findById(existingServerlessFunction.id);
  }

  async createOneServerlessFunction(
    serverlessFunctionInput: CreateServerlessFunctionFromFileInput,
    code: FileUpload | string,
    workspaceId: string,
  ) {
    const existingServerlessFunction =
      await this.serverlessFunctionRepository.findOne({
        where: { name: serverlessFunctionInput.name, workspaceId },
      });

    if (existingServerlessFunction) {
      throw new ServerlessFunctionException(
        `Function already exists`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_ALREADY_EXIST,
      );
    }

    let typescriptCode: string;

    if (typeof code === 'string') {
      typescriptCode = code;
    } else {
      typescriptCode = await readFileContent(code.createReadStream());
    }

    const serverlessFunctionId = v4();

    const fileFolderWithoutWorkspace = join(
      FileFolder.ServerlessFunction,
      serverlessFunctionId,
    );

    const fileFolder = join(
      'workspace-' + workspaceId,
      fileFolderWithoutWorkspace,
    );

    const sourceCodeFullPath =
      fileFolderWithoutWorkspace + '/' + SOURCE_FILE_NAME;

    const serverlessFunction = await super.createOne({
      ...serverlessFunctionInput,
      id: serverlessFunctionId,
      workspaceId,
      sourceCodeHash: serverlessFunctionCreateHash(typescriptCode),
      sourceCodeFullPath,
    });

    await this.fileStorageService.write({
      file: typescriptCode,
      name: SOURCE_FILE_NAME,
      mimeType: undefined,
      folder: fileFolder,
    });

    await this.serverlessService.build(serverlessFunction);
    await super.updateOne(serverlessFunctionId, {
      syncStatus: ServerlessFunctionSyncStatus.READY,
    });

    return await this.findById(serverlessFunctionId);
  }
}
