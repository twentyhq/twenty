import { WebGlMount } from '@/lib/visual-runtime';
import { ReleaseNotes } from '@/sections/Hero/visuals/ReleaseNotes';

export function ReleaseNotesVisual() {
  return (
    <WebGlMount priority>
      <ReleaseNotes />
    </WebGlMount>
  );
}
