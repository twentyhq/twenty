import { type ListItem, type PhrasingContent, type RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
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
  blocks: AppReadmeBlock[];
  hasSubheadings: boolean;
};

export type AppReadme = {
  intro: AppReadmeBlock[];
  sections: AppReadmeSection[];
};

const LEADING_EMOJI_PATTERN =
  /^(?:\p{Extended_Pictographic}|\u200D|\uFE0F|\s)+(?=\S)/u;
const TITLE_SEPARATOR_PATTERN = /^\s*(?:[:—–-]\s*)?/;

const serialize = (nodes: RootContent[]) =>
  toMarkdown(
    { type: 'root', children: nodes },
    { extensions: [gfmToMarkdown()] },
  ).trim();

const isAppNameHeading = (node: RootContent) =>
  node.type === 'heading' && node.depth === 1;

const isSectionHeading = (node: RootContent) =>
  node.type === 'heading' && node.depth === 2;

const isStandaloneBlock = (node: RootContent) =>
  node.type === 'list' || node.type === 'blockquote';

const toSectionTitle = (node: RootContent) =>
  toString(node).replace(LEADING_EMOJI_PATTERN, '').trim();

const toBodyInlineNodes = (
  inlineNodes: PhrasingContent[],
): PhrasingContent[] => {
  const [separatorNode, ...otherNodes] = inlineNodes;

  if (separatorNode?.type !== 'text') {
    return inlineNodes;
  }

  const value = capitalize(
    separatorNode.value.replace(TITLE_SEPARATOR_PATTERN, ''),
  );

  return value === ''
    ? otherNodes
    : [{ ...separatorNode, value }, ...otherNodes];
};

const toListItem = (item: ListItem): AppReadmeListItem => {
  const [firstChild, ...otherChildren] = item.children;
  const [leadingNode, ...otherInlineNodes] =
    firstChild?.type === 'paragraph' ? firstChild.children : [];

  if (leadingNode?.type !== 'strong') {
    return { markdown: serialize(item.children) };
  }

  return {
    title: toString(leadingNode).replace(/:$/, ''),
    markdown: serialize([
      { type: 'paragraph', children: toBodyInlineNodes(otherInlineNodes) },
      ...otherChildren,
    ]),
  };
};

const toBlock = (nodes: RootContent[]): AppReadmeBlock => {
  const [firstNode] = nodes;

  switch (firstNode.type) {
    case 'list':
      return {
        kind: 'list',
        ordered: firstNode.ordered ?? false,
        items: firstNode.children.map(toListItem),
      };
    case 'blockquote':
      return { kind: 'note', markdown: serialize(firstNode.children) };
    default:
      return { kind: 'text', markdown: serialize(nodes) };
  }
};

const groupProseNodes = (nodes: RootContent[]): RootContent[][] => {
  const groups: RootContent[][] = [];

  for (const node of nodes) {
    const previousGroup = groups.at(-1);

    if (
      isDefined(previousGroup) &&
      !isStandaloneBlock(node) &&
      !isStandaloneBlock(previousGroup[0])
    ) {
      previousGroup.push(node);
      continue;
    }

    groups.push([node]);
  }

  return groups;
};

const toBlocks = (nodes: RootContent[]) => groupProseNodes(nodes).map(toBlock);

export const parseAppReadme = (markdown: string): AppReadme => {
  const root = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const introNodes: RootContent[] = [];
  const sections: { title: string; nodes: RootContent[] }[] = [];

  for (const node of root.children) {
    if (isAppNameHeading(node)) {
      continue;
    }

    if (isSectionHeading(node)) {
      sections.push({ title: toSectionTitle(node), nodes: [] });
      continue;
    }

    (sections.at(-1)?.nodes ?? introNodes).push(node);
  }

  return {
    intro: toBlocks(introNodes),
    sections: sections.map(({ title, nodes }) => ({
      title,
      blocks: toBlocks(nodes),
      hasSubheadings: nodes.some((node) => node.type === 'heading'),
    })),
  };
};
