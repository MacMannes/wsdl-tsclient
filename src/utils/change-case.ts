import camelcase from "camelcase";
import { ParserOptions } from "../parser";

export function changeCase(input: string, options: ParserOptions, camelcaseOptions?: camelcase.Options) {
    if (options.convertCase) {
        const inputCopy = input;
        if (!camelcaseOptions?.pascalCase) {
            return inputCopy.replace(/\./g, ""); // need to remove dots in the input string, otherwise, code generation fails
        }
        return camelcase(inputCopy, camelcaseOptions);
    }

    return input;
}
