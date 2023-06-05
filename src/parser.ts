import * as path from "path";
import {
    Element,
    ElementElement,
    ExtensionElement,
    ComplexTypeElement,
    SimpleTypeElement,
} from "soap/lib/wsdl/elements";
import { open_wsdl } from "soap/lib/wsdl/index";
import {
    Definition,
    DefinitionAttribute,
    DefinitionProperty,
    Method,
    ParsedElement,
    ParsedWsdl,
    Port,
    Service,
    SimpleTypeDefinition,
    XmlType,
} from "./models/parsed-wsdl";
import { changeCase } from "./utils/change-case";
import { stripExtension } from "./utils/file";
import { reservedKeywords } from "./utils/javascript";
import { Logger } from "./utils/logger";

export interface ParserOptions {
    modelNamePreffix: string;
    modelNameSuffix: string;
    convertCase: boolean;
    maxRecursiveDefinitionName: number;
}

const defaultOptions: ParserOptions = {
    modelNamePreffix: "",
    modelNameSuffix: "",
    convertCase: true,
    maxRecursiveDefinitionName: 64,
};

type VisitedDefinition = {
    name: string;
    parts: object;
    definition: Definition;
};

/* eslint-disable prettier/prettier */
const NODE_SOAP_PARSED_TYPES: Record<string, string> = Object.entries({
    "decimal":              "number",
    "integer":              "number",
    "int":                  "number",
    "long":                 "number",
    "short":                "number",
    "double":               "number",
    "float":                "number",
    "byte":                 "number",
    "unsignedInt":          "number",
    "unsignedLong":         "number",
    "unsignedShort":        "number",
    "unsignedByte":         "number",
    "positiveInteger":      "number",
    "negativeInteger":      "number",
    "nonPositiveInteger":   "number",
    "nonNegativeInteger":   "number",

    "boolean":              "boolean",
    "bool":                 "boolean",

    "date":                 "Date",
    "dateTime":             "Date",

    "string":               "string",
    "duration":             "string",
    "time":                 "string",
    "gYearMonth":           "string",
    "gYear":                "string",
    "gMonthDay":            "string",
    "gDay":                 "string",
    "gMonth":               "string",
    "hexBinary":            "string",
    "base64Binary":         "string",
    "anyURI":               "string",
    "QName":                "string",
    "NOTATION":             "string",
    "normalizedString":     "string",
    "token":                "string",
    "language":             "string",
    "NMTOKEN":              "string",
    "NMTOKENS":             "string",
    "Name":                 "string",
    "NCName":               "string",
    "ID":                   "string",
    "IDREF":                "string",
    "IDREFS":               "string",
    "ENTITY":               "string",
    "ENTITIES":             "string",
}).reduce((pv, cv) => {
    return {
        ...pv,
        [cv[0]]: cv[1],
        ["xs:" + cv[0]]: cv[1],
    }
}, {});
/* eslint-enable */

/**
 * Create new definition
 * @param parsedWsdl context of parsed wsdl
 * @param options ParserOptions
 * @param name name of definition, will be used as name of interface
 * @param stack definitions stack of path to current subdefinition (immutable)
 */
function createDefinition(parsedWsdl: ParsedWsdl, options: ParserOptions, name: string, stack: string[]): Definition {
    const defName = changeCase(name, options, { pascalCase: true });

    Logger.debug(`Creating Definition ${stack.join(".")}.${name}`);

    let nonCollisionDefName: string;
    try {
        nonCollisionDefName = parsedWsdl.findNonCollisionDefinitionName(defName);
    } catch (err) {
        const e = new Error(`Error for finding non-collision definition name for ${stack.join(".")}.${name}`);
        e.stack.split("\n").slice(0, 2).join("\n") + "\n" + err.stack;
        throw e;
    }
    const definition: Definition = {
        name: `${options.modelNamePreffix}${changeCase(nonCollisionDefName, options, { pascalCase: true })}${
            options.modelNameSuffix
        }`,
        sourceName: name,
        docs: [name],
        properties: [],
        attributes: [],
        description: "",
        optional: false,
    };

    // parsedWsdl.definitions.push(definition); // Must be here to avoid name collision with `findNonCollisionDefinitionName` if sub-definition has same name

    return definition;
}

