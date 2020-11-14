/**
 * Type guard to check if a component implements clone
 * @param x
 */
function hasClone(x) {
    return !!(x === null || x === void 0 ? void 0 : x.clone);
}
/**
 * Components are containers for state in Excalibur, the are meant to convey capabilities that an Entity posesses
 *
 * Implementations of Component must have a zero-arg constructor to support dependecies
 *
 * ```typescript
 * class MyComponent extends ex.Component<'my'> {
 *   public readonly type = 'my';
 *   // zero arg support required if you want to use component dependencies
 *   constructor(public optionalPos?: ex.Vector) {}
 * }
 * ```
 */
export class Component {
    constructor() {
        /**
         * Current owning [[Entity]], if any, of this component. Null if not added to any [[Entity]]
         */
        this.owner = null;
    }
    /**
     * Clones any properties on this component, if that property value has a `clone()` method it will be called
     */
    clone() {
        const newComponent = new this.constructor();
        for (const prop in this) {
            if (this.hasOwnProperty(prop)) {
                const val = this[prop];
                if (hasClone(val) && prop !== 'owner' && prop !== 'clone') {
                    newComponent[prop] = val.clone();
                }
                else {
                    newComponent[prop] = val;
                }
            }
        }
        return newComponent;
    }
}
/**
 * Tag components are a way of tagging a component with label and a simple value
 *
 * For example:
 *
 * ```typescript
 * const isOffscreen = new TagComponent('offscreen');
 * entity.addComponent(isOffscreen);
 * entity.tags.includes
 * ```
 */
export class TagComponent extends Component {
    constructor(type, value) {
        super();
        this.type = type;
        this.value = value;
    }
}
//# sourceMappingURL=Component.js.map