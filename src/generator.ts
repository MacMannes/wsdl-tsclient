import camelcase from "camelcase";
import path from "path";
import {
    ImportDeclarationStructure,
    MethodSignatureStructure,
    OptionalKind,
    Project,
    PropertySignatureStructure,
    SourceFile,
    StructureKind,
} from "ts-morph";
import { ModelPropertyNaming } from ".";
import { Definition, DefinitionAttribute, Method, ParsedWsdl, SimpleTypeDefinition } from "./models/parsed-wsdl";
import { Logger } from "./utils/logger";

export interface GeneratorOptions {
    emitDefinitionsOnly: boolean;
    modelPropertyNaming: ModelPropertyNaming;
}

const defaultOptions: GeneratorOptions = {
    emitDefinitionsOnly: false,
    modelPropertyNaming: null,
};

const simpleTypeDefinitionsName = "SimpleTypeDefinitions";

/**
 * To avoid duplicated imports
 */
function addSafeImport(
    imports: OptionalKind<ImportDeclarationStructure>[],
    moduleSpecifier: string,
    namedImport: string
) {
    const importDeclaration = imports.find((imp) => imp.moduleSpecifier == moduleSpecifier);

    if (importDeclaration) {
        // ImportDeclaration already exists
        if (Array.isArray(importDeclaration.namedImports)) {
            const namedImports = importDeclaration.namedImports as Array<any>;
            if (
                !namedImports.find((imp) => (typeof imp == "object" && imp.name == namedImport) || imp === namedImport)
            ) {
                // namedImport does not exist yet, so let's add it
                namedImports.push(namedImport);
            }
        }
    } else {
        // ImportDeclaration does not exist yet, so we can add a new one
        imports.push({
            moduleSpecifier,
            namedImports: [{ name: namedImport }],
        });
    }
}

const incorrectPropNameChars = [" ", "-", "."];
/**
 * This is temporally method to fix this issue https://github.com/dsherret/ts-morph/issues/1160
 */
function sanitizePropName(propName: string) {
    if (incorrectPropNameChars.some((char) => propName.includes(char))) {
        return `"${propName}"`;
    }
    return propName;
}

function createProperty(
    name: string,
    type: string,
    isArray: boolean,
    doc?: string,
    optional = false
): PropertySignatureStructure {
    return {
        kind: StructureKind.PropertySignature,
        name: sanitizePropName(name),
        docs: doc ? [doc] : undefined,
        hasQuestionToken: optional,
        type: isArray ? `Array<${type}>` : type,
    };
}

