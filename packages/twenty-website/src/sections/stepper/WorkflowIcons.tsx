import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

// The workflow nodes' mini glyphs (authored scene artwork, verbatim).
export type WorkflowIconName =
  | 'playlistAdd'
  | 'plus'
  | 'reload'
  | 'repeat'
  | 'search'
  | 'send';

function IconPlaylistAdd() {
  return (
    <svg
      fill="none"
      height={16}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={16}
    >
      <path d="M19 8h-14" />
      <path d="M5 12h9" />
      <path d="M11 16h-6" />
      <path d="M15 16h6" />
      <path d="M18 13v6" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg
      fill="none"
      height={16}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={16}
    >
      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
      <path d="M21 21l-6 -6" />
    </svg>
  );
}

function IconRepeat() {
  return (
    <svg
      fill="none"
      height={16}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={16}
    >
      <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
      <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
    </svg>
  );
}

// The send node draws in its own amber ink, verbatim.
function IconSend() {
  return (
    <svg
      fill="none"
      height={16}
      stroke={PRODUCT_STEPPER_SCENE.workflow.amber}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={16}
    >
      <path d="M10 14l11 -11" />
      <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
    </svg>
  );
}

function IconReload() {
  return (
    <svg
      fill="none"
      height={16}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={16}
    >
      <path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1.002 7.935 1.007 9.425 4.747" />
      <path d="M20 4v5h-5" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg
      fill="none"
      height={16}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={16}
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function WorkflowCheckGlyph({ color }: { color: string }) {
  return (
    <svg
      fill="none"
      height="8"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      width="8"
    >
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );
}

export const WORKFLOW_GLYPHS = {
  Check: WorkflowCheckGlyph,
  nodes: {
    playlistAdd: IconPlaylistAdd,
    plus: IconPlus,
    reload: IconReload,
    repeat: IconRepeat,
    search: IconSearch,
    send: IconSend,
  },
};
