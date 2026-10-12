export const measureItemWidths = ({
  items,
  itemElements,
  supportsSynchronousLayout,
}: {
  items: HTMLElement;
  itemElements: Element[];
  supportsSynchronousLayout: boolean;
}) => {
  if (!supportsSynchronousLayout) {
    return itemElements.map((item) => item.scrollWidth);
  }

  items.setAttribute('data-measuring', '');
  const naturalItemWidths = itemElements.map((item) =>
    Math.max(item.clientWidth, item.scrollWidth),
  );
  items.removeAttribute('data-measuring');

  return naturalItemWidths;
};