function generateDefinitionFile(
    project: Project,
    definition: null | Definition,
    defDir: string,
    stack: string[],
    generated: Definition[],
    options: GeneratorOptions,
    allDefinitionNames?: string[],
    simpleTypeDefinitions?: { [name: string]: SimpleTypeDefinition }
): void {
    const defName = definition.name;
    const defFilePath = path.join(defDir, `${defName}.ts`);
    const defFile = project.createSourceFile(defFilePath, "", {
        overwrite: true,
    });

    generated.push(definition);

    const definitionImports: OptionalKind<ImportDeclarationStructure>[] = [];
    const definitionProperties: PropertySignatureStructure[] = [];
    for (const prop of definition.properties) {
        if (options.modelPropertyNaming) {
            switch (options.modelPropertyNaming) {
                case ModelPropertyNaming.camelCase:
                    prop.name = camelcase(prop.name);
                    break;
                case ModelPropertyNaming.PascalCase:
                    prop.name = camelcase(prop.name, { pascalCase: true });
                    break;
            }
        }
        if (prop.kind === "PRIMITIVE") {
            // e.g. string
            definitionProperties.push(
                createProperty(prop.name, prop.type, prop.isArray, prop.description, prop.isOptional)
            );
        } else if (prop.kind === "SCHEMA") {
            // Definition which is parsed from schema
            const type = prop.type;
            if (simpleTypeDefinitions) {
                const simpleTypeDefinition: SimpleTypeDefinition | undefined = simpleTypeDefinitions[type];
                if (simpleTypeDefinition) {
                    addSafeImport(definitionImports, `./${simpleTypeDefinitionsName}`, prop.type);
                } else {
                    addSafeImport(definitionImports, `./${prop.type}`, prop.type);
                }
            } else {
                addSafeImport(definitionImports, `./${prop.type}`, prop.type);
            }

            definitionProperties.push(createProperty(prop.name, type, prop.isArray, prop.description, prop.isOptional));
        } else if (prop.kind === "REFERENCE") {
            // e.g. Items
            if (!generated.includes(prop.ref)) {
                // Wasn't generated yet
                generateDefinitionFile(project, prop.ref, defDir, [...stack, prop.ref.name], generated, options);
            }
            // If a property is of the same type as its parent type, don't add import
            if (prop.ref.name !== definition.name) {
                addSafeImport(definitionImports, `./${prop.ref.name}`, prop.ref.name);
            }
            definitionProperties.push(
                createProperty(prop.name, prop.ref.name, prop.isArray, prop.sourceName, prop.isOptional)
            );
        }
    }

    if (definition.attributes.length > 0) {
        const attributesName = `${defName}Attributes`;
        definitionProperties.push(createProperty("attributes", attributesName, false, undefined, false));
        generateAttributesDefinition(defFile, definitionImports, attributesName, definition.attributes);
    }

    defFile.addImportDeclarations(definitionImports);
    defFile.addStatements([
        {
            leadingTrivia: (writer) => writer.newLine(),
            isExported: true,
            name: defName,
            docs: [definition.docs.join("\n")],
            kind: StructureKind.Interface,
            properties: definitionProperties,
        },
    ]);
    Logger.log(`Writing Definition file: ${path.resolve(path.join(defDir, defName))}.ts`);
    defFile.saveSync();
}

function generateAttributesDefinition(
    sourceFile: SourceFile,
    definitionImports: OptionalKind<ImportDeclarationStructure>[],
    name: string,
    attributes: Array<DefinitionAttribute>
) {
    const attributeProperties: PropertySignatureStructure[] = [];

    attributes.forEach((prop) => {
        const isOptional = prop.use != "required";
        attributeProperties.push(createProperty(prop.name, prop.type, false, undefined, isOptional));
    });

    sourceFile.addStatements([
        {
            leadingTrivia: (writer) => writer.newLine(),
            isExported: true,
            name: name,
            kind: StructureKind.Interface,
            properties: attributeProperties,
        },
    ]);
}

function generateEnumDefinition(sourceFile: SourceFile, name: string, enumerationValues: string[]) {
    sourceFile.addTypeAlias({
        name: name,
        type: (writer) => {
            writer.write(enumerationValues.map((it) => `"${it}"`).join(" | "));
        },
        isExported: true,
    });
}

function generateTypeDefinition(sourceFile: SourceFile, name: string, type: string) {
    sourceFile.addTypeAlias({
        name: name,
        type: type,
        isExported: true,
    });
}

