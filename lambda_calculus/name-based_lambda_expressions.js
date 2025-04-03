
// the function of this program relies on the fact that no two variables can share a name
// to avoid name sharing, a counter is incremented and the value is added to the end of the variable name every time an operation occurs
// please do not name two different variables the same thing and expect it to work

function ensureValidLambda(lambda) {
    if(typeof lambda === "string") return new LAMBDA_TYPES.VARIABLE(lambda);
    return lambda;
}

let GLOBAL_COUNTER = 0;
function globalCounterAccess() {
    return GLOBAL_COUNTER++;
}

function getVariableElementFromHTMLAtRelativeIndex(html, i) {
	if(i < 0 || i > parseInt(html.style.getPropertyValue("--vwidth"))) return null;
	if(html.classList.contains("variable")) {
		return html;
	}
	if(html.classList.contains("function")) {
		return getVariableElementFromHTMLAtRelativeIndex(html.children[1], i);
	}
	if(html.classList.contains("expression")) {
		const lWidth = parseInt(html.children[0].style.getPropertyValue("--vwidth"));
		if(i < lWidth) {
			return getVariableElementFromHTMLAtRelativeIndex(html.children[0], i);
		}
		return getVariableElementFromHTMLAtRelativeIndex(html.children[1], i - lWidth);
	}
	return null;
}

