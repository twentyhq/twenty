import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Section } from '../Section';

import styles from '../SectionRoot.module.scss';

runComponentConformance({
  name: 'Section.Root',
  element: <Section.Root>Workspace settings</Section.Root>,
  ownClassName: styles.root,
  refInstanceOf: HTMLDivElement,
  renderPropTagName: 'section',
});
