import {
  TWENTY_ICON_DICTIONARY,
  TWENTY_ICON_DICTIONARY_CATEGORIES,
  TWENTY_ICON_DICTIONARY_FIGMA_URL,
  type TwentyIconDictionaryEntry,
} from '../constants/TwentyIconDictionary';

const escapeMarkdownTableCell = (value: string) =>
  value.replace(/\|/g, '\\|').replace(/\n/g, ' ');

const getFigmaNodeUrl = (entry: TwentyIconDictionaryEntry) => {
  const url = new URL(TWENTY_ICON_DICTIONARY_FIGMA_URL);

  url.searchParams.set('node-id', entry.figmaNodeId.replace(':', '-'));

  return url.toString();
};

const getEntryTableRow = (entry: TwentyIconDictionaryEntry) =>
  `| [${escapeMarkdownTableCell(entry.label)}](${getFigmaNodeUrl(entry)}) | \`${entry.iconName}\` | \`${entry.tablerName}\` | ${escapeMarkdownTableCell(entry.useWhen)} | ${escapeMarkdownTableCell(entry.avoidWhen)} | ${entry.keywords.map(escapeMarkdownTableCell).join(', ')} |`;

export const generateTwentyIconDictionaryMarkdown = () => {
  const categorySections = TWENTY_ICON_DICTIONARY_CATEGORIES.map((category) => {
    const entries = TWENTY_ICON_DICTIONARY.filter(
      (entry) => entry.category === category.key,
    );

    return [
      `## ${category.label}`,
      '',
      '| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |',
      '| --- | --- | --- | --- | --- | --- |',
      ...entries.map(getEntryTableRow),
    ].join('\n');
  }).join('\n\n');

  return `# Twenty Icon Dictionary

<!-- This file is generated. Edit constants/TwentyIconDictionary.ts, then run: npx nx generateIconDictionary twenty-ui -->

This is the canonical engineering reference for icons that represent Twenty product concepts. The [Figma dictionary](${TWENTY_ICON_DICTIONARY_FIGMA_URL}) is the visual reference; the typed manifest in [\`constants/TwentyIconDictionary.ts\`](./constants/TwentyIconDictionary.ts) is the code source of truth.

## Selection rules

1. When a UI element represents one of the concepts below, use its canonical icon.
2. Use action icons such as \`IconPlus\`, \`IconEdit\`, or \`IconTrash\` when the element represents an action rather than a product concept.
3. Use status icons for statuses and feedback. Do not replace them with a nearby dictionary concept.
4. Import icons from \`twenty-ui/icon\`. Do not import directly from \`@tabler/icons-react\`.
5. If no concept matches, choose an existing icon from \`twenty-ui/icon\` and do not add a new icon package.

## Usage

\`\`\`tsx
import { IconHierarchy } from 'twenty-ui/icon';
\`\`\`

${categorySections}

## Updating the dictionary

1. Update the typed manifest in \`constants/TwentyIconDictionary.ts\`.
2. Confirm the visual choice in the linked Figma dictionary.
3. Run \`npx nx generateIconDictionary twenty-ui\`.
4. Review the \`UI/Icon/Icon Dictionary\` Storybook story.
5. Run \`npx jest packages/twenty-ui/src/icon/__tests__/TwentyIconDictionary.test.ts --config=packages/twenty-ui/jest.config.mjs\`.
`;
};
