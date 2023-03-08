export interface AST {
    type: "Program";
    body: ASTBody;
}

export type ASTBody = Statement[];

export type SyntaxKind = Pick<Statement, "type">["type"];

export type Statement = VariableDeclaration;

export interface VariableDeclaration {
    type: "VariableDeclaration";
    declarations: VariableDeclarator[];
    kind: "let" | "const";
    datatypes: IDatatype[];
}

export interface VariableDeclarator {
    type: "VariableDeclarator";
    id: IIdentifier;
    init: null | IExpression;
    datatypes: IDatatype[];
}
export interface IIdentifier {
    type: "Identifier";
    name: string;
}

export type IExpression = IIdentifier | ILiteral | IObjectExpression | IArrayExpression;

export interface ILiteral {
    type: "Literal";
    value: ILiteralValue;
}

export type ILiteralValue = string | number | null | boolean;

export type IDatatype = ILiteral | IIdentifier | IObjectType | IArrayType | ITupleType;

export interface IObjectType {
    type: "ObjectType";
    properties: IObjectTypeProperty[];
}

export interface IObjectTypeProperty {
    key: IIdentifier;
    datatypes: IDatatype[];
}

export interface IArrayType {
    type: "ArrayType";
    datatypes: IDatatype[];
}

export interface ITupleType {
    type: "TupleType";
    datatypes: IDatatype[][];
}

export interface IObjectExpression {
    type: "ObjectExpression";
    properties: IObjectProperty[];
}

export interface IObjectProperty {
    type: "Property";
    key: IIdentifier;
    value: IExpression;
    kind: "init";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

export interface IArrayExpression {
    type: "ArrayExpression"
    elements: IExpression[]
}

