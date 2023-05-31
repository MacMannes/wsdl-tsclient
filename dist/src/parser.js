"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWsdl = void 0;
var path = __importStar(require("path"));
var elements_1 = require("soap/lib/wsdl/elements");
var index_1 = require("soap/lib/wsdl/index");
var parsed_wsdl_1 = require("./models/parsed-wsdl");
var change_case_1 = require("./utils/change-case");
var file_1 = require("./utils/file");
var javascript_1 = require("./utils/javascript");
var logger_1 = require("./utils/logger");
var defaultOptions = {
    modelNamePreffix: "",
    modelNameSuffix: "",
    convertCase: true,
    maxRecursiveDefinitionName: 64,
};
/* eslint-disable prettier/prettier */
var NODE_SOAP_PARSED_TYPES = Object.entries({
    "decimal": "number",
    "integer": "number",
    "int": "number",
    "long": "number",
    "short": "number",
    "double": "number",
    "float": "number",
    "byte": "number",
    "unsignedInt": "number",
    "unsignedLong": "number",
    "unsignedShort": "number",
    "unsignedByte": "number",
    "positiveInteger": "number",
    "negativeInteger": "number",
    "nonPositiveInteger": "number",
    "nonNegativeInteger": "number",
    "boolean": "boolean",
    "bool": "boolean",
    "date": "Date",
    "dateTime": "Date",
    "string": "string",
    "duration": "string",
    "time": "string",
    "gYearMonth": "string",
    "gYear": "string",
    "gMonthDay": "string",
    "gDay": "string",
    "gMonth": "string",
    "hexBinary": "string",
    "base64Binary": "string",
    "anyURI": "string",
    "QName": "string",
    "NOTATION": "string",
    "normalizedString": "string",
    "token": "string",
    "language": "string",
    "NMTOKEN": "string",
    "NMTOKENS": "string",
    "Name": "string",
    "NCName": "string",
    "ID": "string",
    "IDREF": "string",
    "IDREFS": "string",
    "ENTITY": "string",
    "ENTITIES": "string",
}).reduce(function (pv, cv) {
    var _a;
    return __assign(__assign({}, pv), (_a = {}, _a[cv[0]] = cv[1], _a["xs:" + cv[0]] = cv[1], _a));
}, {});
/* eslint-enable */
/**
 * Create new definition
 * @param parsedWsdl context of parsed wsdl
 * @param options ParserOptions
 * @param name name of definition, will be used as name of interface
 * @param stack definitions stack of path to current subdefinition (immutable)
 */
