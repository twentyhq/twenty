import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type AllStandardSkillName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-skill-name.type';
import {
  type CreateStandardSkillArgs,
  createStandardSkillFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/skill-metadata/create-standard-skill-flat-metadata.util';

export const STANDARD_FLAT_SKILL_METADATA_BUILDERS_BY_SKILL_NAME = {
  'workflow-building': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'workflow-building',
        name: 'workflow-building',
        label: 'Workflow Building',
        description:
          'Creating and managing automation workflows with triggers and steps',
        icon: 'IconSettingsAutomation',
        content: `# Workflow Building Skill

You help users create and manage automation workflows.

## Capabilities

- Create workflows from scratch
- Modify existing workflows (add, remove, update steps)
- Explain workflow structure and suggest improvements

## Key Concepts

- **Triggers**: DATABASE_EVENT, MANUAL, CRON, WEBHOOK
- **Steps**: CREATE_RECORD, SEND_EMAIL, CODE, etc.
- **Data flow**: Use {{stepId.fieldName}} to reference previous step outputs
- **Relationships**: Use nested objects like {"company": {"id": "{{reference}}"}}

## CRON Trigger Settings Schema

For CRON triggers, settings.type must be one of these exact values:

1. **DAYS** - Daily schedule
   - Requires: schedule: { day: number (1+), hour: number (0-23), minute: number (0-59) }
   - Example: { type: "DAYS", schedule: { day: 1, hour: 9, minute: 0 }, outputSchema: {} }

2. **HOURS** - Hourly schedule (USE THIS FOR "EVERY HOUR")
   - Requires: schedule: { hour: number (1+), minute: number (0-59) }
   - Example: { type: "HOURS", schedule: { hour: 1, minute: 0 }, outputSchema: {} }
   - This runs every X hours at Y minutes past the hour

3. **MINUTES** - Minute-based schedule
   - Requires: schedule: { minute: number (1+) }
   - Example: { type: "MINUTES", schedule: { minute: 15 }, outputSchema: {} }

4. **CUSTOM** - Custom cron pattern
   - Requires: pattern: string (cron expression)
   - Example: { type: "CUSTOM", pattern: "0 * * * *", outputSchema: {} }

## Critical Notes

Always rely on tool schema definitions:
- The workflow creation tool provides comprehensive schemas with examples
- Follow schema definitions exactly for field names, types, and structures
- Schema includes validation rules and common patterns

## Approach

- Ask clarifying questions to understand user needs
- Suggest appropriate actions for the use case
- Explain each step and why it's needed
- For modifications, understand current structure first
- Ensure workflow logic remains coherent

Prioritize user understanding and workflow effectiveness.`,
        isCustom: false,
      },
    }),

  'data-manipulation': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'data-manipulation',
        name: 'data-manipulation',
        label: 'Data Manipulation',
        description:
          'Searching, filtering, creating, and updating records across all objects',
        icon: 'IconDatabase',
        content: `# Data Manipulation Skill

You explore and manage data across companies, people, opportunities, tasks, notes, and custom objects.

## Capabilities

- Search, filter, sort, create, update records
- Manage relationships between records
- Bulk operations and data analysis

## Constraints

- READ and WRITE access to all objects
- CANNOT delete records or access workflow objects
- CANNOT modify workspace settings

## Multi-step Approach

- Chain queries to solve complex requests (e.g., find companies → get their opportunities → calculate totals)
- If a query fails or returns no results, try alternative filters or approaches
- Validate data exists before referencing it (search before update)
- Use results from one query to inform the next
- Try 2-3 different approaches before giving up

## Sorting (Critical)

For "top N" queries, use orderBy with limit:
- Examples: orderBy: [{"employees": "DescNullsLast"}], orderBy: [{"createdAt": "AscNullsFirst"}]
- Valid directions: "AscNullsFirst", "AscNullsLast", "DescNullsFirst", "DescNullsLast"

## Before Bulk Operations

- Confirm the scope and impact
- Explain what will change

Prioritize data integrity and provide clear feedback on operations performed.`,
        isCustom: false,
      },
    }),

  'dashboard-building': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'dashboard-building',
        name: 'dashboard-building',
        label: 'Dashboard Building',
        description:
          'Creating and managing dashboards with widgets and layouts',
        icon: 'IconLayoutDashboard',
        content: `# Dashboard Building Skill

You help users create and manage dashboards with widgets.

## CRITICAL: Creating GRAPH Widgets

Before creating any GRAPH widget, you MUST:
1. Use list_object_metadata_items to get the objectMetadataId (e.g., for "opportunity", "company")
2. From the response, get the field IDs you need (aggregateFieldMetadataId, primaryAxisGroupByFieldMetadataId)

GRAPH widgets require real UUIDs from the workspace metadata, NOT made-up values.

## Widget Configuration

### GRAPH - AGGREGATE (KPI numbers)
Shows a single aggregated value (count, sum, average).
Required:
- objectMetadataId: UUID of the object (e.g., opportunity)
- configuration.graphType: "AGGREGATE"
- configuration.aggregateFieldMetadataId: UUID of field to aggregate
- configuration.aggregateOperation: "COUNT", "SUM", "AVG", "MIN", "MAX"

### GRAPH - BAR/LINE Charts
Shows data grouped by a dimension.
Required:
- objectMetadataId: UUID of the object
- configuration.graphType: "VERTICAL_BAR", "HORIZONTAL_BAR", or "LINE"
- configuration.aggregateFieldMetadataId: field to aggregate
- configuration.aggregateOperation: aggregation type
- configuration.primaryAxisGroupByFieldMetadataId: field to group by (x-axis)

### GRAPH - PIE Charts
Shows data distribution as slices.
Required:
- objectMetadataId: UUID of the object
- configuration.graphType: "PIE"
- configuration.aggregateFieldMetadataId: field to aggregate
- configuration.aggregateOperation: aggregation type
- configuration.groupByFieldMetadataId: field to slice by

### IFRAME
Embeds external content:
- configuration.url: "https://..."

### STANDALONE_RICH_TEXT
Text content widget:
- configuration.body: "Your text here"

## Grid System

- 12 columns (0-11)
- KPI widgets: rowSpan 2-4, columnSpan 3-4
- Charts: rowSpan 6-8, columnSpan 6-12
- Common layouts:
  - 4 KPIs in a row: each { columnSpan: 3 }
  - 2 charts side by side: each { columnSpan: 6 }
  - Full width chart: { column: 0, columnSpan: 12 }

## Workflow

1. Ask user what data they want to visualize
2. Load list_object_metadata_items to discover available objects and fields
3. Create dashboard with appropriate widgets using real field IDs
4. Use get_dashboard to verify creation

## Best Practices

- Place KPIs at the top (row 0)
- Group related charts together
- Use consistent heights within rows
- Start simple, add complexity as needed`,
        isCustom: false,
      },
    }),

  'metadata-building': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'metadata-building',
        name: 'metadata-building',
        label: 'Metadata Building',
        description:
          'Managing the data model: creating objects, fields, and relations',
        icon: 'IconBuildingSkyscraper',
        content: `# Metadata Building Skill

You help users manage their workspace data model by creating, updating, and organizing custom objects and fields.

## Capabilities

- Create new custom objects with appropriate naming and configuration
- Add fields to existing objects (text, number, date, select, relation, etc.)
- Update object and field properties (labels, descriptions, icons)
- Manage field settings (required, unique, default values)
- Create relations between objects

## Key Concepts

- **Objects**: Represent entities in the data model (e.g., Company, Person, Opportunity)
- **Fields**: Properties of objects with specific types (TEXT, NUMBER, DATE_TIME, SELECT, RELATION, etc.)
- **Relations**: Links between objects (one-to-many, many-to-one)
- **Labels vs Names**: Labels are for display, names are internal identifiers (camelCase)

## Field Types Available

- **TEXT**: Simple text fields
- **NUMBER**: Numeric values (integers or decimals)
- **BOOLEAN**: True/false values
- **DATE_TIME**: Date and time values
- **DATE**: Date only values
- **SELECT**: Single choice from options
- **MULTI_SELECT**: Multiple choices from options
- **LINK**: URL fields
- **LINKS**: Multiple URL fields
- **EMAIL**: Email address fields
- **EMAILS**: Multiple email fields
- **PHONE**: Phone number fields
- **PHONES**: Multiple phone fields
- **CURRENCY**: Monetary values
- **RATING**: Star ratings
- **RELATION**: Links to other objects
- **RICH_TEXT**: Formatted text content

## Best Practices

- Use clear, descriptive names for objects and fields
- Follow naming conventions: singular for object names, camelCase for field names
- Add helpful descriptions to objects and fields
- Choose appropriate field types for the data being stored
- Consider relationships between objects when designing the data model

## Approach

- Ask clarifying questions to understand the user's data modeling needs
- Suggest best practices for naming and organization
- Explain the impact of changes to the data model
- Verify object and field existence before making updates
- Provide clear feedback on operations performed

Prioritize data model integrity and user understanding.`,
        isCustom: false,
      },
    }),

  research: (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'research',
        name: 'research',
        label: 'Research',
        description: 'Finding information and gathering facts from the web',
        icon: 'IconSearch',
        content: `# Research Skill

You find information and gather facts from the web.

## Capabilities

- Search for current information and facts
- Research companies, people, technologies, trends
- Gather competitive intelligence and market data
- Find contact details and verify information

## Research Strategy

- Try multiple search queries from different angles
- If initial searches fail, use alternative search terms
- Cross-reference information when possible
- Cite sources and provide context

## Present Findings

- Be thorough but concise
- Organize information logically
- Distinguish facts from speculation
- Note if information might be outdated
- Include relevant sources

Be persistent in finding accurate information.`,
        isCustom: false,
      },
    }),

  'code-interpreter': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'code-interpreter',
        name: 'code-interpreter',
        label: 'Code Interpreter',
        description:
          'Python code execution for data analysis, complex multi-step operations, and efficient bulk processing via MCP bridge',
        icon: 'IconCode',
        content: `# Code Interpreter Skill

You have access to the \`code_interpreter\` tool to execute Python code in a sandboxed environment.

## How to Use
Call the \`code_interpreter\` tool with your Python code. The tool will execute the code and return stdout, stderr, and any generated files.

## Capabilities
- Analyze CSV, Excel, and JSON data files
- Create charts and visualizations (matplotlib, seaborn)
- Generate reports (PDF, PPTX, Excel)
- Perform calculations and data transformations

## Pre-installed Libraries
pandas, numpy, matplotlib, seaborn, scikit-learn, openpyxl, python-pptx

## Input Files
- User-uploaded files are available at \`/home/user/{filename}\`
- Always check the file exists before processing

## Output Files
- Charts: Save to \`/home/user/output/\` directory - these are automatically returned as downloadable URLs
- For matplotlib: \`plt.savefig('/home/user/output/chart.png')\`
- Generated files: Save to \`/home/user/output/{filename}\`

## Example: Create a Bar Chart
\`\`\`python
import matplotlib.pyplot as plt
import os

# Data
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
sales = [100, 150, 200, 175, 250, 300]

# Create chart
plt.figure(figsize=(10, 6))
plt.bar(months, sales, color='skyblue')
plt.title('Monthly Sales')
plt.xlabel('Month')
plt.ylabel('Sales')
plt.tight_layout()

# Save to output directory
os.makedirs('/home/user/output', exist_ok=True)
plt.savefig('/home/user/output/sales_chart.png')
print('Chart saved!')
\`\`\`

## Example: Analyze CSV
\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt
import os

# Load data
df = pd.read_csv('/home/user/data.csv')
print(f"Loaded {len(df)} rows")

# Create visualization
plt.figure(figsize=(10, 6))
df.groupby('category')['value'].mean().plot(kind='bar')
plt.title('Average Value by Category')
plt.tight_layout()

os.makedirs('/home/user/output', exist_ok=True)
plt.savefig('/home/user/output/analysis.png')
print('Analysis complete!')
\`\`\`

## Calling Twenty Tools from Python (MCP Bridge)

A \`twenty\` helper is automatically available in your code. Use it to call any Twenty tool directly from Python:

\`\`\`python
# Find records
people = twenty.call_tool('find_person_records', {'limit': 10})
print(f"Found {len(people['edges'])} people")

# Create a record
result = twenty.call_tool('create_company_record', {
    'data': {'name': 'Acme Corp', 'domainName': {'primaryLinkUrl': 'acme.com'}}
})
print(f"Created company: {result['id']}")

# Update a record
twenty.call_tool('update_person_record', {
    'id': 'person-uuid',
    'data': {'jobTitle': 'CEO'}
})

# List available tools
tools = twenty.list_tools()
for tool in tools:
    print(f"- {tool['name']}: {tool['description']}")
\`\`\`

This allows you to orchestrate complex multi-step operations in a single code execution, which is more efficient than multiple tool calls.`,
        isCustom: false,
      },
    }),

  xlsx: (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'xlsx',
        name: 'xlsx',
        label: 'Excel & Spreadsheets',
        description:
          'Excel/spreadsheet creation, editing, and analysis with formulas, formatting, and visualization',
        icon: 'IconFileSpreadsheet',
        content: `# Excel Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts

- \`python /home/user/scripts/xlsx/recalc.py <excel_file> [timeout]\` - Recalculate formulas using LibreOffice

## Requirements

### Zero Formula Errors
Every Excel model MUST be delivered with ZERO formula errors (#REF!, #DIV/0!, #VALUE!, #N/A, #NAME?)

### Use Formulas, Not Hardcoded Values
**Always use Excel formulas instead of calculating values in Python and hardcoding them.**

\`\`\`python
# ❌ WRONG - Hardcoding
total = df['Sales'].sum()
sheet['B10'] = total

# ✅ CORRECT - Using formulas
sheet['B10'] = '=SUM(B2:B9)'
\`\`\`

## Reading and Analyzing Data

\`\`\`python
import pandas as pd

# Read Excel
df = pd.read_excel('file.xlsx')
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # All sheets as dict

# Analyze
df.head()
df.info()
df.describe()
\`\`\`

## Creating New Excel Files

\`\`\`python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
sheet = wb.active

# Add data
sheet['A1'] = 'Hello'
sheet.append(['Row', 'of', 'data'])

# Add formula
sheet['B2'] = '=SUM(A1:A10)'

# Formatting
sheet['A1'].font = Font(bold=True)
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')

# Column width
sheet.column_dimensions['A'].width = 20

wb.save('/home/user/output/output.xlsx')
\`\`\`

## Editing Existing Files

\`\`\`python
from openpyxl import load_workbook

wb = load_workbook('existing.xlsx')
sheet = wb.active

# Modify cells
sheet['A1'] = 'New Value'
sheet.insert_rows(2)

wb.save('/home/user/output/modified.xlsx')
\`\`\`

## Recalculating Formulas (MANDATORY)

After creating/editing files with formulas, run:
\`\`\`bash
python /home/user/scripts/xlsx/recalc.py /home/user/output/output.xlsx
\`\`\`

The script returns JSON with error details:
\`\`\`json
{
  "status": "success",
  "total_errors": 0,
  "total_formulas": 42,
  "error_summary": {}
}
\`\`\`

If errors found, fix them and recalculate again.

## Financial Model Color Coding

- **Blue text**: Hardcoded inputs
- **Black text**: Formulas and calculations
- **Green text**: Links from other worksheets
- **Yellow background**: Key assumptions needing attention

## Number Formatting

- Years: Format as text ("2024" not "2,024")
- Currency: Use $#,##0 format
- Percentages: 0.0% format
- Negatives: Use parentheses (123) not minus -123

## Quick Reference

| Task | Tool | Example |
|------|------|---------|
| Read Excel | pandas | \`pd.read_excel('file.xlsx')\` |
| Create Excel | openpyxl | \`Workbook()\` |
| Add formula | openpyxl | \`sheet['B2'] = '=SUM(A1:A10)'\` |
| Recalculate | script | \`python /home/user/scripts/xlsx/recalc.py file.xlsx\` |`,
        isCustom: false,
      },
    }),

  pdf: (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'pdf',
        name: 'pdf',
        label: 'PDF Processing',
        description:
          'PDF form filling, field extraction, table parsing, and validation',
        icon: 'IconFileTypePdf',
        content: `# PDF Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts

### Field Extraction
- \`python /home/user/scripts/pdf/extract_form_field_info.py <pdf_file>\` - Extract all fillable field names and types (JSON output)
- \`python /home/user/scripts/pdf/check_fillable_fields.py <pdf_file>\` - Check if PDF has fillable fields

### Form Filling
- \`python /home/user/scripts/pdf/fill_fillable_fields.py <pdf_file> <json_data> <output_file>\` - Fill PDF form fields
- \`python /home/user/scripts/pdf/fill_pdf_form_with_annotations.py <pdf_file> <json_data> <output_file>\` - Fill with annotation support

### Validation
- \`python /home/user/scripts/pdf/create_validation_image.py <pdf_file>\` - Create validation image of filled PDF
- \`python /home/user/scripts/pdf/check_bounding_boxes.py <pdf_file>\` - Check field boundaries
- \`python /home/user/scripts/pdf/convert_pdf_to_images.py <pdf_file>\` - Convert PDF pages to images

## Reading PDFs

\`\`\`python
import fitz  # PyMuPDF

# Open PDF
doc = fitz.open('document.pdf')

# Extract text from all pages
for page in doc:
    text = page.get_text()
    print(text)

# Extract text from specific page
page = doc[0]  # First page
text = page.get_text()
\`\`\`

## Extracting Tables

\`\`\`python
import pdfplumber

with pdfplumber.open('document.pdf') as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
\`\`\`

## Filling PDF Forms

### Step 1: Extract field information
\`\`\`bash
python /home/user/scripts/pdf/extract_form_field_info.py form.pdf > fields.json
\`\`\`

### Step 2: Create fill data JSON
\`\`\`json
{
  "field_name_1": "value1",
  "field_name_2": "value2",
  "checkbox_field": true
}
\`\`\`

### Step 3: Fill the form
\`\`\`bash
python /home/user/scripts/pdf/fill_fillable_fields.py form.pdf fill_data.json /home/user/output/output.pdf
\`\`\`

### Step 4: Validate the output
\`\`\`bash
python /home/user/scripts/pdf/create_validation_image.py /home/user/output/output.pdf
\`\`\`

## Creating PDFs

\`\`\`python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas('/home/user/output/output.pdf', pagesize=letter)
c.drawString(100, 750, 'Hello World!')
c.save()
\`\`\`

## Merging PDFs

\`\`\`python
from PyPDF2 import PdfMerger

merger = PdfMerger()
merger.append('file1.pdf')
merger.append('file2.pdf')
merger.write('/home/user/output/merged.pdf')
merger.close()
\`\`\`

## Splitting PDFs

\`\`\`python
from PyPDF2 import PdfReader, PdfWriter

reader = PdfReader('document.pdf')

# Extract specific pages
writer = PdfWriter()
writer.add_page(reader.pages[0])  # First page
writer.write('/home/user/output/page1.pdf')
\`\`\`

## Quick Reference

| Task | Tool | Command/Example |
|------|------|-----------------|
| Extract text | PyMuPDF | \`page.get_text()\` |
| Extract tables | pdfplumber | \`page.extract_tables()\` |
| List form fields | script | \`python extract_form_field_info.py form.pdf\` |
| Fill form | script | \`python fill_fillable_fields.py form.pdf data.json out.pdf\` |
| Validate fill | script | \`python create_validation_image.py filled.pdf\` |
| Create PDF | reportlab | \`canvas.Canvas('out.pdf')\` |
| Merge PDFs | PyPDF2 | \`PdfMerger()\` |`,
        isCustom: false,
      },
    }),

  docx: (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'docx',
        name: 'docx',
        label: 'Word Documents',
        description:
          'Word document creation, editing, template processing, and OOXML manipulation',
        icon: 'IconFileTypeDocx',
        content: `# Word Document Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts (OOXML Editing)

- \`python /home/user/scripts/docx/unpack.py <docx_file> <output_dir>\` - Unpack .docx to XML files for direct editing
- \`python /home/user/scripts/docx/pack.py <input_dir> <docx_file>\` - Repack XML files into .docx
- \`python /home/user/scripts/docx/validate.py <docx_file>\` - Validate document structure

### Validation Scripts
- \`/home/user/scripts/docx/validation/docx.py\` - DOCX validation module
- \`/home/user/scripts/docx/validation/redlining.py\` - Track changes/redline validation

## High-Level API (python-docx)

### Reading Documents

\`\`\`python
from docx import Document

doc = Document('document.docx')

# Read paragraphs
for para in doc.paragraphs:
    print(para.text)

# Read tables
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            print(cell.text)
\`\`\`

### Creating Documents

\`\`\`python
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# Add heading
doc.add_heading('Document Title', 0)

# Add paragraph with formatting
para = doc.add_paragraph('Normal text. ')
run = para.add_run('Bold text.')
run.bold = True

# Add table
table = doc.add_table(rows=2, cols=2)
table.cell(0, 0).text = 'Header 1'
table.cell(0, 1).text = 'Header 2'

# Add image
doc.add_picture('image.png', width=Inches(4))

doc.save('/home/user/output/output.docx')
\`\`\`

## Low-Level OOXML Editing

For complex edits (tracked changes, custom XML), use the unpack/edit/pack workflow:

### Step 1: Unpack
\`\`\`bash
python /home/user/scripts/docx/unpack.py document.docx ./unpacked/
\`\`\`

### Step 2: Edit XML directly
\`\`\`python
import xml.etree.ElementTree as ET

tree = ET.parse('./unpacked/word/document.xml')
root = tree.getroot()

# Edit XML...
# Namespaces: w = http://schemas.openxmlformats.org/wordprocessingml/2006/main

tree.write('./unpacked/word/document.xml', xml_declaration=True, encoding='UTF-8')
\`\`\`

### Step 3: Validate & Repack
\`\`\`bash
python /home/user/scripts/docx/validate.py ./unpacked/
python /home/user/scripts/docx/pack.py ./unpacked/ /home/user/output/output.docx
\`\`\`

## Template Processing

### Find and Replace
\`\`\`python
from docx import Document

doc = Document('template.docx')

for para in doc.paragraphs:
    if '{{name}}' in para.text:
        para.text = para.text.replace('{{name}}', 'John Doe')

doc.save('/home/user/output/filled.docx')
\`\`\`

### Preserve Formatting During Replace
\`\`\`python
def replace_in_paragraph(para, old_text, new_text):
    """Replace text while preserving formatting"""
    for run in para.runs:
        if old_text in run.text:
            run.text = run.text.replace(old_text, new_text)

for para in doc.paragraphs:
    replace_in_paragraph(para, '{{name}}', 'John Doe')
\`\`\`

## Working with Styles

\`\`\`python
from docx.shared import Pt, RGBColor

# Set font
run.font.name = 'Arial'
run.font.size = Pt(12)
run.font.color.rgb = RGBColor(0, 0, 0)

# Paragraph formatting
para.alignment = WD_ALIGN_PARAGRAPH.CENTER
para.paragraph_format.space_before = Pt(12)
para.paragraph_format.space_after = Pt(12)
\`\`\`

## Quick Reference

| Task | Tool | Example |
|------|------|---------|
| Read document | python-docx | \`Document('file.docx')\` |
| Create document | python-docx | \`Document()\` |
| Add heading | python-docx | \`doc.add_heading('Title', 0)\` |
| Add table | python-docx | \`doc.add_table(rows=2, cols=2)\` |
| Unpack for editing | script | \`python unpack.py doc.docx ./out/\` |
| Repack | script | \`python pack.py ./out/ doc.docx\` |
| Validate | script | \`python validate.py doc.docx\` |`,
        isCustom: false,
      },
    }),

  pptx: (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'pptx',
        name: 'pptx',
        label: 'PowerPoint',
        description:
          'PowerPoint creation, editing, templates, thumbnails, and slide manipulation',
        icon: 'IconPresentation',
        content: `# PowerPoint Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts

- \`python /home/user/scripts/pptx/thumbnail.py <pptx_file> [output_dir]\` - Generate slide thumbnails
- \`python /home/user/scripts/pptx/rearrange.py <pptx_file> <slide_order_json> <output_file>\` - Reorder slides
- \`python /home/user/scripts/pptx/inventory.py <pptx_file>\` - List all slides and their content
- \`python /home/user/scripts/pptx/replace.py <pptx_file> <replacements_json> <output_file>\` - Find/replace text

## Reading Presentations

\`\`\`python
from pptx import Presentation

prs = Presentation('presentation.pptx')

# Iterate through slides
for slide in prs.slides:
    for shape in slide.shapes:
        if shape.has_text_frame:
            print(shape.text)
\`\`\`

## Creating Presentations

\`\`\`python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()

# Add title slide
slide_layout = prs.slide_layouts[0]  # Title layout
slide = prs.slides.add_slide(slide_layout)
title = slide.shapes.title
subtitle = slide.placeholders[1]

title.text = "Presentation Title"
subtitle.text = "Subtitle goes here"

# Add content slide
slide_layout = prs.slide_layouts[1]  # Title and content
slide = prs.slides.add_slide(slide_layout)
title = slide.shapes.title
body = slide.placeholders[1]

title.text = "Slide Title"
tf = body.text_frame
tf.text = "First bullet"
p = tf.add_paragraph()
p.text = "Second bullet"
p.level = 1

prs.save('/home/user/output/output.pptx')
\`\`\`

## Adding Images

\`\`\`python
from pptx.util import Inches

slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout
slide.shapes.add_picture(
    'image.png',
    left=Inches(1),
    top=Inches(1),
    width=Inches(5)
)
\`\`\`

## Adding Tables

\`\`\`python
from pptx.util import Inches

slide = prs.slides.add_slide(prs.slide_layouts[6])
table = slide.shapes.add_table(
    rows=3, cols=3,
    left=Inches(1), top=Inches(1),
    width=Inches(8), height=Inches(2)
).table

# Set cell values
table.cell(0, 0).text = "Header 1"
table.cell(0, 1).text = "Header 2"
table.cell(1, 0).text = "Data 1"
\`\`\`

## Adding Charts

\`\`\`python
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE
from pptx.util import Inches

chart_data = CategoryChartData()
chart_data.categories = ['East', 'West', 'Midwest']
chart_data.add_series('Series 1', (19.2, 21.4, 16.7))

slide = prs.slides.add_slide(prs.slide_layouts[6])
chart = slide.shapes.add_chart(
    XL_CHART_TYPE.COLUMN_CLUSTERED,
    Inches(1), Inches(1), Inches(8), Inches(5),
    chart_data
).chart
\`\`\`

## Using Scripts

### Generate Thumbnails
\`\`\`bash
python /home/user/scripts/pptx/thumbnail.py presentation.pptx ./thumbnails/
# Creates: thumbnails/slide_1.png, slide_2.png, etc.
\`\`\`

### Get Slide Inventory
\`\`\`bash
python /home/user/scripts/pptx/inventory.py presentation.pptx
# Returns JSON with all slide content and shapes
\`\`\`

### Reorder Slides
\`\`\`bash
# Order: [3, 1, 2] means slide 3 becomes first, slide 1 second, etc.
python /home/user/scripts/pptx/rearrange.py input.pptx '[3, 1, 2]' output.pptx
\`\`\`

### Find and Replace Text
\`\`\`bash
python /home/user/scripts/pptx/replace.py input.pptx '{"{{company}}": "Acme Corp", "{{date}}": "2024"}' output.pptx
\`\`\`

## Template Processing Workflow

1. **Generate thumbnails** to understand slide structure:
   \`\`\`bash
   python /home/user/scripts/pptx/thumbnail.py template.pptx ./preview/
   \`\`\`

2. **Get inventory** to find placeholder text:
   \`\`\`bash
   python /home/user/scripts/pptx/inventory.py template.pptx
   \`\`\`

3. **Replace placeholders**:
   \`\`\`bash
   python /home/user/scripts/pptx/replace.py template.pptx '{"{{title}}": "Q4 Report"}' output.pptx
   \`\`\`

## Quick Reference

| Task | Tool | Example |
|------|------|---------|
| Read presentation | python-pptx | \`Presentation('file.pptx')\` |
| Create presentation | python-pptx | \`Presentation()\` |
| Add slide | python-pptx | \`prs.slides.add_slide(layout)\` |
| Generate thumbnails | script | \`python thumbnail.py pres.pptx ./out/\` |
| Get slide inventory | script | \`python inventory.py pres.pptx\` |
| Reorder slides | script | \`python rearrange.py pres.pptx '[2,1,3]' out.pptx\` |
| Find/replace | script | \`python replace.py pres.pptx '{...}' out.pptx\` |`,
        isCustom: false,
      },
    }),
} satisfies {
  [P in AllStandardSkillName]: (
    args: Omit<CreateStandardSkillArgs, 'context'>,
  ) => FlatSkill;
};
