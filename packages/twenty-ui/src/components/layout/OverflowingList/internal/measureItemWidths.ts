export const measureItemWidths = ({
  items,
  itemElements,
}: {
  items: HTMLElement;
  itemElements: Element[];
}) => {
  items.setAttribute('data-measuring', '');
  const naturalItemWidths = itemElements.map((item) => item.clientWidth);
  items.removeAttribute('data-measuring');

  return naturalItemWidths;
};
