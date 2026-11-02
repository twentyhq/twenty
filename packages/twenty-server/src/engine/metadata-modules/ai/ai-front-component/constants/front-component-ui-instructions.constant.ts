import { FRONT_COMPONENT_UI_IMPORTS } from 'twenty-shared/front-component-build';

export const FRONT_COMPONENT_UI_INSTRUCTIONS = `
Use Twenty's UI components from these imports: ${FRONT_COMPONENT_UI_IMPORTS.join(', ')}.
Twenty supplies styles, theme and ThemeProvider. Export a named Component with no props and no default export.
Use Button and Input from twenty-ui/primitives/input, SearchInput from twenty-ui/components/input, Heading and Text from twenty-ui/primitives/typography, Badge from twenty-ui/primitives/data-display, and Card from twenty-ui/primitives/surfaces.
Button text is children, for example <Button variant="outline" size="sm" onClick={...}>Reset</Button>. Import icons from twenty-ui/icon.
Load records with CoreApiClient from twenty-client-sdk/core, matching the preview query. Select edges.node, totalCount and pageInfo.hasNextPage. Preview intercepts these reads with sample data; the saved component uses the normal app client.
Use React hooks explicitly imported from react. Keep one source file, use inline theme tokens for layout and wrap controls to fit a 300px-wide widget. Do not embed sample records in source, make external requests, or mutate records.
`;
