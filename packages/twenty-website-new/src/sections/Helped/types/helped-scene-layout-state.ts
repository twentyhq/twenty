type HelpedSceneLayoutMeasurements = {
  cardCount: number;
  cardWidth: number;
  innerHeight: number;
  innerWidth: number;
  isDesktop: boolean;
  progressMetrics: { exitTargetTop: number; lastCardHeight: number } | null;
  progressScale: number;
  sectionHeight: number;
  viewportHeight: number;
};

export type HelpedSceneLayoutState = {
  measurements: HelpedSceneLayoutMeasurements | null;
};
