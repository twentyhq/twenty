import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ResizeHandle } from '../ResizeHandle';
import styles from '../ResizeHandle.module.scss';

runComponentConformance({
  name: 'ResizeHandle',
  element: <ResizeHandle />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.area,
});

runComponentConformance({
  name: 'ResizeHandle edge',
  element: <ResizeHandle edge="right" value={200} min={100} max={300} />,
  refInstanceOf: HTMLDivElement,
});

runComponentConformance({
  name: 'ResizeHandle gap',
  element: (
    <ResizeHandle
      edge="top"
      value={200}
      placement="gap"
      style={{ height: 12 }}
      min={100}
      max={300}
    />
  ),
  refInstanceOf: HTMLDivElement,
});
