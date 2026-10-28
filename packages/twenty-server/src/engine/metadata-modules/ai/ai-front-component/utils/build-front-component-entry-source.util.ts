import { msg } from '@lingui/core/macro';
import { PageLayoutType } from 'twenty-shared/types';
import { z } from 'zod';

import { FRONT_COMPONENT_WRAPPER_NAME } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-wrapper-name.constant';
import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
import { frontComponentQuerySchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-query.schema';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';

const frontComponentEntryOptionsSchema = z.object({
  query: frontComponentQuerySchema,
  pageLayoutType: z.enum([
    PageLayoutType.DASHBOARD,
    PageLayoutType.RECORD_PAGE,
  ]),
});

export const buildFrontComponentEntrySource = ({
  componentId,
  name,
  source,
  query,
  pageLayoutType,
}: FrontComponentBuildInput): string => {
  const parsedOptions = frontComponentEntryOptionsSchema.safeParse({
    query,
    pageLayoutType,
  });

  if (!parsedOptions.success) {
    throw new FrontComponentBuildException({
      message: parsedOptions.error.message,
      code: 'INVALID_INPUT',
      userFriendlyMessage: msg`Invalid front component settings.`,
    });
  }

  return `import { defineFrontComponent } from 'twenty-sdk/define';
import type { ComponentProps as TwentyComponentProps } from 'react';
import { ThemeProvider as TwentyThemeProvider } from 'twenty-ui/theme';
import { PageLayoutType as TwentyPageLayoutType } from 'twenty-shared/types';
import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';
${source}
export const componentQuery = ${JSON.stringify(parsedOptions.data.query)};
function ${FRONT_COMPONENT_WRAPPER_NAME}(props: TwentyComponentProps<typeof Component>) {
  return <TwentyThemeProvider colorScheme="light"><Component {...props} /></TwentyThemeProvider>;
}
export default defineFrontComponent({
  universalIdentifier: ${JSON.stringify(componentId)},
  name: ${JSON.stringify(name)},
  component: ${FRONT_COMPONENT_WRAPPER_NAME},
  widgetAvailability: { pageLayoutType: TwentyPageLayoutType.${parsedOptions.data.pageLayoutType} },
});
`;
};