const LAMBDA_TYPES = {
    VARIABLE: class {
        name;

        constructor(name) {
            this.name = name;
        }

        matches(variable) {
            return this.name === variable.name;
        }

        replaceInstances(toReplace, replacement) {
            if(this.matches(toReplace)) return replacement.randomizeVariables();
            return this;
        }

        betaReduce() {
            return this;
        }

        randomizeVariables() {
            return this;
        }

        renameVariables(...newNames) {
            return this;
        }

        variableCount() {
            return 0;
        }

        getWidth() {
            return 1;
        }

        getHeight() {
            return 0;
        }

        getVariableAtRelativeIndex(i) {
            if(i != 0) return null;
            return this;
        }

        getRelativeHeightAtRelativeIndex(i) {
            if(i != 0) return null;
            return 0;
        }

        getInstanceRelativeIndices(match) {
            if(this.matches(match)) return [0];
            return [];
        }

        getHTML() {
            const el = document.createElement("div");
            el.classList.add("lambda");
            el.classList.add("variable");
            el.setAttribute("var-name", this.name);
            el.style.setProperty("--vwidth", this.getWidth());
            return el;
        }

        draw(color) {
            const canv = document.createElement("canvas");
            const ctx = canv.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            canv.width = 3;
            canv.height = 1;
            ctx.fillStyle = color;
            // ctx.fillStyle = "#0000ff";
            ctx.fillRect(1, 0, 1, 1);
            return canv;
        }

        getType() {
            return LAMBDA_TYPES.VARIABLE;
        }

        toString() {
            return `${this.name}`;
        }
    },
    FUNCTION: class {
        param;
        body;

        constructor(param, body) {
            this.param = ensureValidLambda(param);
            this.body = ensureValidLambda(body);
        }

        replaceInstances(toReplace, replacement) {
            return new LAMBDA_TYPES.FUNCTION(this.param, this.body.replaceInstances(toReplace, replacement));
        }

        betaReduce() {
            return new LAMBDA_TYPES.FUNCTION(this.param, this.body.betaReduce());
        }

        randomizeVariables() {
            const newParam = new LAMBDA_TYPES.VARIABLE(this.param.name + globalCounterAccess());
            return new LAMBDA_TYPES.FUNCTION(newParam, this.body.replaceInstances(this.param, newParam).randomizeVariables());
        }

        renameVariables(...newNames) {
            if(newNames.length == 0) return this;
            const newParam = new LAMBDA_TYPES.VARIABLE(newNames[0]);
            return new LAMBDA_TYPES.FUNCTION(newParam, this.body.replaceInstances(this.param, newParam).renameVariables(...newNames.slice(1)));
        }

        variableCount() {
            return this.body.variableCount() + 1;
        }

        getWidth() {
            return this.body.getWidth();
        }

        getHeight() {
            return this.body.getHeight() + 1;
        }

        getVariableAtRelativeIndex(i) {
            if(i < 0 || i >= this.getWidth()) return null;
            return this.body.getVariableAtRelativeIndex(i);
        }

        getRelativeHeightAtRelativeIndex(i) {
            if(i < 0 || i >= this.getWidth()) return null;
            return this.body.getRelativeHeightAtRelativeIndex(i) + 1;
        }

        getInstanceRelativeIndices(match) {
            return this.body.getInstanceRelativeIndices(match);
        }

        getHTML() {
            const el = document.createElement("div");
            el.classList.add("lambda");
            el.classList.add("function");
            el.style.setProperty("--vwidth", this.getWidth());
            const param = this.param.getHTML();
            param.classList.add("parameter");
            el.append(param, this.body.getHTML());
            const variableIndices = this.getInstanceRelativeIndices(this.param);
            const variableHeights = variableIndices.map(i => this.getRelativeHeightAtRelativeIndex(i));

            // traverse the HTML tree and set the barPos variable for all elements representing references to this lambda abstraction bar

            for(let i = 0;i < variableIndices.length;i++) {
                const vpos = variableIndices[i];
                const vheight = variableHeights[i];
                const vel = getVariableElementFromHTMLAtRelativeIndex(el.children[1], vpos);
                vel.style.setProperty("--barPos", vheight);
            }

            return el;
        }

        draw(color) {
            const canv = document.createElement("canvas");
            const ctx = canv.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            canv.width = this.getWidth() * 4 - 1;
            canv.height = this.getHeight() * 2;
            ctx.fillStyle = color;
            const body = this.body.draw(color);
            ctx.drawImage(body, 0, 2);
            // ctx.fillStyle = "#ff00ff";
            ctx.fillRect(0, 0, canv.width, 1);

            // ctx.fillStyle = "#777777";
            const variableIndices = this.getInstanceRelativeIndices(this.param);
            const variableHeights = variableIndices.map(i => this.getRelativeHeightAtRelativeIndex(i));
            for(let i = 0;i < variableIndices.length;i++) {
                const pos = variableIndices[i];
                const height = variableHeights[i];
                ctx.fillRect(pos * 4 + 1, 1, 1, height * 2 - 1);
            }

            return canv;
        }

        getType() {
            return LAMBDA_TYPES.FUNCTION;
        }

        toString() {
            return `(λ${this.param}.${this.body})`;
        }
    },
    EXPRESSION: class {
        left;
        right;

        constructor(left, right) {
            this.left = ensureValidLambda(left);
            this.right = ensureValidLambda(right);
        }

        replaceInstances(toReplace, replacement) {
            return new LAMBDA_TYPES.EXPRESSION(this.left.replaceInstances(toReplace, replacement), this.right.replaceInstances(toReplace, replacement));
        }

        betaReduce() {
            if(this.left.getType() !== LAMBDA_TYPES.FUNCTION) {
                return new LAMBDA_TYPES.EXPRESSION(this.left.betaReduce(), this.right.betaReduce());
            }

            return this.left.body.replaceInstances(this.left.param, this.right);
        }

        randomizeVariables() {
            return new LAMBDA_TYPES.EXPRESSION(this.left.randomizeVariables(), this.right.randomizeVariables());
        }

        renameVariables(...newNames) {
            if(newNames.length == 0) return this;
            const left = this.left.renameVariables(...newNames);
            const leftUseCount = this.left.variableCount();
            if(leftUseCount > newNames.length) return new LAMBDA_TYPES.EXPRESSION(left, this.right);
            const newNames2 = newNames.slice(leftUseCount);
            const right = this.right.renameVariables(...newNames2);
            return new LAMBDA_TYPES.EXPRESSION(left, right);
        }

        variableCount() {
            return this.left.variableCount() + this.right.variableCount();
        }

        getWidth() {
            return this.left.getWidth() + this.right.getWidth();
        }

        getHeight() {
            return Math.max(this.left.getHeight(), this.right.getHeight()) + 1;
        }

        getVariableAtRelativeIndex(i) {
            if(i < 0 || i >= this.getWidth()) return null;
            const leftWidth = this.left.getWidth();
            if(i < leftWidth) return this.left.getVariableAtRelativeIndex(i);
            return this.right.getVariableAtRelativeIndex(i - leftWidth);
        }

        getRelativeHeightAtRelativeIndex(i) {
            if(i < 0 || i >= this.getWidth()) return null;
            const leftWidth = this.left.getWidth();
            if(i < leftWidth) return this.left.getRelativeHeightAtRelativeIndex(i);
            return this.right.getRelativeHeightAtRelativeIndex(i - leftWidth);
        }

        getInstanceRelativeIndices(match) {
            const leftIndices = this.left.getInstanceRelativeIndices(match);
            const leftWidth = this.left.getWidth();
            const rightIndices = this.right.getInstanceRelativeIndices(match).map(v => v + leftWidth);
            return leftIndices.concat(rightIndices);
        }

        getHTML() {
            const el = document.createElement("div");
            el.classList.add("lambda");
            el.classList.add("expression");
            el.style.setProperty("--vwidth", this.getWidth());
            el.append(this.left.getHTML(), this.right.getHTML());
            return el;
        }

        draw(color) {
            const canv = document.createElement("canvas");
            const ctx = canv.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            canv.width = this.getWidth() * 4 - 1;
            canv.height = this.getHeight() * 2;
            ctx.fillStyle = color;
            const leftWidth = this.left.getWidth();
            const left = this.left.draw(color);
            ctx.drawImage(left, 0, 0);
            const right = this.right.draw(color);
            ctx.drawImage(right, leftWidth * 4, 0);

            const dif = left.height - right.height;
            // ctx.fillStyle = "#ff0000";
            if(dif < 0) {
                ctx.fillRect(1, canv.height - 2, 1, dif);
            } else if(dif > 0) {
                ctx.fillRect(leftWidth * 4 + 1, canv.height - 2, 1, -dif);
            }

            // ctx.fillStyle = "#00ff00";
            ctx.fillRect(1, canv.height - 2, leftWidth * 4 + 1, 1);
            ctx.fillRect(1, canv.height - 1, 1, 1);
            return canv;
        }

        getType() {
            return LAMBDA_TYPES.EXPRESSION;
        }

        toString() {
            return `(${this.left} ${this.right})`;
        }
    }
};

