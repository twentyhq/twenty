export const measureItemWidths = ({
  itemElements,
  supportsSynchronousLayout,
}: {
  itemElements: Element[];
  supportsSynchronousLayout: boolean;
}) => {
  if (!supportsSynchronousLayout) {
    return itemElements.map((item) => item.scrollWidth);
  }

  for (const item of itemElements) {
    item.setAttribute('data-measuring', '');
  }

  const naturalItemWidths = itemElements.map((item) => item.clientWidth);

  for (const item of itemElements) {
    item.removeAttribute('data-measuring');
  }

  return naturalItemWidths;
};
