import { VariableDeclarator } from "./std";

export interface IStorage {
    variables: Record<string, VariableDeclarator>;
    types: Record<string, any>;
    functions: Record<string, any>;
}

export const storage: IStorage = {
    variables: {},
    types: {},
    functions: {},
};

abstract class Variables {
    public static get(name: string): VariableDeclarator | null {
        return storage.variables[name] || null;
    }

    public static set(name: string, value: VariableDeclarator): void {
        storage.variables[name] = value;
    }

    public static exist(name: string): boolean {
        return storage.variables.hasOwnProperty(name);
    }

    public static ifExist(name: string, cb: (name: string) => void): void {
        if (this.exist(name)) cb(name);
    }

    public static ifNotExist(name: string, cb: (name: string) => void): void {
        if (!this.exist(name)) cb(name);
    }
}

abstract class Functions {
    public static get(name: string): any /** FunctionDeclaration */ | null {
        return storage.functions[name] || null;
    }

    public static set(name: string, value: any /** FunctionDeclaration */): void {
        storage.functions[name] = value;
    }

    public static exist(name: string): boolean {
        return storage.functions.hasOwnProperty(name);
    }

    public static ifExist(name: string, cb: (name: string) => void): void {
        if (this.exist(name)) cb(name);
    }

    public static ifNotExist(name: string, cb: (name: string) => void): void {
        if (!this.exist(name)) cb(name);
    }
}

abstract class Types {
    public static get(name: string): any /** TypeDeclaration */ | null {
        return storage.types[name] || null;
    }

    public static set(name: string, value: any /** TypeDeclaration */): void {
        storage.types[name] = value;
    }

    public static exist(name: string): boolean {
        return storage.types.hasOwnProperty(name);
    }

    public static ifExist(name: string, cb: (name: string) => void): void {
        if (this.exist(name)) cb(name);
    }

    public static ifNotExist(name: string, cb: (name: string) => void): void {
        if (!this.exist(name)) cb(name);
    }
}

abstract class AtAll {
    public static exist(name: string): boolean {
        return (
            storage.variables.hasOwnProperty(name) ||
            storage.types.hasOwnProperty(name) ||
            storage.functions.hasOwnProperty(name)
        );
    }

    public static ifExist(name: string, cb: (name: string) => void): void {
        if (this.exist(name)) cb(name);
    }

    public static ifNotExist(name: string, cb: (name: string) => void): void {
        if (!this.exist(name)) cb(name);
    }
}

export abstract class Storage {
    public static Variables = Variables;
    public static Functions = Functions;
    public static Types = Types;
    public static AtAll = AtAll;
}