// TODO: Add logs
// TODO: Add comments for services, ports, methods and client
/**
 * Parse WSDL to domain model `ParsedWsdl`
 * @param wsdlPath - path or url to wsdl file
 */
export async function parseWsdl(wsdlPath: string, options: Partial<ParserOptions>): Promise<ParsedWsdl> {
    const mergedOptions: ParserOptions = {
        ...defaultOptions,
        ...options,
    };
    return new Promise((resolve, reject) => {
        open_wsdl(
            wsdlPath,
            {
                namespaceArrayElements: false,
                ignoredNamespaces: ["tns", "targetNamespace", "typeNamespace"],
            },
            function (err, wsdl) {
                if (err) {
                    return reject(err);
                }
                if (wsdl === undefined) {
                    return reject(new Error("WSDL is undefined"));
                }

                const parsedWsdl = new ParsedWsdl({ maxStack: options.maxRecursiveDefinitionName });
                const filename = path.basename(wsdlPath);
                // We always want to convert the case of the filenames
                const fileOptions = {
                    ...mergedOptions,
                    convertCase: true,
                };
                parsedWsdl.name = changeCase(stripExtension(filename), fileOptions, {
                    pascalCase: true,
                });
                parsedWsdl.wsdlFilename = path.basename(filename);
                parsedWsdl.wsdlPath = path.resolve(wsdlPath);

                const visitedDefinitions: Array<VisitedDefinition> = [];

                const allMethods: Method[] = [];
                const allPorts: Port[] = [];
                const services: Service[] = [];
                for (const [serviceName, service] of Object.entries(wsdl.definitions.services)) {
                    Logger.debug(`Parsing Service ${serviceName}`);
                    const servicePorts: Port[] = []; // TODO: Convert to Array

                    for (const [portName, port] of Object.entries(service.ports)) {
                        Logger.debug(`Parsing Port ${portName}`);
                        const portMethods: Method[] = [];

                        for (const [methodName, method] of Object.entries(port.binding.methods)) {
                            Logger.debug(`Parsing Method ${methodName}`);

                            // TODO: Deduplicate code below by refactoring it to external function. Is it even possible ?
                            let paramName = "request";
                            let inputType: XmlType = null; // default type

                            if (method.input) {
                                Logger.debug(`Parsing Method ${methodName}.input`);
                                if (method.input.$name) {
                                    paramName = method.input.$name;
                                }
                                const inputMessage = wsdl.definitions.messages[method.input.$name];
                                if (inputMessage.element) {
                                    Logger.debug(`Handling ${methodName}.input.element`);
                                    inputType = getXmlType(inputMessage.element.$name, inputMessage.element.$type);
                                } else if (inputMessage.parts) {
                                    Logger.debug(`Handling ${methodName}.input.parts`);
                                    inputType = getXmlType(paramName);
                                } else {
                                    Logger.debug(
                                        `Method '${serviceName}.${portName}.${methodName}' doesn't have any input defined`
                                    );
                                }
                            }

                            let outputType: XmlType = null; // default type

                            if (method.output) {
                                Logger.debug(`Parsing Method ${methodName}.output`);
                                const outputMessage = wsdl.definitions.messages[method.output.$name];
                                if (outputMessage.element) {
                                    outputType = getXmlType(outputMessage.element.$name, outputMessage.element.$type);
                                } else {
                                    outputType = getXmlType(paramName);
                                }
                            }

                            // We always want to convert the case of the param names
                            const camelOptions = {
                                ...mergedOptions,
                                convertCase: true,
                            };
                            const camelParamName = changeCase(paramName, camelOptions, { pascalCase: false });
                            const portMethod: Method = {
                                name: methodName,
                                paramName: reservedKeywords.includes(camelParamName)
                                    ? `${camelParamName}Param`
                                    : camelParamName,
                                paramType: inputType,
                                returnType: outputType,
                            };
                            portMethods.push(portMethod);
                            allMethods.push(portMethod);
                        }

                        const servicePort: Port = {
                            name: changeCase(portName, mergedOptions, { pascalCase: true }),
                            sourceName: portName,
                            methods: portMethods,
                        };
                        servicePorts.push(servicePort);
                        allPorts.push(servicePort);
                    } // End of Port cycle

                    services.push({
                        name: changeCase(serviceName, mergedOptions, { pascalCase: true }),
                        sourceName: serviceName,
                        ports: servicePorts,
                    });
                } // End of Service cycle

                parsedWsdl.services = services;
                parsedWsdl.ports = allPorts;
                parsedWsdl.definitions = [];

                // Parse Schemas
                for (const [nameSpace, schemaElement] of Object.entries(wsdl.definitions.schemas)) {
                    Logger.debug(`Parsing NameSpace: ${nameSpace}}`);

                    // Parse ComplexTypes
                    for (const [name, complexType] of Object.entries(schemaElement.complexTypes)) {
                        const definition = parseComplexType(parsedWsdl, mergedOptions, name, complexType, nameSpace);
                        parsedWsdl.definitions.push(definition);
                    }

                    // Parse SimpleTypes
                    for (const [name, simpleType] of Object.entries(schemaElement.types)) {
                        const simpleTypeDefinition = parseSimpleType(parsedWsdl, mergedOptions, name, simpleType);
                        parsedWsdl.simpleTypeDefinitions[simpleTypeDefinition.name] = simpleTypeDefinition;
                    }
                }

                return resolve(parsedWsdl);
            }
        );
    });
}

