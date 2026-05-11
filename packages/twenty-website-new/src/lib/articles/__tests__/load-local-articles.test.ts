import fs from 'fs';
import os from 'os';
import path from 'path';

import { loadLocalArticlesFromDirectory } from '../load-local-articles';

function createTempDirectory(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'twenty-articles-'));
}

function writePost(directoryPath: string, fileName: string, content: string) {
  fs.writeFileSync(path.join(directoryPath, fileName), content);
}

describe('loadLocalArticlesFromDirectory', () => {
  it('loads valid posts sorted by date descending', () => {
    const directoryPath = createTempDirectory();

    writePost(
      directoryPath,
      'older-post.mdx',
      `---
title: Older post
description: Older description
date: 2026-01-01
tags:
  - CRM
---

Older body.`,
    );
    writePost(
      directoryPath,
      'newer-post.mdx',
      `---
title: Newer post
description: Newer description
date: 2026-02-01
author: Twenty Team
---

Newer body.`,
    );

    const posts = loadLocalArticlesFromDirectory(directoryPath);

    expect(posts.map((post) => post.slug)).toEqual([
      'newer-post',
      'older-post',
    ]);
    expect(posts[0]).toMatchObject({
      author: 'Twenty Team',
      date: '2026-02-01',
      description: 'Newer description',
      draft: false,
      title: 'Newer post',
    });
    expect(posts[1].tags).toEqual(['CRM']);
  });

  it('trims tag strings after validating', () => {
    const directoryPath = createTempDirectory();

    writePost(
      directoryPath,
      'tagged-post.mdx',
      `---
title: Tagged post
description: Tagged description
date: 2026-03-01
tags:
  - "  CRM  "
  - product
---

Body.`,
    );

    const posts = loadLocalArticlesFromDirectory(directoryPath);

    expect(posts[0].tags).toEqual(['CRM', 'product']);
  });

  it('fails loudly when required frontmatter is missing', () => {
    const directoryPath = createTempDirectory();

    writePost(
      directoryPath,
      'broken-post.mdx',
      `---
title: Broken post
date: 2026-01-01
---

Body.`,
    );

    expect(() => loadLocalArticlesFromDirectory(directoryPath)).toThrow(
      'missing "description"',
    );
  });

  it('rejects non-kebab-case slugs', () => {
    const directoryPath = createTempDirectory();

    writePost(
      directoryPath,
      'Invalid Slug.mdx',
      `---
title: Invalid post
description: Invalid description
date: 2026-01-01
---

Body.`,
    );

    expect(() => loadLocalArticlesFromDirectory(directoryPath)).toThrow(
      'Use lowercase kebab-case',
    );
  });

  it('rejects invalid dates', () => {
    const directoryPath = createTempDirectory();

    writePost(
      directoryPath,
      'invalid-date.mdx',
      `---
title: Invalid date
description: Invalid date description
date: not-a-date
---

Body.`,
    );

    expect(() => loadLocalArticlesFromDirectory(directoryPath)).toThrow(
      'has invalid date',
    );
  });
});
