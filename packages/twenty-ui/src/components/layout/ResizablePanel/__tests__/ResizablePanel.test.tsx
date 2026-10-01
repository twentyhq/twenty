import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ResizablePanel } from '../ResizablePanel';

runComponentConformance({
  name: 'ResizablePanel edge',
  element: <ResizablePanel side="right" min={100} max={300} />,
  refInstanceOf: HTMLDivElement,
});

runComponentConformance({
  name: 'ResizablePanel gap',
  element: (
    <ResizablePanel side="top" variant="gap" gapSize={12} min={100} max={300} />
  ),
  refInstanceOf: HTMLDivElement,
});
