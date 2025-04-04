import * as Lambda from "./modules/lambda-calculus/core.mjs";
import * as Prefabs from "./modules/lambda-calculus/prefabs.mjs";
import * as Renderer from "./modules/lambda-calculus/rendering.mjs";


let DEBUG = true;







if(DEBUG) {
    window.Lambda = Lambda;
    window.Renderer = Renderer;
    window.Prefabs = Prefabs;
    window.fn = Prefabs.fn;
    window.expr = Prefabs.expr;
}