function parseComplexType(
    parsedWsdl: ParsedWsdl,
    options: ParserOptions,
    name: string,
    complexType: ComplexTypeElement,
    nameSpace: string
): Definition {
    const defName = changeCase(name, options, { pascalCase: true });

    Logger.debug(`Parsing ComplexType name=${defName}`);

    const definition = createDefinition(parsedWsdl, options, defName, [nameSpace]);

    complexType.children.forEach((child) => {
        Logger.debug(`Parsing Element: ${child.name}`);

        const element = parseElement(child, options);
        if (element) {
            if (element.properties) {
                for (const property of element.properties) {
                    definition.properties.push(property);
                }
            }
            if (element.attribute) {
                definition.attributes.push(element.attribute);
            }

            if (element.extension?.properties) {
                for (const property of element.extension.properties) {
                    definition.properties.push(property);
                }
            }
            if (element.extension?.attributes) {
                for (const attribute of element.extension.attributes) {
                    definition.attributes.push(attribute);
                }
            }
        }
    });

    return definition;
}

function getNodeSoapParsedType(type?: string): string | undefined {
    if (!type) return undefined;

    const lookupType = type.startsWith("xsd:") ? type.substring(4) : type;

    return NODE_SOAP_PARSED_TYPES[lookupType];
}

function parseSimpleType(
    parsedWsdl: ParsedWsdl,
    options: ParserOptions,
    name: string,
    simpleType: SimpleTypeElement
): SimpleTypeDefinition {
    const defName = changeCase(name, options, { pascalCase: true });

    let type = "string";
    const enumerationValues: string[] = [];

    simpleType.children.forEach((child) => {
        if (child.name == "restriction") {
            type = (child as any).$base;
            if (type.startsWith(`${child.prefix}:`)) {
                type = type.substring(child.prefix.length + 1);
            }

            child.children.forEach((restriction: any) => {
                if (restriction.name == "enumeration") {
                    enumerationValues.push(restriction.$value);
                }
            });
        }
    });

    let shouldAddImport = true;
    const nodeSoapType: string | undefined = getNodeSoapParsedType(type);
    if (nodeSoapType) {
        type = nodeSoapType;
        shouldAddImport = false;
    } else {
        if (type) {
            type = changeCase(type, options, { pascalCase: true });
        }
    }

    if (Logger.isDebug) {
        let allowedValuesAsString = "";
        if (enumerationValues.length > 0) {
            allowedValuesAsString = `, allowedValues=${enumerationValues.join(", ")}`;
        }

        Logger.debug(`Parsing SimpleType name=${defName}, type=${type}, ${allowedValuesAsString}`);
    }

    return {
        name: defName,
        type: type,
        enumerationValues: enumerationValues.length > 0 ? enumerationValues : undefined,
        shouldAddImport: shouldAddImport,
    };
}

function addSafeProperty(properties: DefinitionProperty[], property: DefinitionProperty) {
    const existingProperty = properties.find((it) => it.name == property.name);
    if (!existingProperty) properties.push(property);
}

