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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
var camelcase_1 = __importDefault(require("camelcase"));
var path_1 = __importDefault(require("path"));
var ts_morph_1 = require("ts-morph");
var _1 = require(".");
var logger_1 = require("./utils/logger");
var defaultOptions = {
    emitDefinitionsOnly: false,
    modelPropertyNaming: null,
};
var simpleTypeDefinitionsName = "SimpleTypeDefinitions";
/**
 * To avoid duplicated imports
 */
function addSafeImport(imports, moduleSpecifier, namedImport) {
    var importDeclaration = imports.find(function (imp) { return imp.moduleSpecifier == moduleSpecifier; });
    if (importDeclaration) {
        // ImportDeclaration already exists
        if (Array.isArray(importDeclaration.namedImports)) {
            var namedImports = importDeclaration.namedImports;
            if (!namedImports.find(function (imp) { return (typeof imp == "object" && imp.name == namedImport) || imp === namedImport; })) {
                // namedImport does not exist yet, so let's add it
                namedImports.push(namedImport);
            }
        }
    }
    else {
        // ImportDeclaration does not exist yet, so we can add a new one
        imports.push({
            moduleSpecifier: moduleSpecifier,
            namedImports: [{ name: namedImport }],
        });
    }
}
var incorrectPropNameChars = [" ", "-", "."];
/**
 * This is temporally method to fix this issue https://github.com/dsherret/ts-morph/issues/1160
 */
