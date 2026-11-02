import { PageLayoutType } from 'twenty-shared/types';
import { z } from 'zod';

import { FRONT_COMPONENT_WRAPPER_NAME } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-wrapper-name.constant';
import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';

const frontComponentEntryOptionsSchema = z.object({
  pageLayoutType: z.enum([
    PageLayoutType.DASHBOARD,
    PageLayoutType.RECORD_PAGE,
  ]),
});

export const buildFrontComponentEntrySource = ({
  componentId,
  name,
  source,
  pageLayoutType,
}: FrontComponentBuildInput): string => {
  const parsedOptions = frontComponentEntryOptionsSchema.safeParse({
    pageLayoutType,
  });

  if (!parsedOptions.success) {
    throw new FrontComponentBuildException({
      message: parsedOptions.error.message,
      code: 'INVALID_SETTINGS',
    });
  }

  return `import { defineFrontComponent } from 'twenty-sdk/define';
import { ThemeProvider as TwentyThemeProvider } from 'twenty-ui/theme';
import { PageLayoutType as TwentyPageLayoutType } from 'twenty-shared/types';
import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';
${source}
function ${FRONT_COMPONENT_WRAPPER_NAME}() {
  return <TwentyThemeProvider colorScheme="light"><Component /></TwentyThemeProvider>;
}
export default defineFrontComponent({
  universalIdentifier: ${JSON.stringify(componentId)},
  name: ${JSON.stringify(name)},
  component: ${FRONT_COMPONENT_WRAPPER_NAME},
  widgetAvailability: { pageLayoutType: TwentyPageLayoutType.${parsedOptions.data.pageLayoutType} },
});
`;
};
