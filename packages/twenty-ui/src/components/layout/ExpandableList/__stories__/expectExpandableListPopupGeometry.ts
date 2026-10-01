import { expect, waitFor } from 'storybook/test';

import { isDefined } from '@ui/utilities/utils/isDefined';

export const expectExpandableListPopupGeometry = async ({
  trigger,
  dialog,
}: {
  trigger: HTMLElement;
  dialog: HTMLElement;
}) => {
  const list = trigger.parentElement;

  if (!isDefined(list)) {
    throw new Error('The overflow trigger must be inside its list');
  }

  await waitFor(() => {
    const listRectangle = list.getBoundingClientRect();
    const dialogRectangle = dialog.getBoundingClientRect();
    const dialogStyle = getComputedStyle(dialog);
    const horizontalBorderAndPadding =
      parseFloat(dialogStyle.paddingLeft) +
      parseFloat(dialogStyle.paddingRight) +
      parseFloat(dialogStyle.borderLeftWidth) +
      parseFloat(dialogStyle.borderRightWidth);

    expect(dialogRectangle.top).toBeCloseTo(listRectangle.bottom - 9, 0);
    expect(dialogRectangle.width).toBeCloseTo(
      Math.max(220, listRectangle.width) + horizontalBorderAndPadding,
      0,
    );
  });
};
