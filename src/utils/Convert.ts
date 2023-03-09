import { IArrayType, IDatatype, IIdentifier, ILiteral, IObjectType, ITupleType } from "../std";

export class Convert {
    public static toReadableText(datatypes: IDatatype[]) {
        const allTypes: string[] = [];

        datatypes.map((datatype) => {
            if (datatype.type === "Literal") {
                allTypes.push(this.fromLiteralTypeToReadableText(datatype));
            } else if (datatype.type === "Identifier") {
                allTypes.push(this.formIdentifierToReadableText(datatype));
            } else if (datatype.type === "ObjectType") {
                allTypes.push(this.fromObjectTypeToReadableText(datatype));
            } else if (datatype.type === "ArrayType") {
                allTypes.push(this.fromArrayTypeToReadableText(datatype));
            } else if (datatype.type === "TupleType") {
                allTypes.push(this.fromTupleTypeToReadableText(datatype));
            }
        });

        return allTypes.join(" | ");
    }

    public static toFormated(string: string) {
        return string
            .replace(/"/g, "")
            .replace(/:/g, ": ")
            .replace(/{/g, "{ ")
            .replace(/}/g, " }")
            .replace(/,/g, ", ")
            .replace(/{\s\s}/g, "{}")
            .replace(/\s\s+/g, " ");
    }

    public static fromLiteralTypeToReadableText(literal: ILiteral) {
        return typeof literal.value === "string"
            ? JSON.stringify(literal.value)
            : literal.value + "";
    }

    public static formIdentifierToReadableText(identifier: IIdentifier) {
        return identifier.name;
    }

    public static fromObjectTypeToReadableText(objectType: IObjectType) {
        const result: Record<string, string> = {};

        objectType.properties.map(({ datatypes, key }) => {
            result[key.name] = this.toReadableText(datatypes);
        });

        return this.toFormated(JSON.stringify(result));
    }

    public static fromArrayTypeToReadableText(arrayType: IArrayType) {
        const allTypes = this.toReadableText(arrayType.datatypes);
        console.log({ allTypes });
        if (arrayType.datatypes.length <= 1) {
            return allTypes + "[]";
        } else {
            return `(${allTypes})[]`;
        }
    }

    public static fromTupleTypeToReadableText(tupleType: ITupleType) {
        const result: string[] = [];
        tupleType.datatypes.map((itemDatatypes) => {
            result.push(this.toReadableText(itemDatatypes));
        });

        return "[" + result.join(", ") + "]";
    }
}