function sanitizePropName(propName) {
    if (incorrectPropNameChars.some(function (char) { return propName.includes(char); })) {
        return "\"".concat(propName, "\"");
    }
    return propName;
}
function createProperty(name, type, isArray, doc, optional) {
    if (optional === void 0) { optional = false; }
    return {
        kind: ts_morph_1.StructureKind.PropertySignature,
        name: sanitizePropName(name),
        docs: doc ? [doc] : undefined,
        hasQuestionToken: optional,
        type: isArray ? "Array<".concat(type, ">") : type,
    };
}
function generateDefinitionFile(project, definition, defDir, stack, generated, options, allDefinitionNames, simpleTypeDefinitions) {
    var defName = definition.name;
    var defFilePath = path_1.default.join(defDir, "".concat(defName, ".ts"));
    var defFile = project.createSourceFile(defFilePath, "", {
        overwrite: true,
    });
    generated.push(definition);
    var definitionImports = [];
    var definitionProperties = [];
    for (var _i = 0, _a = definition.properties; _i < _a.length; _i++) {
        var prop = _a[_i];
        if (options.modelPropertyNaming) {
            switch (options.modelPropertyNaming) {
                case _1.ModelPropertyNaming.camelCase:
                    prop.name = (0, camelcase_1.default)(prop.name);
                    break;
                case _1.ModelPropertyNaming.PascalCase:
                    prop.name = (0, camelcase_1.default)(prop.name, { pascalCase: true });
                    break;
            }
        }
        var type = prop.type;
        if (prop.shouldAddImport) {
            if (simpleTypeDefinitions) {
                var simpleTypeDefinition = simpleTypeDefinitions[type];
                if (simpleTypeDefinition) {
                    addSafeImport(definitionImports, "./".concat(simpleTypeDefinitionsName), prop.type);
                }
                else {
                    addSafeImport(definitionImports, "./".concat(prop.type), prop.type);
                }
            }
            else {
                addSafeImport(definitionImports, "./".concat(prop.type), prop.type);
            }
        }
        definitionProperties.push(createProperty(prop.name, type, prop.isArray, prop.description, prop.isOptional));
    }
    if (definition.attributes.length > 0) {
        var attributesName = "".concat(defName, "Attributes");
        var optional = definition.attributes.map(function (it) { return it.use != "required"; }).every(function (val, i, arr) { return val === true; });
        definitionProperties.push(createProperty("attributes", attributesName, false, undefined, optional));
        generateAttributesDefinition(defFile, definitionImports, attributesName, definition.attributes);
    }
    defFile.addImportDeclarations(definitionImports);
    defFile.addStatements([
        {
            leadingTrivia: function (writer) { return writer.newLine(); },
            isExported: true,
            name: defName,
            docs: [definition.docs.join("\n")],
            kind: ts_morph_1.StructureKind.Interface,
            properties: definitionProperties,
        },
    ]);
    logger_1.Logger.log("Writing Definition file: ".concat(path_1.default.resolve(path_1.default.join(defDir, defName)), ".ts"));
    defFile.saveSync();
}
function generateAttributesDefinition(sourceFile, definitionImports, name, attributes) {
    var attributeProperties = [];
    attributes.forEach(function (prop) {
        var isOptional = prop.use != "required";
        attributeProperties.push(createProperty(prop.name, prop.type, false, undefined, isOptional));
    });
    sourceFile.addStatements([
        {
            leadingTrivia: function (writer) { return writer.newLine(); },
            isExported: true,
            name: name,
            kind: ts_morph_1.StructureKind.Interface,
            properties: attributeProperties,
        },
    ]);
}
function generateEnumDefinition(sourceFile, name, enumerationValues) {
    sourceFile.addTypeAlias({
        name: name,
        type: function (writer) {
            writer.write(enumerationValues.map(function (it) { return "\"".concat(it, "\""); }).join(" | "));
        },
        isExported: true,
    });
}
function generateTypeDefinition(sourceFile, name, type) {
    sourceFile.addTypeAlias({
        name: name,
        type: type,
        isExported: true,
    });
}
function generate(parsedWsdl, outDir, options) {
    return __awaiter(this, void 0, void 0, function () {
        var mergedOptions, project, portsDir, servicesDir, defDir, allMethods, allDefinitions, clientImports, clientServices, _i, _a, service, serviceFilePath, serviceFile, serviceImports, servicePorts, _b, _c, port, portFilePath, portFile, portImports, portFileMethods, _d, _e, method, _f, _g, _h, _j, _k, _l, _m, _o, definition, simpleTypeDefinitionsFilePath, simpleTypeDefinitionsFile, key, definition, _p, _q, _r, clientFilePath, clientFile, createClientDeclaration, _s, _t, _u, indexFilePath, indexFile, _v, _w, _x;
        return __generator(this, function (_y) {
            switch (_y.label) {
                case 0:
                    mergedOptions = __assign(__assign({}, defaultOptions), options);
                    project = new ts_morph_1.Project();
                    portsDir = path_1.default.join(outDir, "ports");
                    servicesDir = path_1.default.join(outDir, "services");
                    defDir = path_1.default.join(outDir, "definitions");
                    allMethods = [];
                    allDefinitions = [];
                    clientImports = [];
                    clientServices = [];
                    _i = 0, _a = parsedWsdl.services;
                    _y.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    service = _a[_i];
                    serviceFilePath = path_1.default.join(servicesDir, "".concat(service.name, ".ts"));
                    serviceFile = project.createSourceFile(serviceFilePath, "", {
                        overwrite: true,
                    });
                    serviceImports = [];
                    servicePorts = [];
                    _b = 0, _c = parsedWsdl.ports;
                    _y.label = 2;
                case 2:
                    if (!(_b < _c.length)) return [3 /*break*/, 5];
                    port = _c[_b];
                    portFilePath = path_1.default.join(portsDir, "".concat(port.name, ".ts"));
                    portFile = project.createSourceFile(portFilePath, "", {
                        overwrite: true,
                    });
                    portImports = [];
                    portFileMethods = [];
                    for (_d = 0, _e = port.methods; _d < _e.length; _d++) {
                        method = _e[_d];
                        if (method.paramType !== null) {
                            if (method.paramType.type != "any") {
                                addSafeImport(clientImports, "./definitions/".concat(method.paramType.type), method.paramType.type);
                                addSafeImport(portImports, "../definitions/".concat(method.paramType.type), method.paramType.type);
                            }
                        }
                        if (method.returnType !== null) {
                            if (method.returnType.type != "any") {
                                addSafeImport(clientImports, "./definitions/".concat(method.returnType.type), method.returnType.type);
                                addSafeImport(portImports, "../definitions/".concat(method.returnType.type), method.returnType.type);
                            }
                        }
                        // TODO: Deduplicate PortMethods
                        allMethods.push(method);
                        portFileMethods.push({
                            name: sanitizePropName(method.name),
                            parameters: [
                                {
                                    name: (0, camelcase_1.default)(method.paramName),
                                    type: method.paramType ? method.paramType.type : "{}",
                                },
                                {
                                    name: "callback",
                                    type: "(err: any, result: ".concat(method.returnType ? method.returnType.type : "unknown", ", rawResponse: any, soapHeader: any, rawRequest: any) => void"), // TODO: Use ts-morph to generate proper type
                                },
                            ],
                            returnType: "void",
                        });
                    } // End of PortMethod
                    if (!!mergedOptions.emitDefinitionsOnly) return [3 /*break*/, 4];
                    addSafeImport(serviceImports, "../ports/".concat(port.name), port.name);
                    servicePorts.push({
                        name: sanitizePropName(port.name),
                        isReadonly: true,
                        type: port.name,
                    });
                    portFile.addImportDeclarations(portImports);
                    portFile.addStatements([
                        {
                            leadingTrivia: function (writer) { return writer.newLine(); },
                            isExported: true,
                            kind: ts_morph_1.StructureKind.Interface,
                            name: port.name,
                            methods: portFileMethods,
                        },
                    ]);
                    _g = (_f = logger_1.Logger).log;
                    _h = "Writing Port file: ".concat;
                    return [4 /*yield*/, path_1.default.resolve(path_1.default.join(portsDir, port.name))];
                case 3:
                    _g.apply(_f, [_h.apply("Writing Port file: ", [_y.sent(), ".ts"])]);
                    portFile.saveSync();
                    _y.label = 4;
                case 4:
                    _b++;
                    return [3 /*break*/, 2];
                case 5:
                    if (!!mergedOptions.emitDefinitionsOnly) return [3 /*break*/, 7];
                    addSafeImport(clientImports, "./services/".concat(service.name), service.name);
                    clientServices.push({ name: sanitizePropName(service.name), type: service.name });
                    serviceFile.addImportDeclarations(serviceImports);
                    serviceFile.addStatements([
                        {
                            leadingTrivia: function (writer) { return writer.newLine(); },
                            isExported: true,
                            kind: ts_morph_1.StructureKind.Interface,
                            name: service.name,
                            properties: servicePorts,
                        },
                    ]);
                    _k = (_j = logger_1.Logger).log;
                    _l = "Writing Service file: ".concat;
                    return [4 /*yield*/, path_1.default.resolve(path_1.default.join(servicesDir, service.name))];
                case 6:
                    _k.apply(_j, [_l.apply("Writing Service file: ", [_y.sent(), ".ts"])]);
                    serviceFile.saveSync();
                    _y.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8:
                    // Process all schema definitions
                    for (_m = 0, _o = parsedWsdl.definitions; _m < _o.length; _m++) {
                        definition = _o[_m];
                        generateDefinitionFile(project, definition, defDir, [definition.name], allDefinitions, mergedOptions, parsedWsdl.definitions.map(function (it) { return it.name; }), parsedWsdl.simpleTypeDefinitions);
                    }
                    simpleTypeDefinitionsFilePath = path_1.default.join(defDir, simpleTypeDefinitionsName + ".ts");
                    simpleTypeDefinitionsFile = project.createSourceFile(simpleTypeDefinitionsFilePath, "", {
                        overwrite: true,
                    });
                    // Process all simpleTypeDefinitions
                    for (key in parsedWsdl.simpleTypeDefinitions) {
                        definition = parsedWsdl.simpleTypeDefinitions[key];
                        if (definition.enumerationValues) {
                            generateEnumDefinition(simpleTypeDefinitionsFile, definition.name, definition.enumerationValues);
                        }
                        else {
                            generateTypeDefinition(simpleTypeDefinitionsFile, definition.name, definition.type);
                        }
                    }
                    // Write simpleTypeDefinitions file
                    _q = (_p = logger_1.Logger).log;
                    _r = "Writing SimpleTypeDefinitions file: ".concat;
                    return [4 /*yield*/, path_1.default.resolve(path_1.default.join(defDir, "SimpleTypeDefinitions"))];
                case 9:
                    // Write simpleTypeDefinitions file
                    _q.apply(_p, [_r.apply("Writing SimpleTypeDefinitions file: ", [_y.sent(), ".ts"])]);
                    simpleTypeDefinitionsFile.saveSync();
                    if (!!mergedOptions.emitDefinitionsOnly) return [3 /*break*/, 11];
                    clientFilePath = path_1.default.join(outDir, "client.ts");
                    clientFile = project.createSourceFile(clientFilePath, "", {
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
                            leadingTrivia: function (writer) { return writer.newLine(); },
                            isExported: true,
                            kind: ts_morph_1.StructureKind.Interface,
                            // docs: [`${parsedWsdl.name}Client`],
                            name: "".concat(parsedWsdl.name, "Client"),
                            properties: clientServices,
                            extends: ["SoapClient"],
                            methods: allMethods.map(function (method) { return ({
                                name: sanitizePropName("".concat(method.name, "Async")),
                                parameters: [
                                    {
                                        name: (0, camelcase_1.default)(method.paramName),
                                        type: method.paramType ? method.paramType.type : "{}",
                                    },
                                ],
                                returnType: "Promise<[result: ".concat(method.returnType ? method.returnType.type : "unknown", ", rawResponse: any, soapHeader: any, rawRequest: any]>"),
                            }); }),
                        },
                    ]);
                    createClientDeclaration = clientFile.addFunction({
                        name: "createClientAsync",
                        docs: ["Create ".concat(parsedWsdl.name, "Client")],
                        isExported: true,
                        parameters: [
                            {
                                isRestParameter: true,
                                name: "args",
                                type: "Parameters<typeof soapCreateClientAsync>",
                            },
                        ],
                        returnType: "Promise<".concat(parsedWsdl.name, "Client>"), // TODO: `any` keyword is very dangerous
                    });
                    createClientDeclaration.setBodyText("return soapCreateClientAsync(args[0], args[1], args[2]) as any;");
                    _t = (_s = logger_1.Logger).log;
                    _u = "Writing Client file: ".concat;
                    return [4 /*yield*/, path_1.default.resolve(path_1.default.join(outDir, "client"))];
                case 10:
                    _t.apply(_s, [_u.apply("Writing Client file: ", [_y.sent(), ".ts"])]);
                    clientFile.saveSync();
                    _y.label = 11;
                case 11:
                    indexFilePath = path_1.default.join(outDir, "index.ts");
                    indexFile = project.createSourceFile(indexFilePath, "", {
                        overwrite: true,
                    });
                    indexFile.addExportDeclarations(allDefinitions.map(function (def) { return ({
                        namedExports: [def.name],
                        moduleSpecifier: "./definitions/".concat(def.name),
                    }); }));
                    if (!mergedOptions.emitDefinitionsOnly) {
                        // TODO: Aggregate all exports during declarations generation
                        // https://ts-morph.com/details/exports
                        indexFile.addExportDeclarations([
                            {
                                namedExports: ["createClientAsync", "".concat(parsedWsdl.name, "Client")],
                                moduleSpecifier: "./client",
                            },
                        ]);
                        indexFile.addExportDeclarations(parsedWsdl.services.map(function (service) { return ({
                            namedExports: [service.name],
                            moduleSpecifier: "./services/".concat(service.name),
                        }); }));
                        indexFile.addExportDeclarations(parsedWsdl.ports.map(function (port) { return ({
                            namedExports: [port.name],
                            moduleSpecifier: "./ports/".concat(port.name),
                        }); }));
                    }
                    _w = (_v = logger_1.Logger).log;
                    _x = "Writing Index file: ".concat;
                    return [4 /*yield*/, path_1.default.resolve(path_1.default.join(outDir, "index"))];
                case 12:
                    _w.apply(_v, [_x.apply("Writing Index file: ", [_y.sent(), ".ts"])]);
                    indexFile.saveSync();
                    return [2 /*return*/];
            }
        });
    });
}
exports.generate = generate;
//# sourceMappingURL=generator.js.map