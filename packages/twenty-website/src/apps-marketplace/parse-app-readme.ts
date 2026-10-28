import { type ListItem, type Nodes, type RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { toString } from 'mdast-util-to-string';
import { gfm } from 'micromark-extension-gfm';
import { capitalize, isDefined } from 'twenty-shared/utils';

export type AppReadmeListItem = {
  title?: string;
  markdown: string;
};

export type AppReadmeBlock =
  | { kind: 'text'; markdown: string }
  | { kind: 'note'; markdown: string }
  | { kind: 'list'; ordered: boolean; items: AppReadmeListItem[] };

export type AppReadmeSection = {
  title: string;
  markdown: string;
  blocks: AppReadmeBlock[];
  hasSubheadings: boolean;
};

export type AppReadme = {
  intro: AppReadmeBlock[];
  sections: AppReadmeSection[];
};

const LEADING_EMOJI_PATTERN = /^(?:\p{Extended_Pictographic}|‍|️|\s)+(?=\S)/u;
const TITLE_SEPARATOR_PATTERN = /^\s*(?:[:—–-]\s*)?/;

const getStartOffset = (node: Nodes) => node.position?.start.offset ?? 0;

const getEndOffset = (node: Nodes) => node.position?.end.offset ?? 0;

const sliceSource = (source: string, first: Nodes, last: Nodes = first) =>
  source.slice(getStartOffset(first), getEndOffset(last));

// Continuation lines keep the list item's indentation in the source
const dedent = (text: string, indent: number) =>
  text.replace(new RegExp(`\\n {1,${Math.max(indent, 1)}}`, 'g'), '\n');

const toListItem = (source: string, item: ListItem): AppReadmeListItem => {
  const [firstChild] = item.children;
  const lastChild = item.children[item.children.length - 1];

  if (!isDefined(firstChild) || !isDefined(lastChild)) {
    return { markdown: '' };
  }

  const indent = (firstChild.position?.start.column ?? 1) - 1;
  const leadingNode =
    firstChild.type === 'paragraph' ? firstChild.children[0] : undefined;

  if (leadingNode?.type !== 'strong') {
    return {
      markdown: dedent(sliceSource(source, firstChild, lastChild), indent),
    };
  }

  const body = source
    .slice(getEndOffset(leadingNode), getEndOffset(lastChild))
    .replace(TITLE_SEPARATOR_PATTERN, '');

  return {
    title: toString(leadingNode).replace(/:$/, ''),
    markdown: capitalize(dedent(body, indent).trim()),
  };
};

const toBlock = (source: string, node: RootContent): AppReadmeBlock => {
  switch (node.type) {
    case 'blockquote':
      return {
        kind: 'note',
        markdown: sliceSource(source, node).replace(/^>\s?/gm, ''),
      };
    case 'list':
      return {
        kind: 'list',
        ordered: node.ordered === true,
        items: node.children.map((item) => toListItem(source, item)),
      };
    default:
      return { kind: 'text', markdown: sliceSource(source, node) };
  }
};

// Consecutive paragraphs, tables and code read as one block of prose
const appendBlock = (blocks: AppReadmeBlock[], block: AppReadmeBlock) => {
  const previous = blocks[blocks.length - 1];

  if (previous?.kind === 'text' && block.kind === 'text') {
    previous.markdown = `${previous.markdown}\n\n${block.markdown}`;
    return;
  }

  blocks.push(block);
};

export const parseAppReadme = (markdown: string): AppReadme => {
  const root = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const readme: AppReadme = { intro: [], sections: [] };

  for (const node of root.children) {
    const currentSection = readme.sections[readme.sections.length - 1];

    // The page hero already shows the app name
    if (node.type === 'heading' && node.depth === 1) {
      continue;
    }

    if (node.type === 'heading' && node.depth === 2) {
      readme.sections.push({
        title: toString(node).replace(LEADING_EMOJI_PATTERN, '').trim(),
        markdown: '',
        blocks: [],
        hasSubheadings: false,
      });
      continue;
    }

    if (isDefined(currentSection)) {
      currentSection.markdown = [
        currentSection.markdown,
        sliceSource(markdown, node),
      ]
        .filter((part) => part !== '')
        .join('\n\n');
      currentSection.hasSubheadings ||= node.type === 'heading';
    }

    appendBlock(
      currentSection?.blocks ?? readme.intro,
      toBlock(markdown, node),
    );
  }

  return readme;
};
