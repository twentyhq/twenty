import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { FileUpload } from 'graphql-upload';
import { Repository } from 'typeorm';

import { FileStorageExceptionCode } from 'src/engine/integrations/file-storage/interfaces/file-storage-exception';
import { ServerlessExecuteResult } from 'src/engine/integrations/serverless/drivers/interfaces/serverless-driver.interface';

import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { SOURCE_FILE_NAME } from 'src/engine/integrations/serverless/drivers/constants/source-file-name';
import { ServerlessService } from 'src/engine/integrations/serverless/serverless.service';
import { getServerlessFolder } from 'src/engine/integrations/serverless/utils/serverless-get-folder.utils';
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
import { isDefined } from 'src/utils/is-defined';
import { getLastLayerDependencies } from 'src/engine/integrations/serverless/drivers/utils/get-last-layer-dependencies';
import { LAST_LAYER_VERSION } from 'src/engine/integrations/serverless/drivers/layers/last-layer-version';

@Injectable()
export class ServerlessFunctionService extends TypeOrmQueryService<ServerlessFunctionEntity> {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly serverlessService: ServerlessService,
    @InjectRepository(ServerlessFunctionEntity, 'metadata')
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
    private readonly throttlerService: ThrottlerService,
    private readonly environmentService: EnvironmentService,
  ) {
    super(serverlessFunctionRepository);
  }

  async getServerlessFunctionSourceCode(
    workspaceId: string,
    id: string,
    version: string,
  ) {
    const serverlessFunction = await this.serverlessFunctionRepository.findOne({
      where: {
        id,
        workspaceId,
      },
    });

    if (!serverlessFunction) {
      throw new ServerlessFunctionException(
        `Function does not exist`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }

    try {
      const folderPath = getServerlessFolder({
        serverlessFunction,
        version,
      });

      const fileStream = await this.fileStorageService.read({
        folderPath,
        filename: SOURCE_FILE_NAME,
      });

      return await readFileContent(fileStream);
    } catch (error) {
      if (error.code === FileStorageExceptionCode.FILE_NOT_FOUND) {
        return;
      }
      throw error;
    }
  }

  async executeOneServerlessFunction(
    id: string,
    workspaceId: string,
    payload: object,
    version = 'latest',
  ): Promise<ServerlessExecuteResult> {
    await this.throttleExecution(workspaceId);

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

    return this.serverlessService.execute(functionToExecute, payload, version);
  }

  async publishOneServerlessFunction(id: string, workspaceId: string) {
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

    if (isDefined(existingServerlessFunction.latestVersion)) {
      const latestCode = await this.getServerlessFunctionSourceCode(
        workspaceId,
        id,
        'latest',
      );
      const draftCode = await this.getServerlessFunctionSourceCode(
        workspaceId,
        id,
        'draft',
      );

      if (
        serverlessFunctionCreateHash(latestCode || '') ===
        serverlessFunctionCreateHash(draftCode || '')
      ) {
        throw new Error(
          'Cannot publish a new version when code has not changed',
        );
      }
    }

    const newVersion = await this.serverlessService.publish(
      existingServerlessFunction,
    );

    const draftFolderPath = getServerlessFolder({
      serverlessFunction: existingServerlessFunction,
      version: 'draft',
    });
    const newFolderPath = getServerlessFolder({
      serverlessFunction: existingServerlessFunction,
      version: newVersion,
    });

    await this.fileStorageService.copy({
      from: { folderPath: draftFolderPath },
      to: { folderPath: newFolderPath },
    });

    await super.updateOne(existingServerlessFunction.id, {
      latestVersion: newVersion,
    });

    return await this.findById(existingServerlessFunction.id);
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

    await this.fileStorageService.delete({
      folderPath: getServerlessFolder({
        serverlessFunction: existingServerlessFunction,
      }),
    });

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

    await super.updateOne(existingServerlessFunction.id, {
      name: serverlessFunctionInput.name,
      description: serverlessFunctionInput.description,
      syncStatus: ServerlessFunctionSyncStatus.NOT_READY,
      sourceCodeHash: serverlessFunctionCreateHash(
        serverlessFunctionInput.code,
      ),
    });

    const fileFolder = getServerlessFolder({
      serverlessFunction: existingServerlessFunction,
      version: 'draft',
    });

    await this.fileStorageService.write({
      file: serverlessFunctionInput.code,
      name: SOURCE_FILE_NAME,
      mimeType: undefined,
      folder: fileFolder,
    });

    await this.serverlessService.build(existingServerlessFunction, 'draft');
    await super.updateOne(existingServerlessFunction.id, {
      syncStatus: ServerlessFunctionSyncStatus.READY,
    });

    return await this.findById(existingServerlessFunction.id);
  }

  async getAvailablePackages() {
    const { packageJson, yarnLock } = await getLastLayerDependencies();

    const packageVersionRegex = /^"([^@]+)@.*?":\n\s+version: (.+)$/gm;
    const versions: Record<string, string> = {};

    let match: RegExpExecArray | null;

    while ((match = packageVersionRegex.exec(yarnLock)) !== null) {
      const packageName = match[1].split('@', 1)[0];
      const version = match[2];

      if (packageJson.dependencies[packageName]) {
        versions[packageName] = version;
      }
    }

    return versions;
  }

  async createOneServerlessFunction(
    serverlessFunctionInput: CreateServerlessFunctionFromFileInput,
    code: FileUpload | string,
    workspaceId: string,
  ) {
    let typescriptCode: string;

    if (typeof code === 'string') {
      typescriptCode = code;
    } else {
      typescriptCode = await readFileContent(code.createReadStream());
    }

    const createdServerlessFunction = await super.createOne({
      ...serverlessFunctionInput,
      workspaceId,
      sourceCodeHash: serverlessFunctionCreateHash(typescriptCode),
      layerVersion: LAST_LAYER_VERSION,
    });

    const draftFileFolder = getServerlessFolder({
      serverlessFunction: createdServerlessFunction,
      version: 'draft',
    });

    await this.fileStorageService.write({
      file: typescriptCode,
      name: SOURCE_FILE_NAME,
      mimeType: undefined,
      folder: draftFileFolder,
    });

    await this.serverlessService.build(createdServerlessFunction, 'draft');

    return await this.findById(createdServerlessFunction.id);
  }

  private async throttleExecution(workspaceId: string) {
    try {
      await this.throttlerService.throttle(
        `${workspaceId}-serverless-function-execution`,
        this.environmentService.get('SERVERLESS_FUNCTION_EXEC_THROTTLE_LIMIT'),
        this.environmentService.get('SERVERLESS_FUNCTION_EXEC_THROTTLE_TTL'),
      );
    } catch (error) {
      throw new ServerlessFunctionException(
        'Serverless function execution rate limit exceeded',
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_EXECUTION_LIMIT_REACHED,
      );
    }
  }
}
