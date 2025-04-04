

function createRenderingContext() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    return ctx;
}

function setSize(ctx, width, height) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
}

export { createRenderingContext, setSize };