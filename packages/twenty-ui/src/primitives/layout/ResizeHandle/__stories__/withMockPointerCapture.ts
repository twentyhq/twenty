import { spyOn } from 'storybook/test';

export const withMockPointerCapture = async ({
  handle,
  run,
}: {
  handle: HTMLElement;
  run: () => Promise<void>;
}) => {
  const setPointerCapture = spyOn(
    handle,
    'setPointerCapture',
  ).mockImplementation(() => undefined);
  const releasePointerCapture = spyOn(
    handle,
    'releasePointerCapture',
  ).mockImplementation(() => undefined);
  const hasPointerCapture = spyOn(handle, 'hasPointerCapture').mockReturnValue(
    true,
  );

  try {
    await run();
  } finally {
    setPointerCapture.mockRestore();
    releasePointerCapture.mockRestore();
    hasPointerCapture.mockRestore();
  }
};
