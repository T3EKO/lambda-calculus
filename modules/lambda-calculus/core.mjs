
// the function of this program relies on the fact that no two variables can share a name
// to avoid name sharing, a counter is incremented and the value is added to the end of the variable name every time an operation occurs
// please do not name two different variables the same thing and expect it to work

function ensureValidLambda(lambda) {
    if(typeof lambda === "string") return new Variable(lambda);
    return lambda;
}

let GLOBAL_COUNTER = 0;
function globalCounterAccess() {
    return GLOBAL_COUNTER++;
}

class Variable {
    name;

    constructor(name) {
        this.name = name;
    }

    matches(variable) {
        if(variable.getType() !== Variable) return false;
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

    getType() {
        return Variable;
    }

    toString() {
        return `${this.name}`;
    }
}

class Function {
    param;
    body;

    constructor(param, body) {
        this.param = ensureValidLambda(param);
        this.body = ensureValidLambda(body);
    }

    matches(lfunction) {
        if(lfunction.getType() !== Function) return false;
        return this.param.matches(lfunction.param) && this.body.matches(lfunction.body);
    }

    replaceInstances(toReplace, replacement) {
        return new Function(this.param, this.body.replaceInstances(toReplace, replacement));
    }

    betaReduce() {
        return new Function(this.param, this.body.betaReduce());
    }

    randomizeVariables() {
        const newParam = new Variable(this.param.name + globalCounterAccess());
        return new Function(newParam, this.body.replaceInstances(this.param, newParam).randomizeVariables());
    }

    renameVariables(...newNames) {
        if(newNames.length == 0) return this;
        const newParam = new Variable(newNames[0]);
        return new Function(newParam, this.body.replaceInstances(this.param, newParam).renameVariables(...newNames.slice(1)));
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

    getType() {
        return Function;
    }

    toString() {
        return `(λ${this.param}.${this.body})`;
    }
}

class Expression {
    left;
    right;

    constructor(left, right) {
        this.left = ensureValidLambda(left);
        this.right = ensureValidLambda(right);
    }

    matches(expression) {
        if(expression.getType() !== Expression) return false;
        return this.left.matches(expression.left) && this.right.matches(expression.right);
    }

    replaceInstances(toReplace, replacement) {
        return new Expression(this.left.replaceInstances(toReplace, replacement), this.right.replaceInstances(toReplace, replacement));
    }

    betaReduce() {
        if(this.left.getType() !== Function) {
            return new Expression(this.left.betaReduce(), this.right.betaReduce());
        }

        return this.left.body.replaceInstances(this.left.param, this.right);
    }

    randomizeVariables() {
        return new Expression(this.left.randomizeVariables(), this.right.randomizeVariables());
    }

    renameVariables(...newNames) {
        if(newNames.length == 0) return this;
        const left = this.left.renameVariables(...newNames);
        const leftUseCount = this.left.variableCount();
        if(leftUseCount > newNames.length) return new Expression(left, this.right);
        const newNames2 = newNames.slice(leftUseCount);
        const right = this.right.renameVariables(...newNames2);
        return new Expression(left, right);
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

    getType() {
        return Expression;
    }

    toString() {
        return `(${this.left} ${this.right})`;
    }
}

function betaReduceNTimes(lambda, n) {
    let intermediate = lambda;
    for(let i = 0;i < n;i++) {
        intermediate = intermediate.betaReduce();
    }
    return intermediate;
}

export { Variable, Function, Expression, betaReduceNTimes };