function createDefinition(parsedWsdl, options, name, stack) {
    var defName = (0, change_case_1.changeCase)(name, options, { pascalCase: true });
    logger_1.Logger.debug("Creating Definition ".concat(stack.join("."), ".").concat(name));
    var nonCollisionDefName;
    try {
        nonCollisionDefName = parsedWsdl.findNonCollisionDefinitionName(defName);
    }
    catch (err) {
        var e = new Error("Error for finding non-collision definition name for ".concat(stack.join("."), ".").concat(name));
        e.stack.split("\n").slice(0, 2).join("\n") + "\n" + err.stack;
        throw e;
    }
    var definition = {
        name: "".concat(options.modelNamePreffix).concat((0, change_case_1.changeCase)(nonCollisionDefName, options, { pascalCase: true })).concat(options.modelNameSuffix),
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
function parseWsdl(wsdlPath, options) {
    return __awaiter(this, void 0, void 0, function () {
        var mergedOptions;
        return __generator(this, function (_a) {
            mergedOptions = __assign(__assign({}, defaultOptions), options);
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    (0, index_1.open_wsdl)(wsdlPath, {
                        namespaceArrayElements: false,
                        ignoredNamespaces: ["tns", "targetNamespace", "typeNamespace"],
                    }, function (err, wsdl) {
                        if (err) {
                            return reject(err);
                        }
                        if (wsdl === undefined) {
                            return reject(new Error("WSDL is undefined"));
                        }
                        var parsedWsdl = new parsed_wsdl_1.ParsedWsdl({ maxStack: options.maxRecursiveDefinitionName });
                        var filename = path.basename(wsdlPath);
                        // We always want to convert the case of the filenames
                        var fileOptions = __assign(__assign({}, mergedOptions), { convertCase: true });
                        parsedWsdl.name = (0, change_case_1.changeCase)((0, file_1.stripExtension)(filename), fileOptions, {
                            pascalCase: true,
                        });
                        parsedWsdl.wsdlFilename = path.basename(filename);
                        parsedWsdl.wsdlPath = path.resolve(wsdlPath);
                        var visitedDefinitions = [];
                        var allMethods = [];
                        var allPorts = [];
                        var services = [];
                        for (var _i = 0, _a = Object.entries(wsdl.definitions.services); _i < _a.length; _i++) {
                            var _b = _a[_i], serviceName = _b[0], service = _b[1];
                            logger_1.Logger.debug("Parsing Service ".concat(serviceName));
                            var servicePorts = []; // TODO: Convert to Array
                            for (var _c = 0, _d = Object.entries(service.ports); _c < _d.length; _c++) {
                                var _e = _d[_c], portName = _e[0], port = _e[1];
                                logger_1.Logger.debug("Parsing Port ".concat(portName));
                                var portMethods = [];
                                for (var _f = 0, _g = Object.entries(port.binding.methods); _f < _g.length; _f++) {
                                    var _h = _g[_f], methodName = _h[0], method = _h[1];
                                    logger_1.Logger.debug("Parsing Method ".concat(methodName));
                                    // TODO: Deduplicate code below by refactoring it to external function. Is it even possible ?
                                    var paramName = "request";
                                    var inputType = null; // default type
                                    if (method.input) {
                                        logger_1.Logger.debug("Parsing Method ".concat(methodName, ".input"));
                                        if (method.input.$name) {
                                            paramName = method.input.$name;
                                        }
                                        var inputMessage = wsdl.definitions.messages[method.input.$name];
                                        if (inputMessage.element) {
                                            logger_1.Logger.debug("Handling ".concat(methodName, ".input.element"));
                                            inputType = getXmlType(inputMessage.element.$name, inputMessage.element.$type);
                                        }
                                        else if (inputMessage.parts) {
                                            logger_1.Logger.debug("Handling ".concat(methodName, ".input.parts"));
                                            inputType = getXmlType(paramName);
                                        }
                                        else {
                                            logger_1.Logger.debug("Method '".concat(serviceName, ".").concat(portName, ".").concat(methodName, "' doesn't have any input defined"));
                                        }
                                    }
                                    var outputType = null; // default type
                                    if (method.output) {
                                        logger_1.Logger.debug("Parsing Method ".concat(methodName, ".output"));
                                        var outputMessage = wsdl.definitions.messages[method.output.$name];
                                        if (outputMessage.element) {
                                            outputType = getXmlType(outputMessage.element.$name, outputMessage.element.$type);
                                        }
                                        else {
                                            outputType = getXmlType(paramName);
                                        }
                                    }
                                    // We always want to convert the case of the param names
                                    var camelOptions = __assign(__assign({}, mergedOptions), { convertCase: true });
                                    var camelParamName = (0, change_case_1.changeCase)(paramName, camelOptions, { pascalCase: false });
                                    var portMethod = {
                                        name: methodName,
                                        paramName: javascript_1.reservedKeywords.includes(camelParamName)
                                            ? "".concat(camelParamName, "Param")
                                            : camelParamName,
                                        paramType: inputType,
                                        returnType: outputType,
                                    };
                                    portMethods.push(portMethod);
                                    allMethods.push(portMethod);
                                }
                                var servicePort = {
                                    name: (0, change_case_1.changeCase)(portName, mergedOptions, { pascalCase: true }),
                                    sourceName: portName,
                                    methods: portMethods,
                                };
                                servicePorts.push(servicePort);
                                allPorts.push(servicePort);
                            } // End of Port cycle
                            services.push({
                                name: (0, change_case_1.changeCase)(serviceName, mergedOptions, { pascalCase: true }),
                                sourceName: serviceName,
                                ports: servicePorts,
                            });
                        } // End of Service cycle
                        parsedWsdl.services = services;
                        parsedWsdl.ports = allPorts;
                        parsedWsdl.definitions = [];
                        // Parse Schemas
                        for (var _j = 0, _k = Object.entries(wsdl.definitions.schemas); _j < _k.length; _j++) {
                            var _l = _k[_j], nameSpace = _l[0], schemaElement = _l[1];
                            logger_1.Logger.debug("Parsing NameSpace: ".concat(nameSpace, "}"));
                            // Parse ComplexTypes
                            for (var _m = 0, _o = Object.entries(schemaElement.complexTypes); _m < _o.length; _m++) {
                                var _p = _o[_m], name_1 = _p[0], complexType = _p[1];
                                var definition = parseComplexType(parsedWsdl, mergedOptions, name_1, complexType, nameSpace);
                                parsedWsdl.definitions.push(definition);
                            }
                            // Parse SimpleTypes
                            for (var _q = 0, _r = Object.entries(schemaElement.types); _q < _r.length; _q++) {
                                var _s = _r[_q], name_2 = _s[0], simpleType = _s[1];
                                var simpleTypeDefinition = parseSimpleType(parsedWsdl, mergedOptions, name_2, simpleType);
                                parsedWsdl.simpleTypeDefinitions[simpleTypeDefinition.name] = simpleTypeDefinition;
                            }
                        }
                        return resolve(parsedWsdl);
                    });
                })];
        });
    });
}
exports.parseWsdl = parseWsdl;
function parseComplexType(parsedWsdl, options, name, complexType, nameSpace) {
    var defName = (0, change_case_1.changeCase)(name, options, { pascalCase: true });
    logger_1.Logger.debug("Parsing ComplexType name=".concat(defName));
    var definition = createDefinition(parsedWsdl, options, defName, [nameSpace]);
    complexType.children.forEach(function (child) {
        var _a, _b;
        logger_1.Logger.debug("Parsing Element: ".concat(child.name));
        var element = parseElement(child, options);
        if (element) {
            if (element.properties) {
                for (var _i = 0, _c = element.properties; _i < _c.length; _i++) {
                    var property = _c[_i];
                    definition.properties.push(property);
                }
            }
            if (element.attribute) {
                definition.attributes.push(element.attribute);
            }
            if ((_a = element.extension) === null || _a === void 0 ? void 0 : _a.properties) {
                for (var _d = 0, _e = element.extension.properties; _d < _e.length; _d++) {
                    var property = _e[_d];
                    definition.properties.push(property);
                }
            }
            if ((_b = element.extension) === null || _b === void 0 ? void 0 : _b.attributes) {
                for (var _f = 0, _g = element.extension.attributes; _f < _g.length; _f++) {
                    var attribute = _g[_f];
                    definition.attributes.push(attribute);
                }
            }
        }
    });
    return definition;
}
function getNodeSoapParsedType(type) {
    if (!type)
        return undefined;
    var lookupType = type.startsWith("xsd:") ? type.substring(4) : type;
    return NODE_SOAP_PARSED_TYPES[lookupType];
}
function parseSimpleType(parsedWsdl, options, name, simpleType) {
    var defName = (0, change_case_1.changeCase)(name, options, { pascalCase: true });
    var type = "string";
    var enumerationValues = [];
    simpleType.children.forEach(function (child) {
        if (child.name == "restriction") {
            type = child.$base;
            if (type.startsWith("".concat(child.prefix, ":"))) {
                type = type.substring(child.prefix.length + 1);
            }
            child.children.forEach(function (restriction) {
                if (restriction.name == "enumeration") {
                    enumerationValues.push(restriction.$value);
                }
            });
        }
    });
    var shouldAddImport = true;
    var nodeSoapType = getNodeSoapParsedType(type);
    if (nodeSoapType) {
        type = nodeSoapType;
        shouldAddImport = false;
    }
    else {
        if (type) {
            type = (0, change_case_1.changeCase)(type, options, { pascalCase: true });
        }
    }
    if (logger_1.Logger.isDebug) {
        var allowedValuesAsString = "";
        if (enumerationValues.length > 0) {
            allowedValuesAsString = ", allowedValues=".concat(enumerationValues.join(", "));
        }
        logger_1.Logger.debug("Parsing SimpleType name=".concat(defName, ", type=").concat(type, ", ").concat(allowedValuesAsString));
    }
    return {
        name: defName,
        type: type,
        enumerationValues: enumerationValues.length > 0 ? enumerationValues : undefined,
        shouldAddImport: shouldAddImport,
    };
}
function addSafeProperty(properties, property) {
    var existingProperty = properties.find(function (it) { return it.name == property.name; });
    if (!existingProperty)
        properties.push(property);
}
function parseElement(element, options, optional) {
    switch (element.name) {
        case "annotation": {
            break;
        }
        case "element": {
            var properties = [];
            var name_3 = element.$name;
            var propName = (0, change_case_1.changeCase)(name_3, options, { pascalCase: true });
            var minOccurs = element.$minOccurs;
            var maxOccurs = element.$maxOccurs;
            var isArray = maxOccurs && maxOccurs != "1";
            var isOptional = optional || (!isArray && minOccurs == "0");
            var type = element.$type;
            var nodeSoapType = getNodeSoapParsedType(type);
            var shouldAddImport = true;
            if (nodeSoapType) {
                type = nodeSoapType;
                shouldAddImport = false;
            }
            else {
                if (type) {
                    type = (0, change_case_1.changeCase)(type, options, { pascalCase: true });
                }
            }
            if (logger_1.Logger.isDebug) {
                var isArrayText = isArray ? ", isArray=true" : "";
                var isOptionalText = isOptional ? ", isOptional=true" : "";
                logger_1.Logger.debug("  Child name=".concat(propName, ", type=").concat(type).concat(isOptionalText).concat(isArrayText));
            }
            switch (name_3) {
                case "sequence": {
                    logger_1.Logger.debug("Begin nested sequence");
                    var parsedElement = parseElement(element, options, false);
                    if (parsedElement && parsedElement.properties) {
                        for (var _i = 0, _a = parsedElement.properties; _i < _a.length; _i++) {
                            var property = _a[_i];
                            addSafeProperty(properties, property);
                        }
                    }
                    logger_1.Logger.debug("End nested sequence");
                    break;
                }
                case "any": {
                    break;
                }
                default: {
                    properties.push({
                        name: propName,
                        sourceName: name_3,
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
            var properties = [];
            for (var _b = 0, _c = element.children; _b < _c.length; _b++) {
                var child = _c[_b];
                var parsedElement = parseElement(child, options, optional);
                if (parsedElement && parsedElement.properties) {
                    for (var _d = 0, _e = parsedElement.properties; _d < _e.length; _d++) {
                        var property = _e[_d];
                        addSafeProperty(properties, property);
                    }
                }
            }
            return { properties: properties };
        }
        case "choice": {
            logger_1.Logger.debug("Begin Choice");
            var properties = [];
            for (var _f = 0, _g = element.children; _f < _g.length; _f++) {
                var choiceElement = _g[_f];
                var parsedElement = parseElement(choiceElement, options, true);
                if (parsedElement && parsedElement.properties) {
                    for (var _h = 0, _j = parsedElement.properties; _h < _j.length; _h++) {
                        var property = _j[_h];
                        addSafeProperty(properties, property);
                    }
                }
            }
            logger_1.Logger.debug("End Choice");
            return { properties: properties };
        }
        case "attribute": {
            logger_1.Logger.debug("Attribute name=".concat(element.$name, ", type=").concat(element.$type, ", use: ").concat(element.$use));
            var type = "string";
            var shouldAddImport = true;
            var nodeSoapType = NODE_SOAP_PARSED_TYPES[type];
            if (nodeSoapType) {
                type = nodeSoapType;
                shouldAddImport = false;
            }
            return {
                attribute: {
                    name: element.$name,
                    shouldAddImport: shouldAddImport,
                    type: type,
                    use: element.$use,
                },
            };
        }
        case "simpleContent": {
            var attributes = [];
            var properties = [];
            for (var _k = 0, _l = element.children; _k < _l.length; _k++) {
                var child = _l[_k];
                if (child instanceof elements_1.ExtensionElement) {
                    logger_1.Logger.debug("Begin Extension");
                    for (var _m = 0, _o = child.children; _m < _o.length; _m++) {
                        var grandChild = _o[_m];
                        var parsedElement = parseElement(grandChild, options);
                        if (parsedElement) {
                            logger_1.Logger.debug("  element: ".concat(JSON.stringify(parsedElement)));
                            if (parsedElement.attribute) {
                                attributes.push(parsedElement.attribute);
                            }
                        }
                    }
                    logger_1.Logger.debug("End Extension");
                }
            }
            if (properties.length == 0) {
                properties.push({
                    name: "value",
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
function getXmlType(name, type) {
    if (type) {
        var parts = type.split(":");
        if (parts.length == 2) {
            return { name: name, nameSpace: parts[0], type: parts[1] };
        }
        else {
            return { name: name, type: type };
        }
    }
    return { name: name, type: "any" };
}
//# sourceMappingURL=parser.js.map