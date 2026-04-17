"""
Migration 011 — Create Quote object family.

Creates (in dependency order):
  1. quote object
       - quoteNumber TEXT
       - notes TEXT
       - currencyCustom SELECT (GBP / EUR / USD)
       - status SELECT (DRAFT / SENT / ACCEPTED / REJECTED / SUPERSEDED)
       - validFrom DATE_TIME
       - validUntil DATE_TIME
       - totalAmount CURRENCY
       - version NUMBER
       - associatedOpportunity MANY_TO_ONE → opportunity  (creates opportunity.quotes)
       - account MANY_TO_ONE → company                    (creates company.quotes)

  2. quoteSection object
       - serviceCategory SELECT (SPV / TAX / AUDIT / CONSULTING)
       - subtotal CURRENCY
       - sectionPosition NUMBER
       - quote MANY_TO_ONE → quote                        (creates quote.quoteSections)

  3. quoteTerm object
       - termType SELECT (INDEXATION / AD_HOC_FEE / PAYMENT_TERMS / LIABILITY_CAP / OUT_OF_SCOPE / OTHER)
       - feePercentage NUMBER (percentage)
       - affectsFees BOOLEAN
       - owningSectionQuotationQuoteSection MANY_TO_ONE → quoteSection  (creates quoteSection.quoteTerms)
       - owningSectionQuotationQuote MANY_TO_ONE → quote                (creates quote.quoteTerms)

  4. lineItem object
       - feeType SELECT (FIXED_PRICE / TIME_AND_MATERIALS)
       - hasTimeCap BOOLEAN
       - lineItemPosition NUMBER
       - estimatedLineAmount CURRENCY
       - estimatedHours NUMBER
       - hourlyRate CURRENCY
       - fixedFeeAmount CURRENCY
       - timeCapHours NUMBER
       - quoteSection MANY_TO_ONE → quoteSection           (creates quoteSection.lineItems)

Idempotent: skips any step that already exists.
"""

MIGRATION_ID = '011-quote-objects'
DESCRIPTION = 'Create Quote object family: quote, quoteSection, quoteTerm, lineItem'