function parseElement(element: Element, options: ParserOptions, optional?: boolean): ParsedElement | undefined {
    switch (element.name) {
        case "annotation": {
            break;
        }
        case "element": {
            const properties: DefinitionProperty[] = [];

            const name = element.$name;
            const propName = changeCase(name, options, { pascalCase: true });

            const minOccurs = (element as ElementElement).$minOccurs;
            const maxOccurs = (element as ElementElement).$maxOccurs;
            const isArray = maxOccurs && maxOccurs != "1";
            const isOptional = optional || minOccurs == "0";
            let type = (element as any).$type;

            const nodeSoapType: string | undefined = getNodeSoapParsedType(type);
            let shouldAddImport = true;
            if (nodeSoapType) {
                type = nodeSoapType;
                shouldAddImport = false;
            } else {
                if (type) {
                    type = changeCase(type, options, { pascalCase: true });
                }
            }

            if (Logger.isDebug) {
                const isArrayText = isArray ? `, isArray=true` : "";
                const isOptionalText = isOptional ? `, isOptional=true` : "";
                Logger.debug(`  Child name=${propName}, type=${type}${isOptionalText}${isArrayText}`);
            }

            switch (name) {
                case "sequence": {
                    Logger.debug("Begin nested sequence");
                    const parsedElement = parseElement(element, options, false);
                    if (parsedElement && parsedElement.properties) {
                        for (const property of parsedElement.properties) {
                            addSafeProperty(properties, property);
                        }
                    }
                    Logger.debug("End nested sequence");
                    break;
                }

                case "any": {
                    break;
                }
                default: {
                    properties.push({
                        name: propName,
                        sourceName: name,
                        type: type,
                        isArray: isArray,
                        isOptional: isOptional,
                        shouldAddImport: shouldAddImport,
                    });
                    break;
                }
            }

            return { properties: properties };
        }
        case "sequence": {
            const properties: DefinitionProperty[] = [];

            for (const child of element.children) {
                const parsedElement = parseElement(child, options, optional);
                if (parsedElement && parsedElement.properties) {
                    for (const property of parsedElement.properties) {
                        addSafeProperty(properties, property);
                    }
                }
            }

            return { properties: properties };
        }
        case "choice": {
            Logger.debug("Begin Choice");

            const properties: DefinitionProperty[] = [];

            for (const choiceElement of element.children) {
                const parsedElement = parseElement(choiceElement, options, true);
                if (parsedElement && parsedElement.properties) {
                    for (const property of parsedElement.properties) {
                        addSafeProperty(properties, property);
                    }
                }
            }
            Logger.debug("End Choice");

            return { properties: properties };
        }
        case "attribute": {
            Logger.debug(
                `Attribute name=${element.$name}, type=${(element as ElementElement).$type}, use: ${
                    (element as any).$use
                }`
            );

            let type = "string";
            let shouldAddImport = true;
            const nodeSoapType: string | undefined = NODE_SOAP_PARSED_TYPES[type];
            if (nodeSoapType) {
                type = nodeSoapType;
                shouldAddImport = false;
            }

            return {
                attribute: {
                    name: element.$name,
                    shouldAddImport: shouldAddImport,
                    type: type,
                    use: (element as any).$use,
                },
            };
        }
        case "simpleContent": {
            const attributes: DefinitionAttribute[] = [];
            const properties: DefinitionProperty[] = [];

            for (const child of element.children) {
                if (child instanceof ExtensionElement) {
                    Logger.debug("Begin Extension");
                    for (const grandChild of child.children) {
                        const parsedElement = parseElement(grandChild, options);
                        if (parsedElement) {
                            Logger.debug(`  element: ${JSON.stringify(parsedElement)}`);
                            if (parsedElement.attribute) {
                                attributes.push(parsedElement.attribute);
                            }
                        }
                    }
                    Logger.debug("End Extension");
                }
            }

            if (properties.length == 0) {
                properties.push({
                    name: "$value",
                    sourceName: "value",
                    type: "string",
                    isArray: false,
                    isOptional: true,
                    shouldAddImport: false,
                });
            }

            return {
                extension: {
                    properties: properties,
                    attributes: attributes.length > 0 ? attributes : undefined,
                },
            };
        }
    }

    return undefined;
}

function getXmlType(name: string, type?: string): XmlType {
    if (type) {
        const parts = type.split(":");
        if (parts.length == 2) {
            return { name: name, nameSpace: parts[0], type: parts[1] };
        } else {
            return { name: name, type: type };
        }
    }

    return { name: name, type: "any" };
}
