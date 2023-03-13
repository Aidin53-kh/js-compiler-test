import { IDatatype } from "../std";
import { Storage } from "../storage";
import { ReferenceError } from "./errors";

export class Type {
    public static builtin = {
        string: {
            validate: function (input: any) {
                return typeof input === "string";
            },
        },
        bool: {
            validate: function (input: any) {
                return typeof input === "boolean";
            },
        },
        int: {
            validate: function (input: any) {
                return typeof input === "number" && (input / Math.ceil(input) === 1 || input === 0);
            },
        },
        dynamic: {
            validate: function (_: any) {
                return true;
            },
        },
        char: {
            validate: function (input: any) {
                return typeof input === "string" && input.length === 1;
            },
        },
        float: {
            validate: function (input: any) {
                return typeof input === "number";
            },
        },
        void: {
            validate: function (input: any) {
                return input === undefined || input === null;
            },
        },
    };

    public static isBuiltin(typename: string) {
        return this.builtin.hasOwnProperty(typename);
    }

    public static isCustom(typename: string) {
        return Storage.Types.exist(typename);
    }

    public static validate(datatype: IDatatype) {
        switch (datatype.type) {
            case "Literal":
                break;
            case "Identifier":
                if (!this.isBuiltin(datatype.name)) {
                    Storage.Types.ifNotExist(datatype.name, () => {
                        throw new ReferenceError(
                            `type '${datatype.name}' is not defined.`,
                            "code 7"
                        );
                    });
                }
                break;
            case "ObjectType": {
                const keys: string[] = [];
                datatype.properties.map(({ key, datatypes }) => {
                    if (keys.includes(key.name)) {
                        throw new ReferenceError(`duplicate identifier '${key.name}'`, "code 27");
                    }
                    keys.push(key.name);
                    datatypes.map((t2) => this.validate(t2));
                });
                break;
            }
            case "ArrayType":
                datatype.datatypes.map((t) => this.validate(t));
                break;
            case "TupleType":
                datatype.datatypes.map((t) => t.map((t2) => this.validate(t2)));
                break;
            case "FunctionType": {
                const names: string[] = [];

                datatype.params.map((p) => {
                    if (p.name && names.includes(p.name)) {
                        throw new ReferenceError(`Duplicate parameter '${p.name}'.`, "code 43");
                    }

                    p.datatypes.map((t) => this.validate(t));
                    p.name && names.push(p.name);
                });
                datatype.returnType.map((t) => this.validate(t));
                break;
            }
        }
    }
}

export type BuiltinTypes = keyof typeof Type.builtin;
