import { tool } from 'ai';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { FRONT_COMPONENT_UI_IMPORTS } from 'twenty-shared/front-component-build';
import { z } from 'zod';
import { isDefined } from 'twenty-shared/utils';

import { ASSET_PATH } from 'src/constants/assets-path';

type UiDocumentation = {
  version: string;
  pages: {
    name: string;
    entryPoint?: string;
    content: string;
    api?: unknown;
  }[];
};

export const createGetFrontComponentUiDocsTool = () =>
  tool({
    description:
      'Read the existing Twenty UI guides and API reference before writing a frontend component. Returns imports, composition rules, examples and props. Omit names to list available documentation. Twenty supplies styles and ThemeProvider for previews and saved components.',
    inputSchema: z.object({
      names: z
        .array(z.string().min(1))
        .max(5)
        .default([])
        .describe(
          'Component names such as Card, Button and Tabs, or getting-started, theming, icons and accessibility. Request up to five at once.',
        ),
    }),
    execute: async ({ names }) => {
      const documentation: UiDocumentation = JSON.parse(
        await readFile(
          join(
            ASSET_PATH,
            'engine/metadata-modules/ai/ai-front-component/constants/ui-documentation.generated.json',
          ),
          'utf8',
        ),
      );
      const pages = documentation.pages.filter(
        (page) =>
          !isDefined(page.entryPoint) ||
          FRONT_COMPONENT_UI_IMPORTS.includes(page.entryPoint),
      );
      const availableNames = pages.map((page) => page.name);
      const unknownNames = names.filter(
        (name) => !availableNames.includes(name),
      );

      if (unknownNames.length > 0) {
        return {
          success: false,
          message: `Unknown or unsupported UI documentation: ${unknownNames.join(', ')}.`,
          result: { availableNames },
        };
      }

      return {
        success: true,
        result: {
          version: documentation.version,
          ...(names.length === 0
            ? { availableNames }
            : { pages: pages.filter((page) => names.includes(page.name)) }),
        },
      };
    },
  });
