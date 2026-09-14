const FENCE_OPENING_PATTERN = /^(\s*)(`{3,}|~{3,})[ \t]*(\S*)/;
const FENCE_CLOSING_PATTERN = /^\s*(`{3,}|~{3,})\s*$/;
const EXAMPLE_LANGUAGES = ['ts', 'tsx'] as const;

type OpenFence = {
  indentation: number;
  marker: string;
  language: string;
  codeLines: string[];
};

const isExampleLanguage = (
  language: string,
): language is (typeof EXAMPLE_LANGUAGES)[number] =>
  EXAMPLE_LANGUAGES.some((exampleLanguage) => exampleLanguage === language);

const closesFence = (line: string, fence: OpenFence): boolean => {
  const marker = FENCE_CLOSING_PATTERN.exec(line)?.[1];

  return (
    marker !== undefined &&
    marker[0] === fence.marker[0] &&
    marker.length >= fence.marker.length
  );
};

const removeIndentation = (line: string, indentation: number): string => {
  const leadingWhitespace = line.length - line.trimStart().length;

  return line.slice(Math.min(leadingWhitespace, indentation));
};

export const extractDocumentationExamples = (
  content: string,
): { language: 'ts' | 'tsx'; code: string }[] => {
  const examples: { language: 'ts' | 'tsx'; code: string }[] = [];
  let openFence: OpenFence | null = null;

  for (const line of content.split(/\r?\n/)) {
    if (openFence === null) {
      const opening = FENCE_OPENING_PATTERN.exec(line);

      if (opening) {
        openFence = {
          indentation: opening[1].length,
          marker: opening[2],
          language: opening[3].toLowerCase(),
          codeLines: [],
        };
      }

      continue;
    }

    if (!closesFence(line, openFence)) {
      openFence.codeLines.push(removeIndentation(line, openFence.indentation));
      continue;
    }

    if (isExampleLanguage(openFence.language)) {
      examples.push({
        language: openFence.language,
        code: `${openFence.codeLines.join('\n')}\n`,
      });
    }

    openFence = null;
  }

  return examples;
};
