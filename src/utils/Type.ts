import { IDatatype } from "../std";
import { Storage } from "../storage";
import { Convert } from "./Convert";
import { ReferenceError } from "./errors";
import { inferDatatype } from "./inferDatatype";

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

    public static isValid(datatype: IDatatype) {
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
                    datatypes.map((t2) => this.isValid(t2));
                });
                break;
            }
            case "ArrayType":
                datatype.datatypes.map((t) => this.isValid(t));
                break;
            case "TupleType":
                datatype.datatypes.map((t) => t.map((t2) => this.isValid(t2)));
                break;
        }
    }
}

export type BuiltinTypes = keyof typeof Type.builtin;
