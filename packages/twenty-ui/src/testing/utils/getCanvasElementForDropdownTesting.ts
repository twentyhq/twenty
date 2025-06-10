import { isDefined } from 'twenty-shared/utils';
export const getCanvasElementForDropdownTesting = () => {
  const canvasElement = document.getElementsByClassName(
    'sb-show-main',
  )[0] as HTMLElement | null;

  if (!isDefined(canvasElement)) {
    throw new Error(
      `Canvas element not found for dropdown testing in storybook, verify that storybook still uses the class name "sb-show-main" for its body that displays stories.`,
    );
  }

  return canvasElement;
};
