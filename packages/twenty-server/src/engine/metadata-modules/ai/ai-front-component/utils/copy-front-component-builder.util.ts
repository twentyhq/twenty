import { writeFile } from 'fs/promises';
import { join } from 'path';

import { getFrontComponentBuilderFiles } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-builder-files.util';

export const copyFrontComponentBuilder = async (directory: string) => {
  const files = await getFrontComponentBuilderFiles();

  await Promise.all(
    Object.entries(files).map(([name, content]) =>
      writeFile(join(directory, name), content),
    ),
  );
};
