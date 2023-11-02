import { CommandFactory } from 'nest-commander';

import { CommandModule } from './command.module';

async function bootstrap() {
  // TODO: inject our own logger service to handle the output (Sentry, etc.)
  await CommandFactory.run(CommandModule, ['warn', 'error']);
}
bootstrap();
