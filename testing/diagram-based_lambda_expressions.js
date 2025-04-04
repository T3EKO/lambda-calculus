
/* 
 * how im gonna do this?
 * 
 * store lambda expression in a tree structure
 * 
 * 
 */

class LambdaAbstraction { // function definition, also defines a variable
    parent = null;

    body;

    constructor(body) {
        this.body = body;
    }

    clone() {
        const nla = new LambdaAbstraction(this.body.clone());
        nla.updateParenthood();
        nla.parent = this.parent;
        return nla;
    }

    getSubReferenceList() {
        return this.body.getSubReferenceList();
    }

    getSize() {
        return this.body.getSize();
    }

    updateParenthood() {
        this.body.parent = this;
        this.body.updateParenthood();
    }

    getParentAbstractionLayer() {
        if(this.parent === null) return 0;
        return this.parent.getAbstractionLayer();
    }

    getAbstractionLayer() {
        return 1 + this.getParentAbstractionLayer();
    }

    replaceReferences(abstractionReplaceLayer, replacement) {
        if(this.body instanceof LambdaReference) {
            if(this.body.referenceLayer === abstractionReplaceLayer) {
                this.body = replacement.clone();
                this.body.parent = this;
                this.body.updateReferenceLayers(abstractionReplaceLayer);
            }
        } else {
            this.body.replaceReferences(abstractionReplaceLayer, replacement);
        }
    }
}

class LambdaReference { // references a variable from a lambda abstraction
    parent = null;

    referenceLayer;

    constructor(referenceLayer) {
        this.referenceLayer = referenceLayer;
    }

    clone() {
        const nlr = new LambdaReference(this.referenceLayer);
        nlr.parent = this.parent;
        return nlr;
    }

    getSubReferenceList() {
        return this.referenceLayer;
    }

    getSize() {
        return 1;
    }

    updateParenthood() {
        return;
    }

    getParentAbstractionLayer() {
        if(this.parent === null) return -1;
        return this.parent.getAbstractionLayer();
    }

    getAbstractionLayer() {
        return this.getParentAbstractionLayer();
    }

    updateReferenceLayers(abstractionReplaceLayer) {
        if()
    }
}

class LambdaExpression { // function application, applies the left function to the right argument
    parent = null;

    left;
    right;

    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    clone() {
        const nle = new LambdaExpression(this.left.clone(), this.right.clone());
        nle.updateParenthood();
        nle.parent = this.parent;
        return nle;
    }

    getSubReferenceList() {
        return [this.left.getSubReferenceList(), this.right.getSubReferenceList()].flat();
    }

    getSize() {
        return this.left.getSize() + this.right.getSize();
    }

    updateParenthood() {
        this.left.parent = this;
        this.right.parent = this;
        this.left.updateParenthood();
        this.right.updateParenthood();
    }

    getParentAbstractionLayer() {
        if(this.parent === null) return -1;
        return this.parent.getAbstractionLayer();
    }

    getAbstractionLayer() {
        return this.getParentAbstractionLayer();
    }

    updateReferenceLayers(abstractionReplaceLayer) {
        this.left.updateReferenceLayers(abstractionReplaceLayer);
        this.right.updateReferenceLayers(abstractionReplaceLayer);
    }

    replaceReferences(abstractionReplaceLayer, replacement) {
        if(this.left instanceof LambdaReference) {
            if(this.left.referenceLayer === abstractionReplaceLayer) {
                this.left = replacement.clone();
                this.left.parent = this;
                this.left.updateReferenceLayers(abstractionReplaceLayer);
            }
        } else {
            this.left.replaceReferences(abstractionReplaceLayer, replacement);
        }
        if(this.right instanceof LambdaReference) {
            if(this.right.referenceLayer === abstractionReplaceLayer) {
                this.right = replacement.clone();
                this.right.parent = this;
                this.right.updateReferenceLayers(abstractionReplaceLayer);
            }
        } else {
            this.right.replaceReferences(abstractionReplaceLayer, replacement);
        }
    }

    betaReduce() {
        if(!(this.left instanceof LambdaAbstraction)) return this;

        const abstractionReplaceLayer = this.left.getAbstractionLayer();
        const replacement = this.right;
        const res = this.left.body;
        res.replaceReferences(abstractionReplaceLayer, replacement);
    }
}

const lambda1 = new LambdaExpression(
    new LambdaAbstraction(
        new LambdaAbstraction(
            new LambdaExpression(
                new LambdaReference(1),
                new LambdaExpression(
                    new LambdaExpression(
                        new LambdaReference(0),
                        new LambdaReference(0)
                    ),
                    new LambdaReference(1)
                )
            )
        )
    ),
    new LambdaAbstraction(
        new LambdaAbstraction(
            new LambdaExpression(
                new LambdaReference(1),
                new LambdaExpression(
                    new LambdaExpression(
                        new LambdaReference(0),
                        new LambdaReference(0)
                    ),
                    new LambdaReference(1)
                )
            )
        )
    )
);

lambda1.updateParenthood();