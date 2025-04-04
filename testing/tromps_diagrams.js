/* 
 * essentially the idea is to store the lambda expression in the same format that Tromp's diagrams are layed out
 * 
 * example of Tromp's diagrams:
 * ┳━┳━┳━┳━━
 * ╋━╋━╋━╋━┳
 * ┃ ┃ ┃ ┣━┛
 * ┃ ┃ ┣━┛
 * ┃ ┣━┛
 * ┣━┛
 * 
 * the horizontal lines represent different variables
 * 
 * the vertical lines are variable references
 * a line will touch the bar that binds it
 *     (for example, a variable referencing the
 *      first input to a function will touch the
 *      highest bar, which corresponds to the
 *      first input)
 * 
 * [0, 0, 0, 0, 1]
 * 
 * some diagrams don't span the full width of the diagram
 * we can represent the extent of horrizontal bars using another array
 * 
 * [[[0, 5]], [[0, 5]]]
 * each layer contains a list of the bars on that layer
 * 
 * function application can be represented with a tree structure
 * each leaf will have two indices, which are the indices of the variables to be applied
 * [[0, [1, [2, [3, 4]]]]]
 */

class TrompDiagram {
    bars = new Array();
    vars = new Array();
    combs = new Array();
    depths = new Array();

    setBars(bars) {
        this.bars = bars;
    }

    setVars(vars) {
        this.vars = vars;
    }

    setCombs(combs) {
        this.combs = combs;
    }

    setDepths(depths) {
        this.depths = depths;
    }

    draw() {
        const canv = document.createElement("canvas");
        const ctx = canv.getContext("2d");

        canv.width = this.vars.length * 4 - 1;
        canv.height = this.bars.length * 2 + 3;

        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = "#0000ff";
        for(let ib = 0;ib < this.bars.length;ib++) {
            for(let isb = 0;isb < this.bars[ib].length;isb++) {
                const startX = this.bars[ib][isb][0] * 4;
                const endX = (this.bars[ib][isb][0] + this.bars[ib][isb][1]) * 4 - 1;
                const startY = ib * 2;
                const endY = ib * 2 + 1;
                ctx.fillRect(startX, startY, endX - startX, endY - startY);
            }
        }

        ctx.fillStyle = "#ff0000";
        for(let iv = 0;iv < this.vars.length;iv++) {
            const startX = iv * 4 + 1;
            const startY = this.vars[iv] * 2 + 1;
            const endX = iv * 4 + 2;
            const endY = (this.bars.length + 2) * 2 - 1;
            ctx.fillRect(startX, startY, endX - startX, endY - startY);
        }

        return canv;
    }

    drawDepths() {
        const canv = document.createElement("canvas");
        const ctx = canv.getContext("2d");

        canv.width = this.vars.length * 4 - 1;
        canv.height = this.depths.reduce((a, b) => Math.max(a, b)) * 2 + 3;

        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = "#000000";

        for(let i = 0;i < this.depths.length;i++) {
            const depth = this.depths[i];
            const delta = i == 0 ? 1 : depth - this.depths[i - 1];
            if(delta > 0) {
                ctx.fillStyle = "#00ff00";
            } else {
                ctx.fillStyle = "#ff00ff";
            }
            ctx.fillRect(i * 4, depth * 2, 3, 1);
        }

        return canv;
    }
}

const lambda1 = new TrompDiagram();
lambda1.setBars([[[0, 4], [4, 4]], [[0, 4], [4, 4]]]);
lambda1.setVars([1, 0, 0, 1, 1, 0, 0, 1]);
lambda1.setCombs([[0, [[1, 2], 3]], [4, [[5, 6], 7]]]);
lambda1.setDepths([1, 3, 3, 2, 1, 3, 3, 2]);