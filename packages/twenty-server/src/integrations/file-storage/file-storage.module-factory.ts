import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import {
  FileStorageModuleOptions,
  StorageDriverType,
} from 'src/integrations/file-storage/interfaces';

/**
 * FileStorage Module factory
 * @param environment
 * @returns FileStorageModuleOptions
 */
export const fileStorageModuleFactory = async (
  environmentService: EnvironmentService,
): Promise<FileStorageModuleOptions> => {
  const driverType = environmentService.getStorageDriverType();

  switch (driverType) {
    case StorageDriverType.Local: {
      const storagePath = environmentService.getStorageLocalPath();

      return {
        type: StorageDriverType.Local,
        options: {
          storagePath: process.cwd() + '/' + storagePath,
        },
      };
    }
    case StorageDriverType.S3: {
      const bucketName = environmentService.getStorageS3Name();
      const endpoint = environmentService.getStorageS3Endpoint();
      const region = environmentService.getStorageS3Region();

      return {
        type: StorageDriverType.S3,
        options: {
          bucketName: bucketName ?? '',
          endpoint: endpoint,
          credentials: fromNodeProviderChain({
            clientConfig: { region },
          }),
          forcePathStyle: true,
          region: region ?? '',
        },
      };
    }
    default:
      throw new Error(
        `Invalid storage driver type (${driverType}), check your .env file`,
      );
  }
};
