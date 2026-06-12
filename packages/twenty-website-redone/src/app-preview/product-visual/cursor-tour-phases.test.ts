import { cursorTour } from './cursor-tour-phases';
import { cursorGlide } from './cursor-glide';

describe('cursorTour.nextPhaseIndex', () => {
  it('should advance through the tour', () => {
    expect(cursorTour.nextPhaseIndex(0, 17)).toBe(1);
    expect(cursorTour.nextPhaseIndex(15, 17)).toBe(16);
  });

  it('should loop back to the start after the last phase', () => {
    expect(cursorTour.nextPhaseIndex(16, 17)).toBe(0);
    expect(cursorTour.nextPhaseIndex(8, 9)).toBe(0);
  });
});

describe('cursorTour phase tables', () => {
  it('should keep the desktop tour at 17 phases and mobile at 9', () => {
    expect(cursorTour.DESKTOP_PHASES).toHaveLength(17);
    expect(cursorTour.MOBILE_PHASES).toHaveLength(9);
  });

  it('should only target record tabs that exist', () => {
    const tabTargets = [
      ...cursorTour.DESKTOP_PHASES,
      ...cursorTour.MOBILE_PHASES,
    ]
      .map((phase) => phase.target)
      .filter((target) => target.kind === 'tab')
      .map((target) => target.id);
    const validTabs = new Set([
      'Timeline',
      'Tasks',
      'Notes',
      'Files',
      'Emails',
      'Calendar',
    ]);
    expect(tabTargets.length).toBeGreaterThan(0);
    for (const id of tabTargets) {
      expect(validTabs.has(id)).toBe(true);
    }
  });

  it('should alternate the three cursors on mobile', () => {
    expect(
      cursorTour.MOBILE_PHASES.map((phase) => phase.activeCursor),
    ).toEqual([0, 0, 0, 1, 1, 1, 2, 2, 2]);
  });
});

describe('cursorGlide', () => {
  it('should clamp the glide duration to the authored hand speed', () => {
    expect(cursorGlide.forDistance(0)).toBe(620);
    expect(cursorGlide.forDistance(400)).toBe(720);
    expect(cursorGlide.forDistance(2000)).toBe(1000);
  });

  it('should measure percent distances against the overlay box', () => {
    expect(
      cursorGlide.pixelDistance(
        { left: 0, top: 0 },
        { left: 50, top: 0 },
        { width: 1000, height: 600 },
      ),
    ).toBe(500);
  });

  it('should skip sub-threshold hops', () => {
    expect(cursorGlide.SKIP_PX).toBe(6);
  });
});
