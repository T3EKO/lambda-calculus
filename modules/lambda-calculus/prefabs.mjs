import * as Lambda from "./core.mjs";


function fn(a, b) {
    return new Lambda.Function(a, b);
}

function expr(a, b) {
    return new Lambda.Expression(a, b);
}


const TRUE = fn("a", fn("b", "a"));
const FALSE = fn("a", fn("b", "b"));

const NTH_INTEGER = n => {
    let intermediate = "x";
    for(let i = 0;i < n;i++) {
        intermediate = expr("f", intermediate);
    }
    return fn("f", fn("x", intermediate));
}

const SUCC = fn("n",
    fn("f", fn("x", expr("f", expr(expr("n", "f"), "x"))))
);

const PLUS = fn("m", fn("n",
    fn("f", fn("x", expr(expr("m", "f"), expr(expr("n", "f"), "x"))))
));

const TIMES = fn("m", fn("n",
    fn("f", expr("m", expr("n", "f")))
));

const EXP = fn("m", fn("n",
    expr("n", "m")
));

export { TRUE, FALSE, NTH_INTEGER, SUCC, PLUS, TIMES, EXP, fn, expr };