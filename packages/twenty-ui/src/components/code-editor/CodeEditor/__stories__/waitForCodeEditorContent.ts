import { expect, waitFor } from 'storybook/test';

const NON_BREAKING_SPACE = ' ';
const CODE_EDITOR_LOAD_TIMEOUT_IN_MS = 20_000;

export const waitForCodeEditorContent = async (
  canvasElement: HTMLElement,
  expectedContent: string,
) => {
  await waitFor(
    () => {
      const renderedLines = canvasElement.querySelector('.view-lines');

      expect(
        renderedLines?.textContent?.split(NON_BREAKING_SPACE).join(' '),
      ).toContain(expectedContent);
    },
    { timeout: CODE_EDITOR_LOAD_TIMEOUT_IN_MS },
  );
};
