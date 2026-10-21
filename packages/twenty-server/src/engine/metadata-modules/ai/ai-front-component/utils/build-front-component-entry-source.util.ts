import { FRONT_COMPONENT_WRAPPER_NAME } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-wrapper-name.constant';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';

export const buildFrontComponentEntrySource = ({
  componentId,
  name,
  source,
  query,
  pageLayoutType,
}: FrontComponentBuildInput): string => `import { defineFrontComponent } from 'twenty-sdk/define';
import type { ComponentProps as TwentyComponentProps } from 'react';
import { ThemeProvider as TwentyThemeProvider } from 'twenty-ui/theme';
import { PageLayoutType as TwentyPageLayoutType } from 'twenty-shared/types';
import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';
${source}
export const componentQuery = ${JSON.stringify(query)};
function ${FRONT_COMPONENT_WRAPPER_NAME}(props: TwentyComponentProps<typeof Component>) {
  return <TwentyThemeProvider colorScheme="light"><Component {...props} /></TwentyThemeProvider>;
}
export default defineFrontComponent({
  universalIdentifier: ${JSON.stringify(componentId)},
  name: ${JSON.stringify(name)},
  component: ${FRONT_COMPONENT_WRAPPER_NAME},
  widgetAvailability: { pageLayoutType: TwentyPageLayoutType.${pageLayoutType} },
});
`;
