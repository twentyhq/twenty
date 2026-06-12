// Slots staged for the AppPreview wave — mounted as reserved boxes, no
// visual yet, BY PLAN. The single declaration both batteries consume:
// the sweep tolerates them empty (and fails once they go live), the
// battery's spec-completeness check exempts them. Burn down per commit.
export const PENDING_VISUAL_SLOTS = new Set(['fast-path']);
