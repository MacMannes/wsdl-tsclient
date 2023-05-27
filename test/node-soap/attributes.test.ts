import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

const target = "ppv/ri-pull-vi-stb";

describe("parseAndGenerate()", function () {
    it("should generate members for XML attributes", async function () {
        Logger.isDebug = true;

        const input = `./test/resources/${target}.wsdl`;
        const outDir = "./test/generated/ppv";

        await parseAndGenerate(input, outDir);
    });
});

//TODO: Find out how to parse attributes

/**
 * After parsing in parseWsdl method of parser.ts, the `wsdl` object can be inspected.
 *
 * The `CCAuthService` schema (in `definitions`) contains an attribute named `run`
 * Path: $
 *  .definitions
 *      .schemas
 *          .urn:schemas-cybersource-com:transaction-data-1.26
 *              .complexTypes
 *                  .CCAuthService
 *                      .children[1].$name
 */

/**
 * {
 *   "allowedChildren": {},
 *   "children": [
 *     {
 *       "allowedChildren": {},
 *       "children": [
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "cavv",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "commerceIndicator",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "eciRaw",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "xid",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "reconciliationID",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "avsLevel",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "fxQuoteID",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "returnAuthRecord",
 *           "$type": "tns:boolean",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "authType",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "verbalAuthCode",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "billPayment",
 *           "$type": "tns:boolean",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "authenticationXID",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "authorizationXID",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "industryDatatype",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         },
 *         {
 *           "allowedChildren": {},
 *           "children": [],
 *           "nsName": "xsd:element",
 *           "prefix": "xsd",
 *           "name": "element",
 *           "xmlns": {},
 *           "schemaXmlns": {
 *             "xsd": "http://www.w3.org/2001/XMLSchema",
 *             "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *           },
 *           "valueKey": "$value",
 *           "xmlKey": "$xml",
 *           "ignoredNamespaces": [
 *             "tns",
 *             "targetNamespace",
 *             "typedNamespace"
 *           ],
 *           "$name": "traceNumber",
 *           "$type": "xsd:string",
 *           "$minOccurs": "0",
 *           "$targetNamespace": "urn:schemas-cybersource-com:transaction-data-1.26"
 *         }
 *       ],
 *       "nsName": "xsd:sequence",
 *       "prefix": "xsd",
 *       "name": "sequence",
 *       "xmlns": {},
 *       "schemaXmlns": {
 *         "xsd": "http://www.w3.org/2001/XMLSchema",
 *         "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *       },
 *       "valueKey": "$value",
 *       "xmlKey": "$xml",
 *       "ignoredNamespaces": [
 *         "tns",
 *         "targetNamespace",
 *         "typedNamespace"
 *       ]
 *     },
 *     {
 *       "allowedChildren": {},
 *       "children": [],
 *       "nsName": "xsd:attribute",
 *       "prefix": "xsd",
 *       "name": "attribute",
 *       "xmlns": {},
 *       "schemaXmlns": {
 *         "xsd": "http://www.w3.org/2001/XMLSchema",
 *         "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *       },
 *       "valueKey": "$value",
 *       "xmlKey": "$xml",
 *       "ignoredNamespaces": [
 *         "tns",
 *         "targetNamespace",
 *         "typedNamespace"
 *       ],
 *       "$name": "run",
 *       "$type": "tns:boolean",
 *       "$use": "required"
 *     }
 *   ],
 *   "nsName": "xsd:complexType",
 *   "prefix": "xsd",
 *   "name": "complexType",
 *   "xmlns": {},
 *   "schemaXmlns": {
 *     "xsd": "http://www.w3.org/2001/XMLSchema",
 *     "tns": "urn:schemas-cybersource-com:transaction-data-1.26"
 *   },
 *   "valueKey": "$value",
 *   "xmlKey": "$xml",
 *   "ignoredNamespaces": [
 *     "tns",
 *     "targetNamespace",
 *     "typedNamespace"
 *   ],
 *   "$name": "CCAuthService"
 * }
 */
