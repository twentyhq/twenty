import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';
import { unaccentText } from 'src/engine/core-modules/search/utils/unaccent-text';

describe('Unaccent Search Integration', () => {
  describe('JavaScript unaccent function', () => {
    it('should unaccent common diacritical marks', () => {
      expect(unaccentText('café')).toBe('cafe');
      expect(unaccentText('résumé')).toBe('resume');
      expect(unaccentText('naïve')).toBe('naive');
      expect(unaccentText('José García')).toBe('Jose Garcia');
      expect(unaccentText('François Müller')).toBe('Francois Muller');
      expect(unaccentText('Åsa Ström')).toBe('Asa Strom');
      expect(unaccentText('Björk')).toBe('Bjork');
      expect(unaccentText('Zürich')).toBe('Zurich');
      expect(unaccentText('Piñata')).toBe('Pinata');
    });

    it('should handle empty and null values', () => {
      expect(unaccentText('')).toBe('');
      expect(unaccentText(null as any)).toBe(null);
      expect(unaccentText(undefined as any)).toBe(undefined);
    });

    it('should preserve non-accented text', () => {
      expect(unaccentText('Hello World')).toBe('Hello World');
      expect(unaccentText('123 ABC xyz')).toBe('123 ABC xyz');
      expect(unaccentText('Company Inc.')).toBe('Company Inc.');
    });
  });

  describe('computeWhereConditionParts with unaccent', () => {
    it('should handle search operator with accented characters', () => {
      const result = computeWhereConditionParts({
        operator: 'search',
        objectNameSingular: 'person',
        key: 'searchField',
        value: 'café',
      });

      // Should use unaccent_immutable in both the text search and ILIKE
      expect(result.sql).toContain('public.unaccent_immutable(:searchField');
      expect(result.sql).toContain(
        'public.unaccent_immutable("person"."searchField"::text)',
      );

      // Should have parameters for both tsquery and ILIKE
      const paramKeys = Object.keys(result.params);

      expect(paramKeys).toHaveLength(2);
      expect(paramKeys.some((key) => key.endsWith('Ts'))).toBe(true);
      expect(paramKeys.some((key) => key.endsWith('Like'))).toBe(true);
    });

    it('should create proper SQL for unaccent search with various accented characters', () => {
      const testCases = [
        { value: 'résumé', description: 'French accents' },
        { value: 'naïve', description: 'Diaeresis' },
        { value: 'José', description: 'Spanish accents' },
        { value: 'François', description: 'Cedilla' },
      ];

      testCases.forEach(({ value }) => {
        const result = computeWhereConditionParts({
          operator: 'search',
          objectNameSingular: 'company',
          key: 'name',
          value,
        });

        expect(result.sql).toMatch(
          /\(\s*"company"\."name" @@ to_tsquery\('simple', public\.unaccent_immutable\(:name[a-z0-9]+Ts\)\) OR\s*public\.unaccent_immutable\("company"\."name"::text\) ILIKE public\.unaccent_immutable\(:name[a-z0-9]+Like\)\s*\)/,
        );

        // Verify parameters are properly set
        const paramKeys = Object.keys(result.params);
        const tsParam = paramKeys.find((key) => key.endsWith('Ts'));
        const likeParam = paramKeys.find((key) => key.endsWith('Like'));

        expect(tsParam).toBeDefined();
        expect(likeParam).toBeDefined();
        expect(result.params[likeParam!]).toBe(`%${value}%`);
      });
    });

    it('should verify unaccent database extension is available', async () => {
      // Check if unaccent extension exists in the database
      const extensionCheck = await global.testDataSource.query(`
        SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'unaccent')
      `);

      expect(extensionCheck[0].exists).toBe(true);

      // Check if unaccent_immutable function exists
      const functionCheck = await global.testDataSource.query(`
        SELECT EXISTS(
          SELECT 1 FROM information_schema.routines
          WHERE routine_name = 'unaccent_immutable'
        )
      `);

      expect(functionCheck[0].exists).toBe(true);
    });

    it('should perform accent-insensitive search with real database', async () => {
      // Create a temporary test table for this test
      await global.testDataSource.query(`
        CREATE TEMPORARY TABLE test_unaccent_search (
          id SERIAL PRIMARY KEY,
          content TEXT,
          search_vector tsvector
        )
      `);

      // Insert test data with accented characters
      await global.testDataSource.query(`
        INSERT INTO test_unaccent_search (content, search_vector) VALUES
        ('café restaurant', to_tsvector('simple', public.unaccent_immutable('café restaurant'))),
        ('naïve approach', to_tsvector('simple', public.unaccent_immutable('naïve approach'))),
        ('résumé template', to_tsvector('simple', public.unaccent_immutable('résumé template'))),
        ('regular text', to_tsvector('simple', public.unaccent_immutable('regular text')))
      `);

      // Test 1: Search for 'cafe' should find 'café restaurant'
      const result1 = await global.testDataSource.query(`
        SELECT content FROM test_unaccent_search
        WHERE search_vector @@ to_tsquery('simple', public.unaccent_immutable('cafe'))
      `);

      expect(result1).toHaveLength(1);
      expect(result1[0].content).toBe('café restaurant');

      // Test 2: Search for 'naive' should find 'naïve approach'
      const result2 = await global.testDataSource.query(`
        SELECT content FROM test_unaccent_search
        WHERE search_vector @@ to_tsquery('simple', public.unaccent_immutable('naive'))
      `);

      expect(result2).toHaveLength(1);
      expect(result2[0].content).toBe('naïve approach');

      // Test 3: Search for 'resume' should find 'résumé template'
      const result3 = await global.testDataSource.query(`
        SELECT content FROM test_unaccent_search
        WHERE search_vector @@ to_tsquery('simple', public.unaccent_immutable('resume'))
      `);

      expect(result3).toHaveLength(1);
      expect(result3[0].content).toBe('résumé template');
    });

    it('should perform accent-insensitive ILIKE search', async () => {
      // Create temporary test table
      await global.testDataSource.query(`
        CREATE TEMPORARY TABLE test_unaccent_ilike (
          id SERIAL PRIMARY KEY,
          name TEXT
        )
      `);

      // Insert test data
      await global.testDataSource.query(`
        INSERT INTO test_unaccent_ilike (name) VALUES
        ('José García'),
        ('François Müller'),
        ('Åsa Lindström'),
        ('John Smith')
      `);

      // Test accent-insensitive ILIKE search
      const result1 = await global.testDataSource.query(`
        SELECT name FROM test_unaccent_ilike
        WHERE public.unaccent_immutable(name) ILIKE public.unaccent_immutable('%jose%')
      `);

      expect(result1).toHaveLength(1);
      expect(result1[0].name).toBe('José García');

      const result2 = await global.testDataSource.query(`
        SELECT name FROM test_unaccent_ilike
        WHERE public.unaccent_immutable(name) ILIKE public.unaccent_immutable('%francois%')
      `);

      expect(result2).toHaveLength(1);
      expect(result2[0].name).toBe('François Müller');

      const result3 = await global.testDataSource.query(`
        SELECT name FROM test_unaccent_ilike
        WHERE public.unaccent_immutable(name) ILIKE public.unaccent_immutable('%asa%')
      `);

      expect(result3).toHaveLength(1);
      expect(result3[0].name).toBe('Åsa Lindström');
    });

    it('should handle both tsquery and ILIKE in combined search', async () => {
      // Create test table with tsvector column
      await global.testDataSource.query(`
        CREATE TEMPORARY TABLE test_unaccent_combined (
          id SERIAL PRIMARY KEY,
          title TEXT,
          search_vector tsvector
        )
      `);

      // Insert test data
      await global.testDataSource.query(`
        INSERT INTO test_unaccent_combined (title, search_vector) VALUES
        ('Café du Monde', to_tsvector('simple', public.unaccent_immutable('Café du Monde'))),
        ('Naïve Bayes Algorithm', to_tsvector('simple', public.unaccent_immutable('Naïve Bayes Algorithm'))),
        ('El Niño Weather Pattern', to_tsvector('simple', public.unaccent_immutable('El Niño Weather Pattern')))
      `);

      // Test combined search like the actual implementation
      const searchTerm = 'cafe';
      const result = await global.testDataSource.query(
        `
        SELECT title FROM test_unaccent_combined
        WHERE (
          search_vector @@ to_tsquery('simple', public.unaccent_immutable($1)) OR
          public.unaccent_immutable(title) ILIKE public.unaccent_immutable($2)
        )
      `,
        [searchTerm, `%${searchTerm}%`],
      );

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Café du Monde');
    });
  });

  describe('Search service with JavaScript unaccent approach', () => {
    it('should test JavaScript-side unaccent integration', async () => {
      // Create test table mimicking workspace table structure
      await global.testDataSource.query(`
        CREATE TEMPORARY TABLE test_search_service (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT,
          "searchVector" tsvector GENERATED ALWAYS AS (
            to_tsvector('simple', public.unaccent_immutable(COALESCE(name, '')))
          ) STORED
        )
      `);

      // Insert test data with accented characters (searchVector auto-generated)
      await global.testDataSource.query(`
        INSERT INTO test_search_service (name) VALUES
        ('Café du Commerce'),
        ('Résumé Services Inc'),
        ('Jose Garcia Plain'),
        ('Müller & Söhne GmbH')
      `);

      // Test the approach used in SearchService:
      // 1. JavaScript unaccents the search input: 'café' -> 'cafe'
      // 2. formatSearchTerms formats it: 'cafe' -> 'cafe:*'
      // 3. PostgreSQL searches the unaccented searchVector

      // Test 1: Search for accented input should find accented company
      const searchInput1 = 'café';
      const unaccentedInput1 = unaccentText(searchInput1);
      const formattedTerms1 = `${unaccentedInput1}:*`;

      const result1 = await global.testDataSource.query(`
        SELECT name FROM test_search_service
        WHERE "searchVector" @@ to_tsquery('simple', $1)
      `, [formattedTerms1]);

      expect(result1).toHaveLength(1);
      expect(result1[0].name).toBe('Café du Commerce');

      // Test 2: Search for 'resume' should find 'Résumé Services Inc'
      const searchInput2 = 'résumé'; // User types accented
      const unaccentedInput2 = unaccentText(searchInput2); // JavaScript unaccents to 'resume'
      const formattedTerms2 = `${unaccentedInput2}:*`; // Becomes 'resume:*'

      const result2 = await global.testDataSource.query(`
        SELECT name FROM test_search_service
        WHERE "searchVector" @@ to_tsquery('simple', $1)
      `, [formattedTerms2]);

      expect(result2).toHaveLength(1);
      expect(result2[0].name).toBe('Résumé Services Inc');

      // Test 3: Search for 'muller' should find 'Müller & Söhne GmbH'
      const searchInput3 = 'müller';
      const unaccentedInput3 = unaccentText(searchInput3);
      const formattedTerms3 = `${unaccentedInput3}:*`;

      const result3 = await global.testDataSource.query(`
        SELECT name FROM test_search_service
        WHERE "searchVector" @@ to_tsquery('simple', $1)
      `, [formattedTerms3]);

      expect(result3).toHaveLength(1);
      expect(result3[0].name).toBe('Müller & Söhne GmbH');

      // Test 4: Verify both accented and non-accented searches work for plain text
      const searchInput4a = 'jose'; // Non-accented search
      const searchInput4b = 'josé'; // Accented search
      const unaccentedInput4a = unaccentText(searchInput4a); // 'jose'
      const unaccentedInput4b = unaccentText(searchInput4b); // 'jose'
      const formattedTerms4 = `${unaccentedInput4a}:*`; // Both become 'jose:*'

      const result4 = await global.testDataSource.query(`
        SELECT name FROM test_search_service
        WHERE "searchVector" @@ to_tsquery('simple', $1)
      `, [formattedTerms4]);

      expect(result4).toHaveLength(1);
      expect(result4[0].name).toBe('Jose Garcia Plain');

      // Verify same result with accented search
      const formattedTerms4b = `${unaccentedInput4b}:*`;
      const result4b = await global.testDataSource.query(`
        SELECT name FROM test_search_service
        WHERE "searchVector" @@ to_tsquery('simple', $1)
      `, [formattedTerms4b]);

      expect(result4b).toHaveLength(1);
      expect(result4b[0].name).toBe('Jose Garcia Plain');
    });
  });
});
