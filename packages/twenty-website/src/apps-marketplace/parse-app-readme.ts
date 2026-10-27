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

const FENCE_PATTERN = /^\s*(```|~~~)/;
const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const LIST_ITEM_PATTERN = /^([-*+]|\d+[.)])\s+(.*)$/;
const LEADING_EMOJI_PATTERN =
  /^(?:\p{Extended_Pictographic}|\u200D|\uFE0F|\s)+(?=\S)/u;
const BOLD_LEAD_PATTERN = /^\*\*(.+?)\*\*\s*(?:[:—–-]\s*)?/;

const splitRawBlocks = (markdown: string): string[][] => {
  const blocks: string[][] = [];
  let current: string[] = [];
  let isInFence = false;

  const flush = () => {
    if (current.length > 0) {
      blocks.push(current);
      current = [];
    }
  };

  for (const line of markdown.split(/\r?\n/)) {
    if (FENCE_PATTERN.test(line)) {
      isInFence = !isInFence;
      current.push(line);
      continue;
    }

    if (isInFence) {
      current.push(line);
      continue;
    }

    if (line.trim() === '') {
      flush();
      continue;
    }

    if (HEADING_PATTERN.test(line)) {
      flush();
      blocks.push([line]);
      continue;
    }

    current.push(line);
  }

  flush();

  return blocks;
};

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

const toListItem = (lines: string[]): AppReadmeListItem => {
  const markdown = lines.join('\n').trim();
  const boldLead = markdown.match(BOLD_LEAD_PATTERN);

  if (boldLead === null) {
    return { markdown };
  }

  return {
    title: boldLead[1].replace(/:$/, ''),
    markdown: capitalize(markdown.slice(boldLead[0].length).trim()),
  };
};

const toListBlock = (lines: string[]): AppReadmeBlock => {
  const itemLines: string[][] = [];

  for (const line of lines) {
    const itemMatch = line.match(LIST_ITEM_PATTERN);

    if (itemMatch !== null) {
      itemLines.push([itemMatch[2]]);
    } else {
      itemLines[itemLines.length - 1].push(line.replace(/^ {1,4}/, ''));
    }
  }

  return {
    kind: 'list',
    ordered: /^\d/.test(lines[0]),
    items: itemLines.map(toListItem),
  };
};

const toBlock = (lines: string[]): AppReadmeBlock => {
  if (lines.every((line) => line.startsWith('>'))) {
    return {
      kind: 'note',
      markdown: lines.map((line) => line.replace(/^>\s?/, '')).join('\n'),
    };
  }

  if (LIST_ITEM_PATTERN.test(lines[0])) {
    return toListBlock(lines);
  }

  return { kind: 'text', markdown: lines.join('\n') };
};

// Loose lists and wrapped paragraphs arrive as several raw blocks
const appendBlock = (blocks: AppReadmeBlock[], block: AppReadmeBlock) => {
  const previous = blocks[blocks.length - 1];

  if (
    previous?.kind === 'list' &&
    block.kind === 'list' &&
    previous.ordered === block.ordered
  ) {
    previous.items.push(...block.items);
    return;
  }

  if (previous?.kind === 'text' && block.kind === 'text') {
    previous.markdown = `${previous.markdown}\n\n${block.markdown}`;
    return;
  }

  blocks.push(block);
};

export const parseAppReadme = (markdown: string): AppReadme => {
  const readme: AppReadme = { intro: [], sections: [] };

  for (const lines of splitRawBlocks(markdown)) {
    const heading = lines[0].match(HEADING_PATTERN);
    const currentSection = readme.sections[readme.sections.length - 1];

    // The page hero already shows the app name
    if (heading !== null && heading[1].length === 1) {
      continue;
    }

    if (heading !== null && heading[1].length === 2) {
      readme.sections.push({
        title: heading[2].replace(LEADING_EMOJI_PATTERN, '').trim(),
        markdown: '',
        blocks: [],
        hasSubheadings: false,
      });
      continue;
    }

    if (currentSection !== undefined) {
      currentSection.markdown = [currentSection.markdown, lines.join('\n')]
        .filter((part) => part !== '')
        .join('\n\n');
      currentSection.hasSubheadings ||= heading !== null;
    }

    appendBlock(currentSection?.blocks ?? readme.intro, toBlock(lines));
  }

  return readme;
};
