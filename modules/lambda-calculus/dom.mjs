import * as Lambda from "./core.mjs";


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

function makeDOM(lambda) {
    switch(lambda.getType()) {
    case Lambda.Variable:
        return makeVariableDOM(lambda);
    case Lambda.Function:
        return makeFunctionDOM(lambda);
    case Lambda.Expression:
        return makeExpressionDOM(lambda);
    }
}

function makeVariableDOM(variable) {
    if(!(variable instanceof Lambda.Variable)) return null;
    const el = document.createElement("div");
    el.classList.add("lambda");
    el.classList.add("variable");
    el.setAttribute("var-name", variable.name);
    el.style.setProperty("--vwidth", variable.getWidth());
    return el;
}

function makeFunctionDOM(lfunction) {
    if(!(lfunction instanceof Lambda.Function)) return null;
    const el = document.createElement("div");
    el.classList.add("lambda");
    el.classList.add("function");
    el.style.setProperty("--vwidth", lfunction.getWidth());
    const param = makeDOM(lfunction.param);
    param.classList.add("parameter");
    el.append(param, makeDOM(lfunction.body));
    const variableIndices = lfunction.getInstanceRelativeIndices(lfunction.param);
    const variableHeights = variableIndices.map(i => lfunction.getRelativeHeightAtRelativeIndex(i));

    // traverse the HTML tree and set the barPos variable for all elements representing references to this lambda abstraction bar

    for(let i = 0;i < variableIndices.length;i++) {
        const vpos = variableIndices[i];
        const vheight = variableHeights[i];
        const vel = getVariableElementFromHTMLAtRelativeIndex(el.children[1], vpos);
        vel.style.setProperty("--barPos", vheight);
    }

    return el;
}

function makeExpressionDOM(expression) {
    if(!(expression instanceof Lambda.Expression)) return null;
    const el = document.createElement("div");
    el.classList.add("lambda");
    el.classList.add("expression");
    el.style.setProperty("--vwidth", expression.getWidth());
    el.append(makeDOM(expression.left), makeDOM(expression.right));
    return el;
}

export { makeDOM };