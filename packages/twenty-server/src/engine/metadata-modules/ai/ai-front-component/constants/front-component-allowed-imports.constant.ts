import { FRONT_COMPONENT_CORE_API_CLIENT_IMPORT_SPECIFIER } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-core-api-client-import-specifier.constant';
import { FRONT_COMPONENT_UI_IMPORTS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-ui-imports.constant';

export const FRONT_COMPONENT_ALLOWED_IMPORTS = [
  FRONT_COMPONENT_CORE_API_CLIENT_IMPORT_SPECIFIER,
  'react',
  'react-dom',
  'react/jsx-runtime',
  ...FRONT_COMPONENT_UI_IMPORTS,
];