export async function generate(
    parsedWsdl: ParsedWsdl,
    outDir: string,
    options: Partial<GeneratorOptions>
): Promise<void> {
    const mergedOptions: GeneratorOptions = {
        ...defaultOptions,
        ...options,
    };
    const project = new Project();

    const portsDir = path.join(outDir, "ports");
    const servicesDir = path.join(outDir, "services");
    const defDir = path.join(outDir, "definitions");

    const allMethods: Method[] = [];
    const allDefinitions: Definition[] = [];

    const clientImports: Array<OptionalKind<ImportDeclarationStructure>> = [];
    const clientServices: Array<OptionalKind<PropertySignatureStructure>> = [];
    for (const service of parsedWsdl.services) {
        const serviceFilePath = path.join(servicesDir, `${service.name}.ts`);
        const serviceFile = project.createSourceFile(serviceFilePath, "", {
            overwrite: true,
        });

        const serviceImports: Array<OptionalKind<ImportDeclarationStructure>> = [];
        const servicePorts: Array<OptionalKind<PropertySignatureStructure>> = [];
        for (const port of parsedWsdl.ports) {
            const portFilePath = path.join(portsDir, `${port.name}.ts`);
            const portFile = project.createSourceFile(portFilePath, "", {
                overwrite: true,
            });

            const portImports: Array<OptionalKind<ImportDeclarationStructure>> = [];
            const portFileMethods: Array<OptionalKind<MethodSignatureStructure>> = [];
            for (const method of port.methods) {
                // TODO: Deduplicate PortImports
                if (method.paramDefinition !== null) {
                    if (!allDefinitions.includes(method.paramDefinition)) {
                        // Definition is not generated
                        generateDefinitionFile(
                            project,
                            method.paramDefinition,
                            defDir,
                            [method.paramDefinition.name],
                            allDefinitions,
                            mergedOptions
                        );
                        addSafeImport(
                            clientImports,
                            `./definitions/${method.paramDefinition.name}`,
                            method.paramDefinition.name
                        );
                    }
                    addSafeImport(
                        portImports,
                        `../definitions/${method.paramDefinition.name}`,
                        method.paramDefinition.name
                    );
                }
                if (method.returnDefinition !== null) {
                    if (!allDefinitions.includes(method.returnDefinition)) {
                        // Definition is not generated
                        generateDefinitionFile(
                            project,
                            method.returnDefinition,
                            defDir,
                            [method.returnDefinition.name],
                            allDefinitions,
                            mergedOptions
                        );
                        addSafeImport(
                            clientImports,
                            `./definitions/${method.returnDefinition.name}`,
                            method.returnDefinition.name
                        );
                    }
                    addSafeImport(
                        portImports,
                        `../definitions/${method.returnDefinition.name}`,
                        method.returnDefinition.name
                    );
                }
                // TODO: Deduplicate PortMethods
                allMethods.push(method);
                portFileMethods.push({
                    name: sanitizePropName(method.name),
                    parameters: [
                        {
                            name: camelcase(method.paramName),
                            type: method.paramDefinition ? method.paramDefinition.name : "{}",
                        },
                        {
                            name: "callback",
                            type: `(err: any, result: ${
                                method.returnDefinition ? method.returnDefinition.name : "unknown"
                            }, rawResponse: any, soapHeader: any, rawRequest: any) => void`, // TODO: Use ts-morph to generate proper type
                        },
                    ],
                    returnType: "void",
                });
            } // End of PortMethod
            if (!mergedOptions.emitDefinitionsOnly) {
                addSafeImport(serviceImports, `../ports/${port.name}`, port.name);
                servicePorts.push({
                    name: sanitizePropName(port.name),
                    isReadonly: true,
                    type: port.name,
                });
                portFile.addImportDeclarations(portImports);
                portFile.addStatements([
                    {
                        leadingTrivia: (writer) => writer.newLine(),
                        isExported: true,
                        kind: StructureKind.Interface,
                        name: port.name,
                        methods: portFileMethods,
                    },
                ]);
                Logger.log(`Writing Port file: ${await path.resolve(path.join(portsDir, port.name))}.ts`);
                portFile.saveSync();
            }
        } // End of Port

        if (!mergedOptions.emitDefinitionsOnly) {
            addSafeImport(clientImports, `./services/${service.name}`, service.name);
            clientServices.push({ name: sanitizePropName(service.name), type: service.name });

            serviceFile.addImportDeclarations(serviceImports);
            serviceFile.addStatements([
                {
                    leadingTrivia: (writer) => writer.newLine(),
                    isExported: true,
                    kind: StructureKind.Interface,
                    name: service.name,
                    properties: servicePorts,
                },
            ]);
            Logger.log(`Writing Service file: ${await path.resolve(path.join(servicesDir, service.name))}.ts`);
            serviceFile.saveSync();
        }
    } // End of Service

    // Process all schema definitions
    for (const definition of parsedWsdl.definitions) {
        generateDefinitionFile(
            project,
            definition,
            defDir,
            [definition.name],
            allDefinitions,
            mergedOptions,
            parsedWsdl.definitions.map((it) => it.name),
            parsedWsdl.simpleTypeDefinitions
        );
    }

    // Create SimpleTypeDefinitions file
    const simpleTypeDefinitionsFilePath = path.join(defDir, simpleTypeDefinitionsName + ".ts");
    const simpleTypeDefinitionsFile = project.createSourceFile(simpleTypeDefinitionsFilePath, "", {
        overwrite: true,
    });

    // Process all simpleTypeDefinitions
    for (const key in parsedWsdl.simpleTypeDefinitions) {
        const definition = parsedWsdl.simpleTypeDefinitions[key];
        if (definition.enumerationValues) {
            generateEnumDefinition(simpleTypeDefinitionsFile, definition.name, definition.enumerationValues);
        } else {
            generateTypeDefinition(simpleTypeDefinitionsFile, definition.name, definition.type);
        }
    }

    // Write simpleTypeDefinitions file
    Logger.log(
        `Writing SimpleTypeDefinitions file: ${await path.resolve(path.join(defDir, "SimpleTypeDefinitions"))}.ts`
    );
    simpleTypeDefinitionsFile.saveSync();

    if (!mergedOptions.emitDefinitionsOnly) {
        const clientFilePath = path.join(outDir, "client.ts");
        const clientFile = project.createSourceFile(clientFilePath, "", {
            overwrite: true,
        });
        clientFile.addImportDeclaration({
            moduleSpecifier: "soap",
            namedImports: [
                { name: "Client", alias: "SoapClient" },
                { name: "createClientAsync", alias: "soapCreateClientAsync" },
            ],
        });
        clientFile.addImportDeclarations(clientImports);
        clientFile.addStatements([
            {
                leadingTrivia: (writer) => writer.newLine(),
                isExported: true,
                kind: StructureKind.Interface,
                // docs: [`${parsedWsdl.name}Client`],
                name: `${parsedWsdl.name}Client`,
                properties: clientServices,
                extends: ["SoapClient"],
                methods: allMethods.map<OptionalKind<MethodSignatureStructure>>((method) => ({
                    name: sanitizePropName(`${method.name}Async`),
                    parameters: [
                        {
                            name: camelcase(method.paramName),
                            type: method.paramDefinition ? method.paramDefinition.name : "{}",
                        },
                    ],
                    returnType: `Promise<[result: ${
                        method.returnDefinition ? method.returnDefinition.name : "unknown"
                    }, rawResponse: any, soapHeader: any, rawRequest: any]>`,
                })),
            },
        ]);
        const createClientDeclaration = clientFile.addFunction({
            name: "createClientAsync",
            docs: [`Create ${parsedWsdl.name}Client`],
            isExported: true,
            parameters: [
                {
                    isRestParameter: true,
                    name: "args",
                    type: "Parameters<typeof soapCreateClientAsync>",
                },
            ],
            returnType: `Promise<${parsedWsdl.name}Client>`, // TODO: `any` keyword is very dangerous
        });
        createClientDeclaration.setBodyText("return soapCreateClientAsync(args[0], args[1], args[2]) as any;");
        Logger.log(`Writing Client file: ${await path.resolve(path.join(outDir, "client"))}.ts`);
        clientFile.saveSync();
    }

    // Create index file with re-exports
    const indexFilePath = path.join(outDir, "index.ts");
    const indexFile = project.createSourceFile(indexFilePath, "", {
        overwrite: true,
    });

    indexFile.addExportDeclarations(
        allDefinitions.map((def) => ({
            namedExports: [def.name],
            moduleSpecifier: `./definitions/${def.name}`,
        }))
    );
    if (!mergedOptions.emitDefinitionsOnly) {
        // TODO: Aggregate all exports during declarations generation
        // https://ts-morph.com/details/exports
        indexFile.addExportDeclarations([
            {
                namedExports: ["createClientAsync", `${parsedWsdl.name}Client`],
                moduleSpecifier: "./client",
            },
        ]);
        indexFile.addExportDeclarations(
            parsedWsdl.services.map((service) => ({
                namedExports: [service.name],
                moduleSpecifier: `./services/${service.name}`,
            }))
        );
        indexFile.addExportDeclarations(
            parsedWsdl.ports.map((port) => ({
                namedExports: [port.name],
                moduleSpecifier: `./ports/${port.name}`,
            }))
        );
    }

    Logger.log(`Writing Index file: ${await path.resolve(path.join(outDir, "index"))}.ts`);

    indexFile.saveSync();
}
