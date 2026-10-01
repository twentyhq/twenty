export const measureItemWidths = ({
  items,
  itemElements,
  shouldMeasureNaturalWidths,
}: {
  items: HTMLElement;
  itemElements: Element[];
  shouldMeasureNaturalWidths: boolean;
}) => {
  if (!shouldMeasureNaturalWidths) {
    return itemElements.map((item) => item.clientWidth);
  }

  items.setAttribute('data-measuring', '');
  const naturalItemWidths = itemElements.map((item) => item.clientWidth);
  items.removeAttribute('data-measuring');

  return naturalItemWidths;
};
