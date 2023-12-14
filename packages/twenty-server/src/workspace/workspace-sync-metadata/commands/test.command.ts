import fs from 'fs';
import path from 'path';

import ts from 'typescript';
import { Command, CommandRunner } from 'nest-commander';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { WorkspaceSyncMetadataService } from 'src/workspace/workspace-sync-metadata/workspace-sync.metadata.service';

function findEntityFiles(dir, files: string[] = []) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      findEntityFiles(fullPath, files);
    } else if (file.endsWith('.entity.ts')) {
      files.push(fullPath);
    }
  });

  return files;
}

function extractClassInfoFromEntity(file) {
  const sourceFile = ts.createSourceFile(
    file,
    fs.readFileSync(file).toString(),
    ts.ScriptTarget.ES2015,
    true,
  );

  const classInfo: {
    name: string;
    properties: {
      name: string;
      type: string;
      isNullable: boolean;
      isRelation: boolean;
      relationTarget: string;
    }[];
  } = {
    name: '',
    properties: [],
  };

  function visit(node) {
    if (ts.isClassDeclaration(node) && node.name) {
      classInfo.name = node.name.getText(sourceFile);
      node.members.forEach((member) => {
        if (ts.isPropertyDeclaration(member)) {
          const property = extractPropertyInfo(member);

          classInfo.properties.push(property);
        }
      });
    }
    ts.forEachChild(node, visit);
  }
  ts.forEachChild(sourceFile, visit);

  return classInfo;
}

function extractPropertyInfo(node) {
  const property = {
    name: '',
    type: '',
    isNullable: false,
    isRelation: false,
    relationTarget: '',
  };

  property.name = node.name.getText();

  if (node.type) {
    property.type = node.type.getText();
  }

  node.decorators?.forEach((decorator) => {
    const decoratorName = decorator.expression.expression.getText();

    switch (decoratorName) {
      case 'Column':
        property.isNullable = isNullableDecorator(decorator);
        break;
      case 'OneToMany':
      case 'ManyToOne':
      case 'OneToOne':
      case 'ManyToMany':
        property.isRelation = true;
        property.relationTarget = extractRelationTarget(decorator);
        break;
      // Add more cases as needed
    }
  });

  return property;
}

function isNullableDecorator(decorator) {
  // Check if the decorator call expression has arguments
  if (decorator.expression.arguments.length > 0) {
    const argument = decorator.expression.arguments[0];

    // Check if the argument is an object literal
    if (ts.isObjectLiteralExpression(argument)) {
      // Look for a property assignment with key 'nullable'
      return argument.properties.some(
        (property) =>
          ts.isPropertyAssignment(property) &&
          property.name.getText() === 'nullable' &&
          property.initializer.kind === ts.SyntaxKind.TrueKeyword,
      );
    }
  }

  return false;
}

function extractRelationTarget(decorator) {
  // Check if the decorator call expression has arguments
  if (decorator.expression.arguments.length > 0) {
    const argument = decorator.expression.arguments[0];

    // Check if the argument is a function expression or arrow function
    if (ts.isFunctionExpression(argument) || ts.isArrowFunction(argument)) {
      // Assuming the body is a block with a return statement
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const returnStatement = argument.body.statements.find((st) =>
        ts.isReturnStatement(st),
      );

      if (returnStatement && returnStatement.expression) {
        return returnStatement.expression.getText();
      }
    }
  }

  return '';
}

function generateMetadataClass(classInfo) {
  const metadataClassName = `${classInfo.name}ObjectMetadata`;
  let metadataClassCode = `@ObjectMetadata({\n`;

  metadataClassCode += `  namePlural: '${classInfo.name.toLowerCase()}s',\n`;
  metadataClassCode += `  labelSingular: '${classInfo.name}',\n`;
  metadataClassCode += `  labelPlural: '${classInfo.name}s',\n`;
  metadataClassCode += `  description: 'Metadata for ${classInfo.name}',\n`;
  metadataClassCode += `  icon: 'your_icon_here',\n`;
  metadataClassCode += `})\n`;
  metadataClassCode += `export class ${metadataClassName} extends BaseObjectMetadata {\n`;

  console.log(classInfo);

  for (const property of classInfo.properties) {
    const type = mapTypeORMTypeToMetadataType(property.type);

    metadataClassCode += `  @FieldMetadata({\n`;
    metadataClassCode += `    type: FieldMetadataType.${type},\n`;
    metadataClassCode += `    label: '${property.name}',\n`;
    metadataClassCode += `    description: 'Description for ${property.name}',\n`;
    metadataClassCode += `    icon: 'Icon_for_${property.name}',\n`;
    metadataClassCode += `  })\n`;

    if (property.isNullable) {
      metadataClassCode += `  @IsNullable()\n`;
    }

    if (property.isRelation) {
      metadataClassCode += `  @RelationMetadata({\n`;
      metadataClassCode += `    type: RelationMetadataType.ONE_TO_MANY, // or adjust based on actual relation\n`;
      metadataClassCode += `    objectName: '${mapRelationObjectName(
        property.relationTarget,
      )}',\n`;
      metadataClassCode += `  })\n`;
    }

    metadataClassCode += `  ${property.name}: ${property.type};\n`;
  }

  metadataClassCode += `}\n`;

  return { metadataClassName, metadataClassCode };
}

function mapTypeORMTypeToMetadataType(type) {
  // Placeholder function: map TypeORM types to FieldMetadataType enums
  // Example:
  switch (type) {
    case 'string':
      return 'TEXT';
    case 'number':
      return 'NUMBER';
    // Add other mappings as needed
    default:
      return 'UNKNOWN';
  }
}

function mapRelationObjectName(relationTarget) {
  // Convert relation target class name to the expected object name format
  // Adjust this function based on your naming conventions and requirements
  return relationTarget.toLowerCase();
}

@Command({
  name: 'workspace:test',
  description: 'Test',
})
export class TestWorkspaceMetadataCommand extends CommandRunner {
  constructor(
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly dataSourceService: DataSourceService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const entityFiles = findEntityFiles('./src/core');

    entityFiles.forEach((file) => {
      const classInfo = extractClassInfoFromEntity(file);
      const { metadataClassName, metadataClassCode } =
        generateMetadataClass(classInfo);

      fs.writeFileSync(
        `./src/workspace/workspace-sync-metadata/core-objects/${metadataClassName.toLowerCase()}.object-metadata.ts`,
        metadataClassCode,
      );

      console.log(metadataClassCode); // Or write to a file
    });
  }
}
