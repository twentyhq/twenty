"""
Run Twenty metadata migrations.

Discovers all migration scripts in scripts/migrations/ (named NNN-description.py),
imports them in order, and calls run(client). Each migration is idempotent —
it checks for existing objects/fields and skips steps already done.

Usage:
    TWENTY_API_KEY=<key> python3 run-migrations.py [--api-url <url>] [--dry-run]

    Or set TWENTY_API_URL in the environment. Defaults to production.

To check what's applied to a target environment:
    TWENTY_API_KEY=<key> python3 run-migrations.py --status

To run a single migration:
    TWENTY_API_KEY=<key> python3 run-migrations.py --only 001-account-group
"""

import argparse
import importlib.util
import io
import os
import sys
from contextlib import redirect_stdout

sys.path.insert(0, os.path.dirname(__file__))
from meta_client import MetaClient

API_URL = os.environ.get(
    'TWENTY_API_URL',
    'https://twenty-production-4ce5.up.railway.app/graphql',
)
API_KEY = os.environ.get('TWENTY_API_KEY', '')


def load_migrations(migrations_dir: str) -> list[tuple[str, object]]:
    files = sorted(
        f for f in os.listdir(migrations_dir)
        if f.endswith('.py') and f[0].isdigit()
    )
    migrations = []
    for fname in files:
        migration_id = fname[:-3]  # strip .py
        spec = importlib.util.spec_from_file_location(
            migration_id, os.path.join(migrations_dir, fname)
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        migrations.append((migration_id, mod))
    return migrations


def status_report(migrations: list, client: MetaClient) -> None:
    print(f'Status report — target: {API_URL}\n')
    all_applied = True
    for migration_id, mod in migrations:
        desc = getattr(mod, 'DESCRIPTION', '')
        buf = io.StringIO()
        try:
            with redirect_stdout(buf):
                mod.run(client, dry_run=True)
        except Exception as exc:
            print(f'  ? UNKNOWN       {migration_id} — exception: {exc}')
            all_applied = False
            continue

        output = buf.getvalue()
        lines = output.strip().splitlines()
        creates = [l for l in lines if '[create]' in l]
        errors  = [l for l in lines if '[error]'  in l]
        skips   = [l for l in lines if '[skip]'   in l]

        if errors:
            # Dependency missing — can't determine full status
            symbol = '?'
            status = 'UNKNOWN'
            detail = f'{len(errors)} dependency error(s)'
            all_applied = False
        elif creates:
            symbol = '~' if skips else '✗'
            status = 'PARTIAL' if skips else 'NOT APPLIED'
            detail = f'{len(creates)} step(s) pending'
            all_applied = False
        else:
            symbol = '✓'
            status = 'APPLIED'
            detail = f'{len(skips)} step(s) present'

        label = migration_id + (f' — {desc}' if desc else '')
        print(f'  {symbol} {status:<12}  {label}')
        if creates or errors:
            for line in creates + errors:
                print(f'                  {line.strip()}')

    print()
    if all_applied:
        print('All migrations applied.')
    else:
        print('⚠  Some migrations are pending or unknown.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--api-url', help='Override API URL')
    parser.add_argument('--dry-run', action='store_true', help='Print what would be done without executing')
    parser.add_argument('--status', action='store_true', help='Show which migrations are applied to the target')
    parser.add_argument('--only', help='Run only this migration ID (e.g. 001-account-group)')
    args = parser.parse_args()

    global API_URL
    if args.api_url:
        API_URL = args.api_url

    if not API_KEY:
        print('ERROR: Set TWENTY_API_KEY environment variable')
        sys.exit(1)

    migrations_dir = os.path.join(os.path.dirname(__file__), 'migrations')
    migrations = load_migrations(migrations_dir)

    if not migrations:
        print('No migration files found in', migrations_dir)
        return

    if args.only:
        migrations = [(mid, mod) for mid, mod in migrations if args.only in mid]
        if not migrations:
            print(f'No migration matching --only "{args.only}"')
            sys.exit(1)

    client = MetaClient(API_URL, API_KEY)

    if args.status:
        status_report(migrations, client)
        return

    print(f'Target: {API_URL}')
    if args.dry_run:
        print('[DRY RUN] No changes will be made\n')

    for migration_id, mod in migrations:
        desc = getattr(mod, 'DESCRIPTION', '')
        print(f'\n── {migration_id}' + (f': {desc}' if desc else ''))
        mod.run(client, dry_run=args.dry_run)

    print('\nDone.')


if __name__ == '__main__':
    main()