function betaReduceNTimes(lambda, n) {
    let intermediate = lambda;
    for(let i = 0;i < n;i++) {
        intermediate = intermediate.betaReduce();
    }
    return intermediate;
}

const fn = (v, b) => new LAMBDA_TYPES.FUNCTION(v, b);
const expr = (l, r) => new LAMBDA_TYPES.EXPRESSION(l, r);

const TRUE = fn(
    "a",
    fn("b",
        "a"
    )
);
const FALSE = fn(
    "a",
    fn("b",
        "b"
    )
);

const ZERO = fn("f",
    fn("x",
        "x"
    )
);

const ONE = fn("f",
    fn("x",
        expr(
            "f",
            "x"
        )
    )
);

const TWO = fn("f",
    fn("x",
        expr(
            "f",
            expr(
                "f",
                "x"
            )
        )
    )
);

function NTH_INTEGER(n) {
    let intermediate = "x";
    for(let i = 0;i < n;i++) {
        intermediate = expr("f", intermediate);
    }
    return fn("f", fn("x", intermediate));
}

const SUCC = fn("n", fn("f",
    fn("x",
        expr("f", expr(expr("n", "f"), "x"))
    )
));

const PLUS = fn("m", fn("n", fn("f", fn("x", 
    expr(expr("m", "f"), expr(expr("n", "f"), "x"))
))));

const TIMES = fn("m", fn("n", fn("f",
    expr("n", expr("m", "f"))
)));

const EXP = fn("m", fn("n", expr("n", "m")));

const PLUS_TIMES_PLUS = expr(expr(
    fn("a", fn("b", expr(expr("a", "b"), "b"))),
    TIMES
), PLUS);

const IS_0 = fn("n",
    fn("a", fn("b", 
        expr(
            expr(
                "n",
                fn("c", "b")
            ),
            "a"
        )
    ))
);

const MINUS_1 = fn("n",
    fn("f", fn("x",
        expr(
            expr(
                expr(
                    "n",
                    fn("a", fn("b",
                        expr(
                            "b",
                            expr("a", "f")
                        )
                    ))
                ),
                fn("a", "x")
            ),
            fn("a", "a")
        )
    ))
);

const U = fn("x", fn("y", expr("y", expr(expr("x", "x"), "y"))));

const THETA = expr(U, U);

const FACTORIAL = expr(
    THETA,
    fn("f",
        fn("n",
            expr(
                expr(
                    expr(
                        IS_0,
                        "n"
                    ),
                    ONE
                ),
                expr(
                    expr(
                        TIMES,
                        "n"
                    ),
                    expr(
                        "f",
                        expr(
                            MINUS_1,
                            "n"
                        )
                    )
                )
            )
        )
    )
);
