import { FRONT_COMPONENT_UI_IMPORTS } from 'twenty-shared/front-component-build';

export const FRONT_COMPONENT_UI_INSTRUCTIONS = `
Use Twenty's UI components from these imports: ${FRONT_COMPONENT_UI_IMPORTS.join(', ')}.
Twenty supplies styles, theme and ThemeProvider. Export a named Component with no props and no default export.
Before writing JSX, call get_front_component_ui_docs for every Twenty UI component you plan to use. Follow the existing guides for imports, composition, props and examples. Omit names to discover supported components. Read theming for theme tokens.
Load records with CoreApiClient from twenty-client-sdk/core, matching the preview query. Select edges.node, totalCount and pageInfo.hasNextPage. Preview intercepts these reads with sample data; the saved component uses the normal app client.
Use React hooks explicitly imported from react. Keep one source file, use inline theme tokens for layout and wrap controls to fit a 300px-wide widget. Do not embed sample records in source, make external requests, or mutate records.
`;
