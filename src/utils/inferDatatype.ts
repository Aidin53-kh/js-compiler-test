import { Storage } from "../storage";
import { ReferenceError } from "./errors";
import { IArrayType, IDatatype, IExpression, IObjectType } from "../std";
import { Identifier } from "./expressions";
import { _typeof } from "./typeof";
import { DatatypeList } from "./datatypes";

export function inferDatatype(expr: IExpression): IDatatype {
    switch (expr.type) {
        case "Literal":
            return new Identifier(_typeof(expr.value));
        case "Identifier": {
            Storage.Variables.ifNotExist(expr.name, () => {
                new ReferenceError(`'${expr.name}' is not defined.`, "code 25");
            });

            return inferDatatype(Storage.Variables.get(expr.name)?.init as IExpression);
        }
        case "ObjectExpression": {
            const datatype: IObjectType = {
                type: "ObjectType",
                properties: [],
            };

            expr.properties.map(({ key, value }) => {
                datatype.properties.push({
                    key,
                    datatypes: Array.of(inferDatatype(value)),
                });
            });

            return datatype;
        }
        case "ArrayExpression": {
            const datatype: IArrayType = {
                type: "ArrayType",
                datatypes: [],
            };

            expr.elements.map((expression) => {
                const type = new DatatypeList([inferDatatype(expression)]).datatypes[0];

                if (!datatype.datatypes.some((d) => JSON.stringify(d) === JSON.stringify(type))) {
                    datatype.datatypes.push(type);
                }
            });

            return datatype;
        }
    }
}
