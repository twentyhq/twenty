import { collection, config, fields } from '@keystatic/core';
import { wrapper } from '@keystatic/core/content-components';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    developers: collection({
      label: 'Technical documentation',
      slugField: 'title',
      path: 'src/content/developers/**',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        icon: fields.text({ label: 'Icon' }),
        image: fields.text({ label: 'Image' }),
        info: fields.text({ label: 'Info' }),
        content: fields.mdx({
          label: 'Content',
          components: {
            ArticleEditContent: wrapper({
              label: 'ArticleEditContent',
              schema: {},
            }),
          },
        }),
      },
    }),
  },
});
