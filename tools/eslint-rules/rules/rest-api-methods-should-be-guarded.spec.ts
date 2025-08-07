import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './rest-api-methods-should-be-guarded';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(UserAuthGuard)
          testMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(WorkspaceAuthGuard)
          testMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(PublicEndpoint)
          testMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(ApiKeyGuard)
          testMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(CaptchaGuard, PublicEndpoint)
          testMethod() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(UserAuthGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(PublicEndpoint)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(ApiKeyGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          regularMethod() {}
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
    },
    {
      code: `
        class TestController {
          @Post()
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(CaptchaGuard)
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
    },
    {
      code: `
        @UseGuards(CaptchaGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
    },
  ],
}); 