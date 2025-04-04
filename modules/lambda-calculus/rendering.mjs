import * as Lambda from "./core.mjs";
import * as Canv from "../canvas.mjs";


function render(lambda, tileSize, color) {
    switch(lambda.getType()) {
    case Lambda.Variable:
        return renderVariable(lambda, tileSize, color);
    case Lambda.Function:
        return renderFunction(lambda, tileSize, color);
    case Lambda.Expression:
        return renderExpression(lambda, tileSize, color);
    default:
        return null;
    }
}

function renderVariable(variable, tileSize, color) {
    if(!(variable instanceof Lambda.Variable)) return null;
    const ctx = Canv.createRenderingContext();
    Canv.setSize(ctx, 3 * tileSize, tileSize);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = color;

    ctx.fillRect(tileSize, 0, tileSize, tileSize);

    return ctx.canvas;
}

function renderFunction(lfunction, tileSize, color) {
    if(!(lfunction instanceof Lambda.Function)) return null;
    const ctx = Canv.createRenderingContext();
    Canv.setSize(ctx, (lfunction.getWidth() * 4 - 1) * tileSize, lfunction.getHeight() * 2 * tileSize);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = color;

    const bodyCanv = render(lfunction.body, tileSize, color);
    ctx.drawImage(bodyCanv, 0, 2 * tileSize);
    
    ctx.fillRect(0, 0, ctx.canvas.width, tileSize);

    const variableIndices = lfunction.getInstanceRelativeIndices(lfunction.param);
    const variableHeights = variableIndices.map(i => lfunction.getRelativeHeightAtRelativeIndex(i));
    for(let i = 0;i < variableIndices.length;i++) {
        const pos = variableIndices[i];
        const height = variableHeights[i];

        ctx.fillRect((pos * 4 + 1) * tileSize, tileSize, tileSize, (height * 2 - 1) * tileSize);
    }

    return ctx.canvas;
}

function renderExpression(expression, tileSize, color) {
    if(!(expression instanceof Lambda.Expression)) return null;
    const ctx = Canv.createRenderingContext();
    Canv.setSize(ctx, (expression.getWidth() * 4 - 1) * tileSize, expression.getHeight() * 2 * tileSize);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = color;

    const leftCanv = render(expression.left, tileSize, color);
    const rightCanv = render(expression.right, tileSize, color);
    ctx.drawImage(leftCanv, 0, 0);
    const leftWidth = expression.left.getWidth();
    ctx.drawImage(rightCanv, leftWidth * 4 * tileSize, 0);

    const heightDifference = leftCanv.height - rightCanv.height;
    if(heightDifference < 0) {
        ctx.fillRect(tileSize, ctx.canvas.height - 2 * tileSize, tileSize, heightDifference);
    } else if(heightDifference > 0) {
        ctx.fillRect((leftWidth * 4 + 1) * tileSize, ctx.canvas.height - 2 * tileSize, tileSize, -heightDifference);
    }

    ctx.fillRect(tileSize, ctx.canvas.height - 2 * tileSize, (leftWidth * 4 + 1) * tileSize, tileSize);
    ctx.fillRect(tileSize, ctx.canvas.height - tileSize, tileSize, tileSize);

    return ctx.canvas;
}

export { render };