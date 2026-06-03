// ── Propel §8.3 stage gating ─────────────────────────────────────────────────
// "Move a deal only when the work is actually done." A forward stage move is
// blocked unless the current stage's task (created by the §8.3 stage-entry emitter)
// is DONE. Reactive emitters create the next task; this gate enforces the inverse.
//
// Deliberate scope (the judgment-heavy part):
//   - Only FORWARD moves to a non-terminal stage are gated.
//   - Backward moves (corrections), same-stage edits, and moves TO a terminal/parked
//     stage (LOST/PARKED/etc.) always pass — you can always abandon or park.
//   - non-user contexts (apiKey/app/system) bypass; MANAGER tier (Admin / custom
//     "Manager" role) bypasses (override) — see PropelTierService.gateBypasses.
//   - If NO task exists for the current stage, allow (don't deadlock records created
//     before the engine, via import, or via API without a task).
//
// Each gated lane provides: its stage-field name, the ordered stage list, the set of
// terminal stages (always allowed as targets), and how to map a stage value to the
// task that represents "the work of that stage".

export type LaneGateConfig = {
  // ordered non-terminal stages, earliest → latest (index = order)
  orderedStages: string[];
  // stages that are always allowed as a move TARGET (terminal/abandon/park)
  terminalStages: string[];
  // the taskTarget link field for this object (e.g. targetSecondaryOpportunityId)
  taskTargetField: string;
  // the stage-entry task TITLE for each stage (matches the §8.3 emitter), so we can
  // find "the current stage's task". Keyed by stage value.
  stageTaskTitleByStage: Record<string, string>;
};

// Returns true if the move from `current` → `next` is a FORWARD move into a
// non-terminal stage (the only case we gate).
export const isGatedForwardMove = (
  cfg: LaneGateConfig,
  current: string | undefined,
  next: string,
): boolean => {
  if (!current || current === next) return false;
  if (cfg.terminalStages.includes(next)) return false; // abandon/park always ok

  const ci = cfg.orderedStages.indexOf(current);
  const ni = cfg.orderedStages.indexOf(next);
  // If either isn't in the ordered list (e.g. moving OUT of a terminal/parked
  // state forward), treat as allowed — only gate clean forward steps within order.
  if (ci === -1 || ni === -1) return false;
  return ni > ci;
};

// NOTE: bypass logic (non-user / MANAGER tier → no gate) now lives in
// PropelTierService.gateBypasses, since the tier is resolved from the user's
// Twenty role (async). StageGateService calls it before running the gate.
