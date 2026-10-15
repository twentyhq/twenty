export const applyInterfaceScale = (scale: number) => {
  const rootStyle = document.documentElement.style;
  const previousZoom = rootStyle.getPropertyValue('zoom');
  const previousScale = rootStyle.getPropertyValue('--t-zoom');

  rootStyle.setProperty('--t-zoom', String(scale));
  rootStyle.setProperty('zoom', 'var(--t-zoom)');

  return () => {
    rootStyle.setProperty('zoom', previousZoom);
    rootStyle.setProperty('--t-zoom', previousScale);
  };
};
