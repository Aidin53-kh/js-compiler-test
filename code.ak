



type f3 = (fn() -> float) | float;
type f2 = fn() -> string | f3;
type f1 = fn() -> f2;

const f = fn() -> f1 {
    return fn() {
        
    };
}


