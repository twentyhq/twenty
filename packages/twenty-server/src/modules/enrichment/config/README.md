# Linkup Enrichment Prompts Configuration

This directory contains the configuration for Linkup AI enrichment prompts used when enriching company, person, and other object records.

## Configuration File

**File:** `enrichment-prompts.json`

This JSON file defines the search prompts used when querying the Linkup API for specific fields. The file structure is organized by object type (e.g., `company`, `person`) and contains field-to-prompt mappings.

### Structure

```json
{
  "objectType": {
    "fieldName": "search prompt keywords",
    ...
  }
}
```

### Example

```json
{
  "company": {
    "employees": "total number of employees team size headcount staff count",
    "address": "headquarters address main office location physical address",
    "linkedinLink": "official LinkedIn company page URL profile link"
  },
  "person": {
    "jobTitle": "job title role position designation",
    "email": "email address contact email work email"
  }
}
```

## How It Works

When enriching a record:

1. The service receives the entity name (e.g., "Google") and a list of fields to enrich (e.g., `["employees", "address"]`)
2. For each field, the service looks up the corresponding prompt from this config file
3. All prompts are combined into a single search query sent to Linkup
4. **Example:** For Google with fields `["employees", "address"]`:
   ```
   "Google company total number of employees team size headcount staff count headquarters address main office location physical address"
   ```

## Adding Custom Fields

When users create custom fields in Twenty, you can add corresponding prompts to this config file:

### Step 1: Identify the Field Name

Custom fields will have a camelCase name like `annualGrowthRate` or `marketSegment`.

### Step 2: Add the Prompt

Add an entry under the appropriate object type:

```json
{
  "company": {
    "annualGrowthRate": "annual growth rate year over year growth revenue growth percentage",
    "marketSegment": "market segment target market industry vertical customer segment",
    "certifications": "certifications ISO standards compliance regulatory certifications"
  }
}
```

### Step 3: Restart the Server

After modifying the config file, restart the Twenty server for changes to take effect.

## Prompt Writing Tips

### Be Specific and Comprehensive
Include multiple variations and synonyms to improve search quality:
```json
"employees": "total number of employees team size headcount staff count workforce size"
```

### Include Related Terms
Add terms that might appear in the same context:
```json
"address": "headquarters address main office location physical address street address city state country"
```

### Use Domain-Specific Language
For specialized fields, include industry-specific terminology:
```json
"annualRecurringRevenue": "annual recurring revenue ARR total revenue financial performance earnings"
```

### For URL Fields
Be explicit about what type of URL you're looking for:
```json
"linkedinLink": "official LinkedIn company page URL profile link"
```

## Object Types

Currently supported object types:

- **company**: Company/organization records
- **person**: People/contact records

### Adding New Object Types

To support a new object type (e.g., `product`, `opportunity`):

1. Add a new section to `enrichment-prompts.json`:
   ```json
   {
     "company": { ... },
     "person": { ... },
     "product": {
       "name": "product name official product name",
       "description": "product description features overview",
       "pricing": "product pricing price cost subscription fee"
     }
   }
   ```

2. Update your enrichment resolver to pass the correct `objectType` parameter when calling the enrichment service

## Fallback Behavior

If a field is not found in the config:
- The service automatically converts the field name from camelCase to readable text
- **Example:** `annualGrowthRate` → `"annual growth rate"`
- This ensures enrichment still works for custom fields without explicit prompts

## Best Practices

1. **Keep prompts up to date** - Review and update prompts as you learn what works best
2. **Test new prompts** - When adding custom fields, test the enrichment with real data
3. **Use multiple keywords** - More keywords give Linkup better context
4. **Be specific** - Generic prompts like "information" are less effective than specific ones
5. **Include variations** - Different sources may use different terminology

## Troubleshooting

### Fields Not Being Enriched

1. Check if the field exists in the config file
2. Verify the prompt contains relevant keywords
3. Check the Linkup search logs to see the actual query being sent
4. Try adding more specific or alternative keywords to the prompt

### Poor Quality Results

1. Make the prompt more specific with additional context
2. Add industry-specific terminology if applicable
3. Include both formal and informal terms (e.g., "CEO" and "chief executive officer")

## Examples of Good Prompts

### Contact Information
```json
"email": "email address contact email work email business email",
"phone": "phone number contact number telephone mobile number office phone"
```

### Financial Data
```json
"revenue": "annual revenue total revenue yearly revenue gross revenue",
"valuation": "company valuation market cap market capitalization enterprise value"
```

### Social/Web Presence
```json
"linkedinLink": "official LinkedIn company page URL profile link",
"website": "official company website URL domain homepage main website"
```

### Location Data
```json
"address": "headquarters address main office location physical address street city state country",
"city": "city location headquarters city main office city based in"
```

## Contributing

When adding prompts for commonly used fields, consider:
- Clarity and specificity
- Multiple synonyms and variations
- Industry-standard terminology
- International variations (if applicable)
