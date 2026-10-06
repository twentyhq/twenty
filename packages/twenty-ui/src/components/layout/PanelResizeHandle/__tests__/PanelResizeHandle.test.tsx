import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { PanelResizeHandle } from '../PanelResizeHandle';

runComponentConformance({
  name: 'PanelResizeHandle edge',
  element: (
    <PanelResizeHandle edge="right" size={200} minSize={100} maxSize={300} />
  ),
  refInstanceOf: HTMLDivElement,
});

runComponentConformance({
  name: 'PanelResizeHandle gap',
  element: (
    <PanelResizeHandle
      edge="top"
      size={200}
      placement="gap"
      gapSize={12}
      minSize={100}
      maxSize={300}
    />
  ),
  refInstanceOf: HTMLDivElement,
});
