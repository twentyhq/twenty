import {
  IconBrain,
  IconCheck,
  IconFilter,
  IconPlaylistAdd,
  IconPlus,
  IconReload,
  IconSearch,
  IconSend,
} from '@tabler/icons-react';

export type WorkflowIconName =
  | 'brain'
  | 'filter'
  | 'playlistAdd'
  | 'plus'
  | 'reload'
  | 'search'
  | 'send';

const NODE_ICONS: Record<WorkflowIconName, typeof IconPlus> = {
  brain: IconBrain,
  filter: IconFilter,
  playlistAdd: IconPlaylistAdd,
  plus: IconPlus,
  reload: IconReload,
  search: IconSearch,
  send: IconSend,
};

function WorkflowCheckGlyph({ color }: { color: string }) {
  return <IconCheck color={color} size={8} stroke={2.5} />;
}

export const WORKFLOW_GLYPHS = {
  Check: WorkflowCheckGlyph,
  nodes: NODE_ICONS,
};
