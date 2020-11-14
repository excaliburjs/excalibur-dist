import { Physics } from './../Physics';
import { BoundingBox } from './BoundingBox';
import { Logger } from '../Util/Log';
/**
 * Dynamic Tree Node used for tracking bounds within the tree
 */
export class TreeNode {
    constructor(parent) {
        this.parent = parent;
        this.parent = parent || null;
        this.body = null;
        this.bounds = new BoundingBox();
        this.left = null;
        this.right = null;
        this.height = 0;
    }
    isLeaf() {
        return !this.left && !this.right;
    }
}
/**
 * The DynamicTrees provides a spatial partitioning data structure for quickly querying for overlapping bounding boxes for
 * all tracked bodies. The worst case performance of this is O(n*log(n)) where n is the number of bodies in the tree.
 *
 * Internally the bounding boxes are organized as a balanced binary tree of bounding boxes, where the leaf nodes are tracked bodies.
 * Every non-leaf node is a bounding box that contains child bounding boxes.
 */
export class DynamicTree {
    constructor(worldBounds = new BoundingBox(-Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)) {
        this.worldBounds = worldBounds;
        this.root = null;
        this.nodes = {};
    }
    /**
     * Inserts a node into the dynamic tree
     */
    _insert(leaf) {
        // If there are no nodes in the tree, make this the root leaf
        if (this.root === null) {
            this.root = leaf;
            this.root.parent = null;
            return;
        }
        // Search the tree for a node that is not a leaf and find the best place to insert
        const leafAABB = leaf.bounds;
        let currentRoot = this.root;
        while (!currentRoot.isLeaf()) {
            const left = currentRoot.left;
            const right = currentRoot.right;
            const area = currentRoot.bounds.getPerimeter();
            const combinedAABB = currentRoot.bounds.combine(leafAABB);
            const combinedArea = combinedAABB.getPerimeter();
            // Calculate cost heuristic for creating a new parent and leaf
            const cost = 2 * combinedArea;
            // Minimum cost of pushing the leaf down the tree
            const inheritanceCost = 2 * (combinedArea - area);
            // Cost of descending
            let leftCost = 0;
            const leftCombined = leafAABB.combine(left.bounds);
            let newArea;
            let oldArea;
            if (left.isLeaf()) {
                leftCost = leftCombined.getPerimeter() + inheritanceCost;
            }
            else {
                oldArea = left.bounds.getPerimeter();
                newArea = leftCombined.getPerimeter();
                leftCost = newArea - oldArea + inheritanceCost;
            }
            let rightCost = 0;
            const rightCombined = leafAABB.combine(right.bounds);
            if (right.isLeaf()) {
                rightCost = rightCombined.getPerimeter() + inheritanceCost;
            }
            else {
                oldArea = right.bounds.getPerimeter();
                newArea = rightCombined.getPerimeter();
                rightCost = newArea - oldArea + inheritanceCost;
            }
            // cost is acceptable
            if (cost < leftCost && cost < rightCost) {
                break;
            }
            // Descend to the depths
            if (leftCost < rightCost) {
                currentRoot = left;
            }
            else {
                currentRoot = right;
            }
        }
        // Create the new parent node and insert into the tree
        const oldParent = currentRoot.parent;
        const newParent = new TreeNode(oldParent);
        newParent.bounds = leafAABB.combine(currentRoot.bounds);
        newParent.height = currentRoot.height + 1;
        if (oldParent !== null) {
            // The sibling node was not the root
            if (oldParent.left === currentRoot) {
                oldParent.left = newParent;
            }
            else {
                oldParent.right = newParent;
            }
            newParent.left = currentRoot;
            newParent.right = leaf;
            currentRoot.parent = newParent;
            leaf.parent = newParent;
        }
        else {
            // The sibling node was the root
            newParent.left = currentRoot;
            newParent.right = leaf;
            currentRoot.parent = newParent;
            leaf.parent = newParent;
            this.root = newParent;
        }
        // Walk up the tree fixing heights and AABBs
        let currentNode = leaf.parent;
        while (currentNode) {
            currentNode = this._balance(currentNode);
            if (!currentNode.left) {
                throw new Error('Parent of current leaf cannot have a null left child' + currentNode);
            }
            if (!currentNode.right) {
                throw new Error('Parent of current leaf cannot have a null right child' + currentNode);
            }
            currentNode.height = 1 + Math.max(currentNode.left.height, currentNode.right.height);
            currentNode.bounds = currentNode.left.bounds.combine(currentNode.right.bounds);
            currentNode = currentNode.parent;
        }
    }
    /**
     * Removes a node from the dynamic tree
     */
    _remove(leaf) {
        if (leaf === this.root) {
            this.root = null;
            return;
        }
        const parent = leaf.parent;
        const grandParent = parent.parent;
        let sibling;
        if (parent.left === leaf) {
            sibling = parent.right;
        }
        else {
            sibling = parent.left;
        }
        if (grandParent) {
            if (grandParent.left === parent) {
                grandParent.left = sibling;
            }
            else {
                grandParent.right = sibling;
            }
            sibling.parent = grandParent;
            let currentNode = grandParent;
            while (currentNode) {
                currentNode = this._balance(currentNode);
                currentNode.bounds = currentNode.left.bounds.combine(currentNode.right.bounds);
                currentNode.height = 1 + Math.max(currentNode.left.height, currentNode.right.height);
                currentNode = currentNode.parent;
            }
        }
        else {
            this.root = sibling;
            sibling.parent = null;
        }
    }
    /**
     * Tracks a body in the dynamic tree
     */
    trackBody(body) {
        const node = new TreeNode();
        node.body = body;
        node.bounds = body.collider.bounds;
        node.bounds.left -= 2;
        node.bounds.top -= 2;
        node.bounds.right += 2;
        node.bounds.bottom += 2;
        this.nodes[body.id] = node;
        this._insert(node);
    }
    /**
     * Updates the dynamic tree given the current bounds of each body being tracked
     */
    updateBody(body) {
        const node = this.nodes[body.id];
        if (!node) {
            return false;
        }
        const b = body.collider.bounds;
        // if the body is outside the world no longer update it
        if (!this.worldBounds.contains(b)) {
            Logger.getInstance().warn('Collider with id ' + body.id + ' is outside the world bounds and will no longer be tracked for physics');
            this.untrackBody(body);
            return false;
        }
        if (node.bounds.contains(b)) {
            return false;
        }
        this._remove(node);
        b.left -= Physics.boundsPadding;
        b.top -= Physics.boundsPadding;
        b.right += Physics.boundsPadding;
        b.bottom += Physics.boundsPadding;
        const multdx = body.vel.x * Physics.dynamicTreeVelocityMultiplier;
        const multdy = body.vel.y * Physics.dynamicTreeVelocityMultiplier;
        if (multdx < 0) {
            b.left += multdx;
        }
        else {
            b.right += multdx;
        }
        if (multdy < 0) {
            b.top += multdy;
        }
        else {
            b.bottom += multdy;
        }
        node.bounds = b;
        this._insert(node);
        return true;
    }
    /**
     * Untracks a body from the dynamic tree
     */
    untrackBody(body) {
        const node = this.nodes[body.collider.id];
        if (!node) {
            return;
        }
        this._remove(node);
        this.nodes[body.collider.id] = null;
        delete this.nodes[body.collider.id];
    }
    /**
     * Balances the tree about a node
     */
    _balance(node) {
        if (node === null) {
            throw new Error('Cannot balance at null node');
        }
        if (node.isLeaf() || node.height < 2) {
            return node;
        }
        const left = node.left;
        const right = node.right;
        const a = node;
        const b = left;
        const c = right;
        const d = left.left;
        const e = left.right;
        const f = right.left;
        const g = right.right;
        const balance = c.height - b.height;
        // Rotate c node up
        if (balance > 1) {
            // Swap the right node with it's parent
            c.left = a;
            c.parent = a.parent;
            a.parent = c;
            // The original node's old parent should point to the right node
            // this is mega confusing
            if (c.parent) {
                if (c.parent.left === a) {
                    c.parent.left = c;
                }
                else {
                    c.parent.right = c;
                }
            }
            else {
                this.root = c;
            }
            // Rotate
            if (f.height > g.height) {
                c.right = f;
                a.right = g;
                g.parent = a;
                a.bounds = b.bounds.combine(g.bounds);
                c.bounds = a.bounds.combine(f.bounds);
                a.height = 1 + Math.max(b.height, g.height);
                c.height = 1 + Math.max(a.height, f.height);
            }
            else {
                c.right = g;
                a.right = f;
                f.parent = a;
                a.bounds = b.bounds.combine(f.bounds);
                c.bounds = a.bounds.combine(g.bounds);
                a.height = 1 + Math.max(b.height, f.height);
                c.height = 1 + Math.max(a.height, g.height);
            }
            return c;
        }
        // Rotate left node up
        if (balance < -1) {
            // swap
            b.left = a;
            b.parent = a.parent;
            a.parent = b;
            // node's old parent should point to b
            if (b.parent) {
                if (b.parent.left === a) {
                    b.parent.left = b;
                }
                else {
                    if (b.parent.right !== a) {
                        throw 'Error rotating Dynamic Tree';
                    }
                    b.parent.right = b;
                }
            }
            else {
                this.root = b;
            }
            // rotate
            if (d.height > e.height) {
                b.right = d;
                a.left = e;
                e.parent = a;
                a.bounds = c.bounds.combine(e.bounds);
                b.bounds = a.bounds.combine(d.bounds);
                a.height = 1 + Math.max(c.height, e.height);
                b.height = 1 + Math.max(a.height, d.height);
            }
            else {
                b.right = e;
                a.left = d;
                d.parent = a;
                a.bounds = c.bounds.combine(d.bounds);
                b.bounds = a.bounds.combine(e.bounds);
                a.height = 1 + Math.max(c.height, d.height);
                b.height = 1 + Math.max(a.height, e.height);
            }
            return b;
        }
        return node;
    }
    /**
     * Returns the internal height of the tree, shorter trees are better. Performance drops as the tree grows
     */
    getHeight() {
        if (this.root === null) {
            return 0;
        }
        return this.root.height;
    }
    /**
     * Queries the Dynamic Axis Aligned Tree for bodies that could be colliding with the provided body.
     *
     * In the query callback, it will be passed a potential collider. Returning true from this callback indicates
     * that you are complete with your query and you do not want to continue. Returning false will continue searching
     * the tree until all possible colliders have been returned.
     */
    query(body, callback) {
        const bounds = body.collider.bounds;
        const helper = (currentNode) => {
            if (currentNode && currentNode.bounds.intersect(bounds)) {
                if (currentNode.isLeaf() && currentNode.body !== body) {
                    if (callback.call(body, currentNode.body)) {
                        return true;
                    }
                }
                else {
                    return helper(currentNode.left) || helper(currentNode.right);
                }
            }
            return false;
        };
        helper(this.root);
    }
    /**
     * Queries the Dynamic Axis Aligned Tree for bodies that could be intersecting. By default the raycast query uses an infinitely
     * long ray to test the tree specified by `max`.
     *
     * In the query callback, it will be passed a potential body that intersects with the raycast. Returning true from this
     * callback indicates that your are complete with your query and do not want to continue. Return false will continue searching
     * the tree until all possible bodies that would intersect with the ray have been returned.
     */
    rayCastQuery(ray, max = Infinity, callback) {
        const helper = (currentNode) => {
            if (currentNode && currentNode.bounds.rayCast(ray, max)) {
                if (currentNode.isLeaf()) {
                    if (callback.call(ray, currentNode.body)) {
                        // ray hit a leaf! return the body
                        return true;
                    }
                }
                else {
                    // ray hit but not at a leaf, recurse deeper
                    return helper(currentNode.left) || helper(currentNode.right);
                }
            }
            return false; // ray missed
        };
        helper(this.root);
    }
    getNodes() {
        const helper = (currentNode) => {
            if (currentNode) {
                return [currentNode].concat(helper(currentNode.left), helper(currentNode.right));
            }
            else {
                return [];
            }
        };
        return helper(this.root);
    }
    debugDraw(ctx) {
        // draw all the nodes in the Dynamic Tree
        const helper = (currentNode) => {
            if (currentNode) {
                if (currentNode.isLeaf()) {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'green';
                }
                else {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'white';
                }
                currentNode.bounds.debugDraw(ctx);
                if (currentNode.left) {
                    helper(currentNode.left);
                }
                if (currentNode.right) {
                    helper(currentNode.right);
                }
            }
        };
        helper(this.root);
    }
}
//# sourceMappingURL=DynamicTree.js.map