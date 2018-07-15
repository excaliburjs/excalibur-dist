/**
 * A sorted list implementation. NOTE: this implementation is not self-balancing
 */
export declare class SortedList<T> {
    private _getComparable;
    private _root;
    constructor(getComparable: () => any);
    find(element: any): boolean;
    private _find(node, element);
    get(key: number): any[];
    private _get(node, key);
    add(element: any): boolean;
    private _insert(node, element);
    removeByComparable(element: any): void;
    private _remove(node, element);
    private _cleanup(node, element);
    private _findMinNode(node);
    list(): Array<T>;
    private _list(treeNode, results);
}
/**
 * A tree node part of [[SortedList]]
 */
export declare class BinaryTreeNode {
    private _key;
    private _data;
    private _left;
    private _right;
    constructor(key: number, data: Array<any>, left: BinaryTreeNode, right: BinaryTreeNode);
    getKey(): number;
    setKey(key: number): void;
    getData(): Array<any>;
    setData(data: any): void;
    getLeft(): BinaryTreeNode;
    setLeft(left: BinaryTreeNode): void;
    getRight(): BinaryTreeNode;
    setRight(right: BinaryTreeNode): void;
}
/**
 * Mock element for testing
 *
 * @internal
 */
export declare class MockedElement {
    private _key;
    constructor(key: number);
    getTheKey(): number;
    setKey(key: number): void;
}
