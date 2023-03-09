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
                return input === undefined || input || null;
            },
        },
    };

    public static isBuiltin(typename: string) {
        return this.builtin.hasOwnProperty(typename);
    }

    public static isCustom(typename: string) {
        return Storage.Types.hasOwnProperty(typename);
    }

    public static isValid(datatype: IDatatype) {
        switch (datatype.type) {
            case "Literal":
                break;
            case "Identifier":
                Storage.Types.ifNotExist(datatype.name, () => {
                    throw new ReferenceError(`type ${datatype.name} is not defined.`, "code 7");
                });
                break;
            case "ObjectType":
                datatype.properties.map((t) => t.datatypes.map((t2) => this.isValid(t2)));
                break;
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
