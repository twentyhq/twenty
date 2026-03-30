import { collection, config, fields } from '@keystatic/core';

// Reusable version pattern (avoids duplication)
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

export default config({
  storage: {
    kind: 'github',
    repo: {
      owner: 'twentyhq',
      name: 'twenty',
    },
    pathPrefix: 'packages/twenty-website',
  },

  collections: {
    releases: collection({
      label: 'Releases',
      slugField: 'release',
      path: 'src/content/releases/*',
      format: { contentField: 'content' },

      schema: {
        release: fields.slug({
          name: {
            label: 'Release',
            validation: {
              pattern: {
                regex: VERSION_REGEX,
                message: 'The release must be in the format major.minor.patch',
              },
            },
          },
          slug: {
            generate: (name) => name,
            validation: {
              pattern: {
                regex: VERSION_REGEX,
                message: 'The release must be in the format major.minor.patch',
              },
            },
          },
        }),

        // Keeping same behavior (text), just cleaner naming
        date: fields.text({
          label: 'Date',
          description: 'Prefer ISO format (YYYY-MM-DD)',
        }),

        content: fields.mdx({
          label: 'Content',
          options: {
            image: {
              directory: 'public/images/releases',
              publicPath: '/images/releases/',
            },
          },
        }),
      },

      // Safer + more defensive sorting logic
      parseSlugForSort: (slug) => {
        const parts = slug.split('.');

        // Fallback if malformed (prevents runtime crash)
        if (parts.length !== 3) return slug;

        const [major, minor, patch] = parts;

        return [
          major.padStart(4, '0'),
          minor.padStart(4, '0'),
          patch.padStart(4, '0'),
        ].join('.');
      },
    }),
  },
});
