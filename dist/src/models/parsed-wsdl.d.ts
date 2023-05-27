export declare type DefinitionProperty = {
    name: string;
    sourceName: string;
    description?: string;
    kind: "PRIMITIVE" | "SCHEMA";
    isArray?: boolean;
    isOptional?: boolean;
    type: string;
} | {
    name: string;
    sourceName: string;
    description?: string;
    /**
     * This definition only reference another definition instead of primitive type
     * @description helps to avoid circular references
     */
    kind: "REFERENCE";
    isArray?: boolean;
    isOptional?: boolean;
    ref: Definition;
};
export interface DefinitionAttribute {
    name: string;
    type: string;
    shouldAddImport: boolean;
    use?: DefinitionAttributeUse;
}
declare type DefinitionAttributeUse = "optional" | "prohibited" | "required";
export interface ParsedElement {
    definition?: Definition;
    properties?: DefinitionProperty[];
    attribute?: DefinitionAttribute;
    extension?: ExtensionDefinition;
}
export interface Definition {
    /** Will be used as name of generated Definition's interface */
    name: string;
    /** Original name of Definition in WSDL */
    sourceName: string;
    description?: string;
    optional: boolean;
    docs: string[];
    properties: Array<DefinitionProperty>;
    attributes: Array<DefinitionAttribute>;
}
export interface ExtensionDefinition {
    properties: Array<DefinitionProperty>;
    attributes?: Array<DefinitionAttribute>;
}
export interface SimpleTypeDefinition {
    name: string;
    type: string;
    shouldAddImport: boolean;
    enumerationValues?: Array<string>;
    description?: string;
    attributes?: Array<DefinitionAttribute>;
}
export interface Method {
    /** Will be used as name for generated Function/Method */
    name: string;
    /** First param name (InputMessage) */
    paramName: string;
    /** First param type (InputMessage) */
    paramDefinition: null | Definition;
    /** Result type (OutputMessage) */
    returnDefinition: null | Definition;
}
export interface Port {
    /** Will be used as name of generated Port's interface */
    name: string;
    /** Original name of Port in WSDL */
    sourceName: string;
    description?: string;
    /** List of callable methods within this Port */
    methods: Array<Method>;
}
export interface Service {
    /** Will be used as name of generated Service's interface */
    name: string;
    /** Original name of Service in WSDL */
    sourceName: string;
    description?: string;
    /** List of Service's Ports */
    ports: Array<Port>;
}
export interface Options {
    /**
     * Case-insensitive name while parsing definition names
     * @default false
     */
    caseInsensitiveNames: boolean;
    /**
     * Maximum count of definition's with same name but increased suffix. Will throw an error if exceed
     * @default 64
     */
    maxStack: number;
    /**
     * Warn user if definition's name with increased suffix exceed number
     * @default 32
     */
    maxStackWarn: number;
}
export declare class ParsedWsdl {
    /**
     * Name is always uppercased filename of wsdl without an extension.
     * Used to generate client name of interface
     * @example "MyClient"
     */
    name: string;
    /** Original wsdl filename */
    wsdlFilename: string;
    /** Absolute basepath or url */
    wsdlPath: string;
    definitions: Array<Definition>;
    simpleTypeDefinitions: {
        [name: string]: SimpleTypeDefinition;
    };
    ports: Array<Port>;
    services: Array<Service>;
    private _options;
    private _warns;
    constructor(options: Partial<Options>);
    /** Find already parsed definition by it's name */
    findDefinition(definitionName: string): Definition;
    /**
     * To make every definition's name unique.
     * If definition with same name exists, suffix it with incremented number
     * @throws Will throw an error when suffixed number exceed `maxStack`
     */
    findNonCollisionDefinitionName(defName: string): string;
}
export {};
//# sourceMappingURL=parsed-wsdl.d.ts.map