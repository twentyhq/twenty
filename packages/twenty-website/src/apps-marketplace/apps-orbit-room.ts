// The room AppsHero leaves under its buttons for the orbit: whatever the
// first screen has left, so the ring shows on arrival, within bounds.
export const APPS_ORBIT_ROOM: { base: string; md: string } = {
  base: 'clamp(200px, calc(100svh - 560px), 280px)',
  md: 'clamp(220px, calc(100svh - 580px), 400px)',
};
