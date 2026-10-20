export const FRONT_COMPONENT_UI_IMPORTS = [
  'twenty-ui/primitives/input',
  'twenty-ui/primitives/data-display',
  'twenty-ui/primitives/feedback',
  'twenty-ui/primitives/layout',
  'twenty-ui/primitives/navigation',
  'twenty-ui/primitives/surfaces',
  'twenty-ui/primitives/typography',
  'twenty-ui/components/input',
  'twenty-ui/icon',
  'twenty-ui/theme',
  'twenty-ui/style.css',
  'twenty-ui/theme-light.css',
];

export const FRONT_COMPONENT_UI_INSTRUCTIONS = `
Build the UI with Twenty's actual twenty-ui components. Supported imports: ${FRONT_COMPONENT_UI_IMPORTS.join(', ')}.
The runtime provides twenty-ui styles, the light theme and ThemeProvider automatically; do not add your own provider.
Use Button and Input from twenty-ui/primitives/input, SearchInput from twenty-ui/components/input, Heading and Text from twenty-ui/primitives/typography, Badge from twenty-ui/primitives/data-display, and Card from twenty-ui/primitives/surfaces.
Use <Button variant="outline" size="sm" onClick={...}>Reset</Button>; variants are solid, outline, ghost, soft, link, colors are neutral, accent, danger, success, sizes sm or md. Button text is children, not a title prop.
Use <SearchInput aria-label="Filter companies" placeholder="Search companies" value={filter} onChange={event => setFilter(event.target.value)} />.
Use <Heading level={2} size="md">Companies</Heading>, <Text>Summary</Text>, <Badge>{records.length}</Badge> and <Card.Root><Card.Header>Title</Card.Header><Card.Content>Content</Card.Content></Card.Root>.
Import icons from twenty-ui/icon, for example IconSearch or IconBuildingSkyscraper; Button accepts startIcon={<IconSearch size={16} />}. No external icon packages.
Use semantic HTML for tables and layout when needed, with inline styles referencing theme tokens such as var(--t-spacing-4), var(--t-font-color-primary), var(--t-background-primary). Use twenty-ui controls instead of hand-styled buttons and inputs. No root twenty-ui barrel, private paths, code editor, CDN, SDK, requests or record mutations.
The preview can be only 300px wide. Use wrapping flex layouts, stack headings above filters and actions, and avoid fixed widths so the same component also fits larger widgets.
`;
