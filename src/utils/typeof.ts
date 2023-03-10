export const _typeof = (x: any) => {
    if (typeof x === "number") return x / Math.ceil(x) === 1 || x === 0 ? "int" : "float";
    else if (typeof x === "boolean") return "bool";
    else if (Array.isArray(x)) return "array";
    else if (x + "" === "null") return "null";
    else if (typeof x === "string") return "string";
    else if (typeof x === "function") return "function";
    else return "object";
};
