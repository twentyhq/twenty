import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { CodeEditorHeader } from '../CodeEditorHeader';

import styles from '../CodeEditorHeader.module.scss';

runComponentConformance({
  name: 'CodeEditorHeader',
  element: <CodeEditorHeader title="workspace.json" />,
  ownClassName: styles.editorHeader,
  refInstanceOf: HTMLDivElement,
  renderPropTagName: 'header',
});
