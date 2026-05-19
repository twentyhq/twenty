import { type TestingModule } from '@nestjs/testing';

import { CommandTestFactory } from 'nest-commander-testing';

import { AppModule } from 'src/app.module';
import { SecretEncryptionRotationModule } from 'src/database/commands/secret-encryption-rotation/secret-encryption-rotation.module';

const ROTATE_COMMAND_NAME = 'secret-encryption:rotate';

let cachedCommandModule: TestingModule | undefined;

const getOrCreateCommandModule = async (): Promise<TestingModule> => {
  if (cachedCommandModule !== undefined) {
    return cachedCommandModule;
  }

  cachedCommandModule = await CommandTestFactory.createTestingCommand({
    imports: [AppModule, SecretEncryptionRotationModule],
  }).compile();

  await cachedCommandModule.init();

  return cachedCommandModule;
};

export const runSecretEncryptionRotationCommand = async (
  args: string[] = [],
): Promise<void> => {
  const commandModule = await getOrCreateCommandModule();

  await CommandTestFactory.runWithoutClosing(commandModule, [
    ROTATE_COMMAND_NAME,
    ...args,
  ]);
};

export const closeSecretEncryptionRotationCommandModule =
  async (): Promise<void> => {
    if (cachedCommandModule === undefined) {
      return;
    }

    await cachedCommandModule.close();
    cachedCommandModule = undefined;
  };
