import fs from "fs";
import peggy from "peggy";
import { ASTController } from "./ASTController";
import { storage } from "./storage";
import { TypeDeclarationExtractor } from "./extractors/TypeDeclarationExtractor";

const code = fs.readFileSync("code.ak").toString();
const grammar = fs.readFileSync("grammar.peggy").toString();

const parser = peggy.generate(grammar);
const ast = parser.parse(code);
const astWithoutTypeDeclaration = TypeDeclarationExtractor.extract(ast);
const finalAST = ASTController.start(astWithoutTypeDeclaration);

// const out = escodegen.generate(ast);
// console.clear()
console.dir(storage, { depth: 7 });

// fs.writeFileSync('output.js', out);
