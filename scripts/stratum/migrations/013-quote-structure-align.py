"""
Migration 013 — Align UAT quote structure to match production.

UAT was built with a slightly different structure from production.
This migration renames, deletes, and creates fields so UAT matches prod exactly.

Changes:
  RENAMES
  - quote.sections          → quote.quoteSections
  - quoteSection.quoteTerm  → quoteSection.quoteTerms

  DELETES (exist in UAT, not in prod)
  - quoteSection.withinQuote          (MANY_TO_ONE → quote, FK: withinQuoteId)
  - quote.quoteTerm                   (ONE_TO_MANY → quoteTerm)
  - quoteTerm.owningSectionQuotationQuote  (MORPH_RELATION → quote)
  - accountGroup.quoteSections        (ONE_TO_MANY → quoteSection)

  CREATES (exist in prod, not in UAT)
  - quote.account             MANY_TO_ONE → company  (creates company.quotes)

Idempotent: each step checks current state before acting.
"""

MIGRATION_ID = '013-quote-structure-align'
DESCRIPTION = 'Align UAT quote object family structure to match production'


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── Helper to get current fields for an object ─────────────────────────────
    # Always query — dry_run only suppresses mutations, not reads.
    def fields_of(obj_name):
        obj = objects.get(obj_name)
        if not obj:
            return {}
        return client.get_object_fields(obj['id'])

    # ── 1. Rename quote.sections → quote.quoteSections ─────────────────────────
    quote_fields = fields_of('quote')
    if 'quoteSections' in quote_fields:
        print('  [skip] quote.quoteSections already correctly named')
    elif 'sections' in quote_fields:
        print('  [rename] quote.sections → quote.quoteSections')
        if not dry_run:
            client.update_field(
                quote_fields['sections']['id'],
                name='quoteSections',
                label='Quote Sections',
            )
    else:
        print('  [warn] quote.sections not found — already renamed or missing')

    # ── 2. Rename quoteSection.quoteTerm → quoteSection.quoteTerms ─────────────
    qs_fields = fields_of('quoteSection')
    if 'quoteTerms' in qs_fields:
        print('  [skip] quoteSection.quoteTerms already correctly named')
    elif 'quoteTerm' in qs_fields:
        print('  [rename] quoteSection.quoteTerm → quoteSection.quoteTerms')
        if not dry_run:
            client.update_field(
                qs_fields['quoteTerm']['id'],
                name='quoteTerms',
                label='Quote Terms',
            )
    else:
        print('  [warn] quoteSection.quoteTerm not found — already renamed or missing')

    # ── 3. Delete quoteSection.withinQuote ─────────────────────────────────────
    qs_fields = fields_of('quoteSection')
    if 'withinQuote' not in qs_fields:
        print('  [skip] quoteSection.withinQuote already gone')
    else:
        print('  [delete] quoteSection.withinQuote (FK: withinQuoteId, not in prod)')
        if not dry_run:
            deleted = client.delete_field(qs_fields['withinQuote']['id'])
            if not deleted:
                print('  [warn] quoteSection.withinQuote delete returned not-found')

    # ── 4. Delete quote.quoteTerm ──────────────────────────────────────────────
    quote_fields = fields_of('quote')
    if 'quoteTerm' not in quote_fields:
        print('  [skip] quote.quoteTerm already gone')
    else:
        print('  [delete] quote.quoteTerm (ONE_TO_MANY to quoteTerm, not in prod)')
        if not dry_run:
            deleted = client.delete_field(quote_fields['quoteTerm']['id'])
            if not deleted:
                print('  [warn] quote.quoteTerm delete returned not-found')

    # ── 5. Delete quoteTerm.owningSectionQuotationQuote ────────────────────────
    qt_fields = fields_of('quoteTerm')
    if 'owningSectionQuotationQuote' not in qt_fields:
        print('  [skip] quoteTerm.owningSectionQuotationQuote already gone')
    else:
        print('  [delete] quoteTerm.owningSectionQuotationQuote (MORPH_RELATION, not in prod)')
        if not dry_run:
            deleted = client.delete_field(qt_fields['owningSectionQuotationQuote']['id'])
            if not deleted:
                print('  [warn] quoteTerm.owningSectionQuotationQuote delete returned not-found')

    # ── 6. Delete accountGroup.quoteSections ───────────────────────────────────
    ag_fields = fields_of('accountGroup')
    if 'quoteSections' not in ag_fields:
        print('  [skip] accountGroup.quoteSections already gone')
    else:
        print('  [delete] accountGroup.quoteSections (ONE_TO_MANY, not in prod)')
        if not dry_run:
            deleted = client.delete_field(ag_fields['quoteSections']['id'])
            if not deleted:
                print('  [warn] accountGroup.quoteSections delete returned not-found')

    # ── 7. Recreate quoteSection.quote MANY_TO_ONE → quote ────────────────────
    # Deleting quoteSection.withinQuote cascade-deleted the whole quote↔quoteSection
    # relation pair (quoteSection.quote + quote.quoteSections). Recreate it.
    qs_fields = fields_of('quoteSection')
    quote_fields = fields_of('quote')
    if 'quote' in qs_fields and 'quoteSections' in quote_fields:
        print('  [skip] quoteSection.quote ↔ quote.quoteSections already exists')
    elif 'quote' in qs_fields:
        print('  [skip] quoteSection.quote exists (quoteSections back-ref may be named differently)')
    else:
        quote_obj_id = objects.get('quote', {}).get('id')
        qs_obj_id = objects.get('quoteSection', {}).get('id')
        if not quote_obj_id or not qs_obj_id:
            print('  [error] quote or quoteSection object not found')
        else:
            print('  [create] quoteSection.quote MANY_TO_ONE → quote (creates quote.quoteSections)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=qs_obj_id,
                    type='RELATION',
                    name='quote',
                    label='Quote',
                    isNullable=True,
                    icon='IconFileDescription',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': quote_obj_id,
                        'targetFieldLabel': 'Quote Sections',
                        'targetFieldIcon': 'IconLayoutList',
                    },
                )

    # ── 8. Fix quoteTerm.owningSectionQuotationQuoteSection: MORPH → RELATION ───
    # In UAT this was a MORPH_RELATION (polymorphic); in prod it's a regular RELATION.
    # The visualiser can't resolve a morph relation to a single target, so the
    # quoteSection↔quoteTerm connection appears broken.
    # Fix: delete the MORPH_RELATION (cascade-deletes quoteSection.quoteTerms too),
    # then recreate the pair as a proper RELATION.
    qt_fields = fields_of('quoteTerm')
    qs_fields = fields_of('quoteSection')
    existing = qt_fields.get('owningSectionQuotationQuoteSection', {})
    if existing.get('type') == 'MORPH_RELATION':
        print('  [delete] quoteTerm.owningSectionQuotationQuoteSection (MORPH_RELATION — wrong type, must be RELATION)')
        if not dry_run:
            client.delete_field(existing['id'])
        # Recreate as proper RELATION
        qs_obj_id = objects.get('quoteSection', {}).get('id')
        qt_obj_id = objects.get('quoteTerm', {}).get('id')
        print('  [create] quoteTerm.owningSectionQuotationQuoteSection MANY_TO_ONE → quoteSection (creates quoteSection.quoteTerms)')
        if not dry_run:
            client.create_field(
                objectMetadataId=qt_obj_id,
                type='RELATION',
                name='owningSectionQuotationQuoteSection',
                label='Owning section/quotation',
                isNullable=True,
                icon='IconLayoutList',
                relationCreationPayload={
                    'type': 'MANY_TO_ONE',
                    'targetObjectMetadataId': qs_obj_id,
                    'targetFieldLabel': 'Quote Terms',
                    'targetFieldIcon': 'IconFileText',
                },
            )
    elif existing.get('type') == 'RELATION':
        print('  [skip] quoteTerm.owningSectionQuotationQuoteSection already a proper RELATION')
    else:
        # Missing — recreate from scratch
        qs_obj_id = objects.get('quoteSection', {}).get('id')
        qt_obj_id = objects.get('quoteTerm', {}).get('id')
        if 'quoteTerms' in qs_fields:
            print('  [skip] quoteSection.quoteTerms already exists (relation pair present)')
        elif not qs_obj_id or not qt_obj_id:
            print('  [error] quoteSection or quoteTerm object not found')
        else:
            print('  [create] quoteTerm.owningSectionQuotationQuoteSection MANY_TO_ONE → quoteSection (creates quoteSection.quoteTerms)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=qt_obj_id,
                    type='RELATION',
                    name='owningSectionQuotationQuoteSection',
                    label='Owning section/quotation',
                    isNullable=True,
                    icon='IconLayoutList',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': qs_obj_id,
                        'targetFieldLabel': 'Quote Terms',
                        'targetFieldIcon': 'IconFileText',
                    },
                )

    # ── 9. Create quote.account MANY_TO_ONE → company ──────────────────────────
    quote_fields = fields_of('quote')  # re-fetch after possible creation above
    if 'account' in quote_fields:
        print('  [skip] quote.account already exists')
    else:
        company_id = objects.get('company', {}).get('id')
        if not company_id:
            print('  [error] company object not found')
        else:
            print('  [create] quote.account MANY_TO_ONE → company (creates company.quotes)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=objects['quote']['id'],
                    type='RELATION',
                    name='account',
                    label='Account',
                    isNullable=True,
                    icon='IconBuilding',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': company_id,
                        'targetFieldLabel': 'Quotes',
                        'targetFieldIcon': 'IconFileDescription',
                    },
                )
