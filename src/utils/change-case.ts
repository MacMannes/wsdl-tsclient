import camelcase from "camelcase";

export function changeCase(input: string, options?: camelcase.Options) {
    const inputCopy = input;
    if (!options?.pascalCase) {
        return inputCopy.replace(/\./g, ""); // need to remove dots in the input string, otherwise, code generation fails
    }
    return camelcase(inputCopy, options);
}