def _fields(client, object_id, dry_run):
    return {} if dry_run else client.get_object_fields(object_id)


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # ── 1. quote ──────────────────────────────────────────────────────────────
    if 'quote' in objects:
        print('  [skip] quote object already exists')
        quote_id = objects['quote']['id']
    else:
        print('  [create] quote object')
        if not dry_run:
            result = client.create_object(
                nameSingular='quote',
                namePlural='quotes',
                labelSingular='Quote',
                labelPlural='Quotes',
                description='A fee quote for an opportunity',
                icon='IconFileDescription',
            )
            quote_id = result['id']
            print(f'    → id: {quote_id}')
            objects = client.get_all_objects()
        else:
            quote_id = '<dry-run>'

    fields = _fields(client, quote_id, dry_run)

    if 'quoteNumber' in fields:
        print('  [skip] quoteNumber field already exists')
    else:
        print('  [create] quoteNumber TEXT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=quote_id,
                type='TEXT',
                name='quoteNumber',
                label='Quote number',
                isNullable=True,
            )

    if 'notes' in fields:
        print('  [skip] notes field already exists')
    else:
        print('  [create] notes TEXT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=quote_id,
                type='TEXT',
                name='notes',
                label='Notes',
                isNullable=True,
                settings={'displayedMaxRows': 5},
            )

    if 'currencyCustom' in fields:
        print('  [skip] currencyCustom field already exists')
    else:
        print('  [create] currencyCustom SELECT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=quote_id,
                type='SELECT',
                name='currencyCustom',
                label='Currency',
                isNullable=True,
                options=[
                    {'label': 'GBP', 'value': 'GBP', 'color': 'green',  'position': 0},
                    {'label': 'EUR', 'value': 'EUR', 'color': 'jade',   'position': 1},
                    {'label': 'USD', 'value': 'USD', 'color': 'mint',   'position': 2},
                ],
            )

    if 'status' in fields:
        print('  [skip] status field already exists')
    else:
        print('  [create] status SELECT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=quote_id,
                type='SELECT',
                name='status',
                label='Status',
                isNullable=True,
                options=[
                    {'label': 'Draft',      'value': 'DRAFT',      'color': 'green',     'position': 0},
                    {'label': 'Sent',       'value': 'SENT',       'color': 'jade',      'position': 1},
                    {'label': 'Accepted',   'value': 'ACCEPTED',   'color': 'mint',      'position': 2},
                    {'label': 'Rejected',   'value': 'REJECTED',   'color': 'turquoise', 'position': 3},
                    {'label': 'Superseded', 'value': 'SUPERSEDED', 'color': 'cyan',      'position': 4},
                ],
            )

    if 'validFrom' in fields:
        print('  [skip] validFrom field already exists')
    else:
        print('  [create] validFrom DATE_TIME field')
        if not dry_run:
            client.create_field(
                objectMetadataId=quote_id,
                type='DATE_TIME',
                name='validFrom',
                label='Valid from',
                isNullable=True,
                settings={'displayFormat': 'CUSTOM', 'customUnicodeDateFormat': 'yyyy-MM-dd'},
            )

    if 'validUntil' in fields:
        print('  [skip] validUntil field already exists')
    else:
        print('  [create] validUntil DATE_TIME field')
        if not dry_run:
            client.create_field(
                objectMetadataId=quote_id,
                type='DATE_TIME',
                name='validUntil',
                label='Valid until',
                isNullable=True,
                settings={'displayFormat': 'CUSTOM', 'customUnicodeDateFormat': 'yyyy-MM-dd'},
            )

    if 'totalAmount' in fields:
        print('  [skip] totalAmount field already exists')
    else:
        print('  [create] totalAmount CURRENCY field')
        if not dry_run:
            client.create_field(
                objectMetadataId=quote_id,
                type='CURRENCY',
                name='totalAmount',
                label='Total amount',
                isNullable=True,
                settings={'format': 'full', 'decimals': 0},
            )

    if 'version' in fields:
        print('  [skip] version field already exists')
    else:
        print('  [create] version NUMBER field')
        if not dry_run:
            client.create_field(
                objectMetadataId=quote_id,
                type='NUMBER',
                name='version',
                label='Version',
                isNullable=True,
                settings={'type': 'number', 'decimals': 0},
            )

    fields = _fields(client, quote_id, dry_run)

    if 'associatedOpportunity' in fields:
        print('  [skip] associatedOpportunity relation already exists')
    else:
        opp_id = objects.get('opportunity', {}).get('id')
        if not opp_id:
            print('  [error] opportunity object not found')
        else:
            print('  [create] associatedOpportunity MANY_TO_ONE → opportunity (creates opportunity.quotes)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=quote_id,
                    type='RELATION',
                    name='associatedOpportunity',
                    label='Associated Opportunity',
                    isNullable=True,
                    icon='IconTargetArrow',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': opp_id,
                        'targetFieldLabel': 'Quotes',
                        'targetFieldIcon': 'IconFileDescription',
                    },
                )

    fields = _fields(client, quote_id, dry_run)

    if 'account' in fields:
        print('  [skip] account relation already exists')
    else:
        company_id = objects.get('company', {}).get('id')
        if not company_id:
            print('  [error] company object not found')
        else:
            print('  [create] account MANY_TO_ONE → company (creates company.quotes)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=quote_id,
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

    # ── 2. quoteSection ───────────────────────────────────────────────────────
    objects = client.get_all_objects() if not dry_run else objects

    if 'quoteSection' in objects:
        print('  [skip] quoteSection object already exists')
        qs_id = objects['quoteSection']['id']
    else:
        print('  [create] quoteSection object')
        if not dry_run:
            result = client.create_object(
                nameSingular='quoteSection',
                namePlural='quoteSections',
                labelSingular='Quote section',
                labelPlural='Quote sections',
                description='A section within a quote grouping line items by service category',
                icon='IconLayoutList',
            )
            qs_id = result['id']
            print(f'    → id: {qs_id}')
            objects = client.get_all_objects()
        else:
            qs_id = '<dry-run>'

    fields = _fields(client, qs_id, dry_run)

    if 'serviceCategory' in fields:
        print('  [skip] serviceCategory field already exists')
    else:
        print('  [create] serviceCategory SELECT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=qs_id,
                type='SELECT',
                name='serviceCategory',
                label='Service Category',
                isNullable=True,
                options=[
                    {'label': 'SPV',        'value': 'SPV',        'color': 'green',     'position': 0},
                    {'label': 'Tax',        'value': 'TAX',        'color': 'jade',      'position': 1},
                    {'label': 'Audit',      'value': 'AUDIT',      'color': 'mint',      'position': 2},
                    {'label': 'Consulting', 'value': 'CONSULTING', 'color': 'turquoise', 'position': 3},
                ],
            )

    if 'subtotal' in fields:
        print('  [skip] subtotal field already exists')
    else:
        print('  [create] subtotal CURRENCY field')
        if not dry_run:
            client.create_field(
                objectMetadataId=qs_id,
                type='CURRENCY',
                name='subtotal',
                label='Subtotal',
                isNullable=True,
                settings={'format': 'full', 'decimals': 0},
            )

    if 'sectionPosition' in fields:
        print('  [skip] sectionPosition field already exists')
    else:
        print('  [create] sectionPosition NUMBER field')
        if not dry_run:
            client.create_field(
                objectMetadataId=qs_id,
                type='NUMBER',
                name='sectionPosition',
                label='Section position',
                isNullable=True,
                settings={'type': 'number', 'decimals': 0},
            )

    fields = _fields(client, qs_id, dry_run)

    if 'quote' in fields:
        print('  [skip] quote relation already exists')
    else:
        quote_obj_id = objects.get('quote', {}).get('id')
        if not quote_obj_id:
            print('  [error] quote object not found — run quote creation first')
        else:
            print('  [create] quote MANY_TO_ONE → quote (creates quote.quoteSections)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=qs_id,
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

    # ── 3. quoteTerm ──────────────────────────────────────────────────────────
    objects = client.get_all_objects() if not dry_run else objects

    if 'quoteTerm' in objects:
        print('  [skip] quoteTerm object already exists')
        qt_id = objects['quoteTerm']['id']
    else:
        print('  [create] quoteTerm object')
        if not dry_run:
            result = client.create_object(
                nameSingular='quoteTerm',
                namePlural='quoteTerms',
                labelSingular='Quote term',
                labelPlural='Quote terms',
                description='A commercial term attached to a quote or quote section',
                icon='IconFileText',
            )
            qt_id = result['id']
            print(f'    → id: {qt_id}')
            objects = client.get_all_objects()
        else:
            qt_id = '<dry-run>'

    fields = _fields(client, qt_id, dry_run)

    if 'termType' in fields:
        print('  [skip] termType field already exists')
    else:
        print('  [create] termType SELECT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=qt_id,
                type='SELECT',
                name='termType',
                label='Term Type',
                isNullable=True,
                options=[
                    {'label': 'Indexation',     'value': 'INDEXATION',     'color': 'green',     'position': 0},
                    {'label': 'Ad Hoc Fee',     'value': 'AD_HOC_FEE',     'color': 'jade',      'position': 1},
                    {'label': 'Payment Terms',  'value': 'PAYMENT_TERMS',  'color': 'mint',      'position': 2},
                    {'label': 'Liability Cap',  'value': 'LIABILITY_CAP',  'color': 'turquoise', 'position': 3},
                    {'label': 'Out of Scope',   'value': 'OUT_OF_SCOPE',   'color': 'cyan',      'position': 4},
                    {'label': 'Other',          'value': 'OTHER',          'color': 'sky',       'position': 5},
                ],
            )

    if 'feePercentage' in fields:
        print('  [skip] feePercentage field already exists')
    else:
        print('  [create] feePercentage NUMBER (percentage) field')
        if not dry_run:
            client.create_field(
                objectMetadataId=qt_id,
                type='NUMBER',
                name='feePercentage',
                label='Fee +/- percentage',
                isNullable=True,
                settings={'type': 'percentage', 'decimals': 0},
            )

    if 'affectsFees' in fields:
        print('  [skip] affectsFees field already exists')
    else:
        print('  [create] affectsFees BOOLEAN field')
        if not dry_run:
            client.create_field(
                objectMetadataId=qt_id,
                type='BOOLEAN',
                name='affectsFees',
                label='Affects Fees',
                isNullable=True,
            )

    fields = _fields(client, qt_id, dry_run)

    if 'owningSectionQuotationQuoteSection' in fields:
        print('  [skip] owningSectionQuotationQuoteSection relation already exists')
    else:
        qs_obj_id = objects.get('quoteSection', {}).get('id')
        if not qs_obj_id:
            print('  [error] quoteSection object not found — run quoteSection creation first')
        else:
            print('  [create] owningSectionQuotationQuoteSection MANY_TO_ONE → quoteSection (creates quoteSection.quoteTerms)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=qt_id,
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

    fields = _fields(client, qt_id, dry_run)

    if 'owningSectionQuotationQuote' in fields:
        print('  [skip] owningSectionQuotationQuote relation already exists')
    else:
        quote_obj_id = objects.get('quote', {}).get('id')
        if not quote_obj_id:
            print('  [error] quote object not found')
        else:
            print('  [create] owningSectionQuotationQuote MANY_TO_ONE → quote (creates quote.quoteTerms)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=qt_id,
                    type='RELATION',
                    name='owningSectionQuotationQuote',
                    label='Owning section/quotation',
                    isNullable=True,
                    icon='IconFileDescription',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': quote_obj_id,
                        'targetFieldLabel': 'Quote Terms',
                        'targetFieldIcon': 'IconFileText',
                    },
                )

    # ── 4. lineItem ───────────────────────────────────────────────────────────
    objects = client.get_all_objects() if not dry_run else objects

    if 'lineItem' in objects:
        print('  [skip] lineItem object already exists')
        li_id = objects['lineItem']['id']
    else:
        print('  [create] lineItem object')
        if not dry_run:
            result = client.create_object(
                nameSingular='lineItem',
                namePlural='lineItems',
                labelSingular='Line item',
                labelPlural='Line items',
                description='A billable line item within a quote section',
                icon='IconList',
            )
            li_id = result['id']
            print(f'    → id: {li_id}')
            objects = client.get_all_objects()
        else:
            li_id = '<dry-run>'

    fields = _fields(client, li_id, dry_run)

    if 'feeType' in fields:
        print('  [skip] feeType field already exists')
    else:
        print('  [create] feeType SELECT field')
        if not dry_run:
            client.create_field(
                objectMetadataId=li_id,
                type='SELECT',
                name='feeType',
                label='Fee type',
                isNullable=True,
                options=[
                    {'label': 'Fixed Price',         'value': 'FIXED_PRICE',         'color': 'green', 'position': 0},
                    {'label': 'Time and Materials',  'value': 'TIME_AND_MATERIALS',  'color': 'jade',  'position': 1},
                ],
            )

    if 'hasTimeCap' in fields:
        print('  [skip] hasTimeCap field already exists')
    else:
        print('  [create] hasTimeCap BOOLEAN field')
        if not dry_run:
            client.create_field(
                objectMetadataId=li_id,
                type='BOOLEAN',
                name='hasTimeCap',
                label='Has time cap',
                isNullable=True,
            )

    if 'lineItemPosition' in fields:
        print('  [skip] lineItemPosition field already exists')
    else:
        print('  [create] lineItemPosition NUMBER field')
        if not dry_run:
            client.create_field(
                objectMetadataId=li_id,
                type='NUMBER',
                name='lineItemPosition',
                label='Line Item Position',
                isNullable=True,
                settings={'type': 'number', 'decimals': 0},
            )

    if 'estimatedLineAmount' in fields:
        print('  [skip] estimatedLineAmount field already exists')
    else:
        print('  [create] estimatedLineAmount CURRENCY field')
        if not dry_run:
            client.create_field(
                objectMetadataId=li_id,
                type='CURRENCY',
                name='estimatedLineAmount',
                label='Estimated Line Amount',
                isNullable=True,
                settings={'format': 'full', 'decimals': 0},
            )

    if 'estimatedHours' in fields:
        print('  [skip] estimatedHours field already exists')
    else:
        print('  [create] estimatedHours NUMBER field')
        if not dry_run:
            client.create_field(
                objectMetadataId=li_id,
                type='NUMBER',
                name='estimatedHours',
                label='Estimated hours',
                isNullable=True,
                settings={'type': 'number', 'decimals': 0},
            )

    if 'hourlyRate' in fields:
        print('  [skip] hourlyRate field already exists')
    else:
        print('  [create] hourlyRate CURRENCY field')
        if not dry_run:
            client.create_field(
                objectMetadataId=li_id,
                type='CURRENCY',
                name='hourlyRate',
                label='Hourly rate',
                isNullable=True,
                settings={'format': 'full', 'decimals': 0},
            )

    if 'fixedFeeAmount' in fields:
        print('  [skip] fixedFeeAmount field already exists')
    else:
        print('  [create] fixedFeeAmount CURRENCY field')
        if not dry_run:
            client.create_field(
                objectMetadataId=li_id,
                type='CURRENCY',
                name='fixedFeeAmount',
                label='Fixed Fee Amount',
                isNullable=True,
                settings={'format': 'full', 'decimals': 0},
            )

    if 'timeCapHours' in fields:
        print('  [skip] timeCapHours field already exists')
    else:
        print('  [create] timeCapHours NUMBER field')
        if not dry_run:
            client.create_field(
                objectMetadataId=li_id,
                type='NUMBER',
                name='timeCapHours',
                label='Time Cap Hours',
                isNullable=True,
                settings={'type': 'number', 'decimals': 0},
            )

    fields = _fields(client, li_id, dry_run)

    if 'quoteSection' in fields:
        print('  [skip] quoteSection relation already exists')
    else:
        qs_obj_id = objects.get('quoteSection', {}).get('id')
        if not qs_obj_id:
            print('  [error] quoteSection object not found — run quoteSection creation first')
        else:
            print('  [create] quoteSection MANY_TO_ONE → quoteSection (creates quoteSection.lineItems)')
            if not dry_run:
                client.create_field(
                    objectMetadataId=li_id,
                    type='RELATION',
                    name='quoteSection',
                    label='Quote Section',
                    isNullable=True,
                    icon='IconLayoutList',
                    relationCreationPayload={
                        'type': 'MANY_TO_ONE',
                        'targetObjectMetadataId': qs_obj_id,
                        'targetFieldLabel': 'Line Items',
                        'targetFieldIcon': 'IconList',
                    },
                )
