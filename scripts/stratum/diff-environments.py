"""
Compare custom metadata between two Twenty environments (UAT vs production).

Reports:
  - Custom objects in source but missing in target
  - Custom objects in target but not in source (extra)
  - Custom fields missing in target for shared objects
  - Custom fields extra in target for shared objects

Usage:
    python3 diff-environments.py \
        --source-url https://twenty-uat-0a4c.up.railway.app/graphql \
        --source-key <uat-api-key> \
        --target-url https://twenty-production-eea0.up.railway.app/graphql \
        --target-key <prod-api-key>

Or via environment variables:
    SOURCE_URL=... SOURCE_KEY=... TARGET_URL=... TARGET_KEY=... python3 diff-environments.py
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from meta_client import MetaClient


def diff_envs(source: MetaClient, target: MetaClient) -> None:
    print('Fetching objects from both environments...')
    src_objects = source.get_all_objects()
    tgt_objects = target.get_all_objects()

    src_custom = {k: v for k, v in src_objects.items() if v['isCustom']}
    tgt_custom = {k: v for k, v in tgt_objects.items() if v['isCustom']}

    missing_objects = sorted(set(src_custom) - set(tgt_custom))
    extra_objects   = sorted(set(tgt_custom) - set(src_custom))
    shared_objects  = sorted(set(src_custom) & set(tgt_custom))

    print(f'\n{"="*60}')
    print(f'CUSTOM OBJECTS: {len(src_custom)} in source, {len(tgt_custom)} in target')
    print(f'{"="*60}')

    if missing_objects:
        print(f'\n  MISSING in target ({len(missing_objects)}):')
        for name in missing_objects:
            obj = src_custom[name]
            print(f'    - {name}  (label: {obj["labelSingular"]})')
    else:
        print('\n  All source custom objects present in target. ✓')

    if extra_objects:
        print(f'\n  EXTRA in target (not in source) ({len(extra_objects)}):')
        for name in extra_objects:
            obj = tgt_custom[name]
            print(f'    + {name}  (label: {obj["labelSingular"]})')

    print(f'\n{"="*60}')
    print(f'CUSTOM FIELDS on shared objects')
    print(f'{"="*60}')

    any_field_gap = False
    for obj_name in shared_objects:
        src_id = src_custom[obj_name]['id']
        tgt_id = tgt_custom[obj_name]['id']

        src_fields = source.get_object_fields(src_id)
        tgt_fields = target.get_object_fields(tgt_id)

        src_custom_fields = {k: v for k, v in src_fields.items() if v['isCustom']}
        tgt_custom_fields = {k: v for k, v in tgt_fields.items() if v['isCustom']}

        missing_fields = sorted(set(src_custom_fields) - set(tgt_custom_fields))
        extra_fields   = sorted(set(tgt_custom_fields) - set(src_custom_fields))

        if missing_fields or extra_fields:
            any_field_gap = True
            print(f'\n  {obj_name}:')
            for f in missing_fields:
                fld = src_custom_fields[f]
                print(f'    MISSING  {f} ({fld["type"]})  label: "{fld["label"]}"')
            for f in extra_fields:
                fld = tgt_custom_fields[f]
                print(f'    EXTRA    {f} ({fld["type"]})  label: "{fld["label"]}"')

    # Also check standard objects for custom fields
    src_standard = {k: v for k, v in src_objects.items() if not v['isCustom']}
    tgt_standard = {k: v for k, v in tgt_objects.items() if not v['isCustom']}
    shared_standard = sorted(set(src_standard) & set(tgt_standard))

    std_header_printed = False
    for obj_name in shared_standard:
        src_id = src_standard[obj_name]['id']
        tgt_id = tgt_standard[obj_name]['id']

        src_fields = source.get_object_fields(src_id)
        tgt_fields = target.get_object_fields(tgt_id)

        src_custom_fields = {k: v for k, v in src_fields.items() if v['isCustom']}
        tgt_custom_fields = {k: v for k, v in tgt_fields.items() if v['isCustom']}

        missing_fields = sorted(set(src_custom_fields) - set(tgt_custom_fields))
        extra_fields   = sorted(set(tgt_custom_fields) - set(src_custom_fields))

        if missing_fields or extra_fields:
            if not std_header_printed:
                print(f'\n{"="*60}')
                print(f'CUSTOM FIELDS on standard objects')
                print(f'{"="*60}')
                std_header_printed = True
            any_field_gap = True
            print(f'\n  {obj_name}:')
            for f in missing_fields:
                fld = src_custom_fields[f]
                print(f'    MISSING  {f} ({fld["type"]})  label: "{fld["label"]}"')
            for f in extra_fields:
                fld = tgt_custom_fields[f]
                print(f'    EXTRA    {f} ({fld["type"]})  label: "{fld["label"]}"')

    if not any_field_gap:
        print('\n  All custom fields match. ✓')

    print(f'\n{"="*60}')
    summary_issues = len(missing_objects) + (1 if any_field_gap else 0)
    if summary_issues == 0:
        print('✓ Environments are in sync.')
    else:
        print('⚠  Gaps found — review above and write migration scripts for missing items.')
    print(f'{"="*60}\n')


def main():
    parser = argparse.ArgumentParser(description='Diff custom metadata between two Twenty environments')
    parser.add_argument('--source-url', default=os.environ.get('SOURCE_URL', 'https://twenty-uat-0a4c.up.railway.app/graphql'))
    parser.add_argument('--source-key', default=os.environ.get('SOURCE_KEY', ''))
    parser.add_argument('--target-url', default=os.environ.get('TARGET_URL', 'https://twenty-production-eea0.up.railway.app/graphql'))
    parser.add_argument('--target-key', default=os.environ.get('TARGET_KEY', ''))
    args = parser.parse_args()

    if not args.source_key or not args.target_key:
        print('ERROR: Provide API keys via --source-key / --target-key or SOURCE_KEY / TARGET_KEY env vars')
        sys.exit(1)

    print(f'Source: {args.source_url}')
    print(f'Target: {args.target_url}')

    source = MetaClient(args.source_url, args.source_key)
    target = MetaClient(args.target_url, args.target_key)
    diff_envs(source, target)


if __name__ == '__main__':
    main()
