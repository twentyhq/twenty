export const MODAL: {
  size: { [key: string]: { width?: string; height?: string } };
} = {
  size: {
    sm: {
      width: '300px',
    },
    md: {
      width: '400px',
    },
    lg: {
      width: '53%',
    },
    xl: {
      width: '1200px',
      height: '800px',
    },
    fullscreen: {
      width: 'calc(100dvw / var(--t-zoom, 1))',
      height: 'calc(100dvh / var(--t-zoom, 1))',
    },
  },
};
