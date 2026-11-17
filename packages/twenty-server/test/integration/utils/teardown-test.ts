import 'tsconfig-paths/register';

import { describeOpenHandles } from './describe-open-handles.util';

export default async () => {
  await global.app.close();
  await global.testDataSource.destroy();

  const openHandles = await describeOpenHandles();

  if (openHandles.length > 0) {
    // oxlint-disable-next-line no-console
    console.warn(
      `Handles still open after teardown:\n${openHandles.join('\n')}`,
    );
  }
};
