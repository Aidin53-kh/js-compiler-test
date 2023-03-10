import fs from "fs";
import peggy from "peggy";
import escodegen from "escodegen";
import { ASTController } from "./ASTController";
import { TypeDeclarationExtractor } from "./extractors/TypeDeclarationExtractor";
import { Type } from "./utils/Type";

const code = fs.readFileSync("code.ak").toString();
const grammar = fs.readFileSync("grammar.peggy").toString();

const parser = peggy.generate(grammar);
const ast = parser.parse(code);
const astWithoutTypeDeclaration = TypeDeclarationExtractor.extract(ast);
const finalAST = ASTController.start(astWithoutTypeDeclaration);

const out = escodegen.generate(finalAST);


console.clear()
// console.dir(storage, { depth: 7 });

fs.writeFileSync('output.js', out);
