declare module ex {
    /**
     * Effects
     *
     * These effects can be applied to any bitmap image but are mainly used
     * for [[Sprite]] effects or [[Animation]] effects.
     *
     * Because these manipulate raw pixels, there is a performance impact to applying
     * too many effects. Excalibur tries its best to by using caching to mitigate
     * performance issues.
     *
     * Create your own effects by implementing [[ISpriteEffect]].
     */
    module Effects {
        /**
         * The interface that all sprite effects must implement
         */
        interface ISpriteEffect {
            /**
             * Should update individual pixels values
             * @param x          The pixel's x coordinate
             * @param y          The pixel's y coordinate
             * @param imageData  The sprite's raw pixel data
             */
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Grayscale" effect to a sprite, removing color information.
         */
        class Grayscale implements ISpriteEffect {
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Invert" effect to a sprite, inverting the pixel colors.
         */
        class Invert implements ISpriteEffect {
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Opacity" effect to a sprite, setting the alpha of all pixels to a given value.
         */
        class Opacity implements ISpriteEffect {
            opacity: number;
            /**
             * @param opacity  The new opacity of the sprite from 0-1.0
             */
            constructor(opacity: number);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Colorize" effect to a sprite, changing the color channels of all the pixels to an
         * average of the original color and the provided color
         */
        class Colorize implements ISpriteEffect {
            color: Color;
            /**
             * @param color  The color to apply to the sprite
             */
            constructor(color: Color);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Lighten" effect to a sprite, changes the lightness of the color according to HSL
         */
        class Lighten implements ISpriteEffect {
            factor: number;
            /**
             * @param factor  The factor of the effect between 0-1
             */
            constructor(factor?: number);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Darken" effect to a sprite, changes the darkness of the color according to HSL
         */
        class Darken implements ISpriteEffect {
            factor: number;
            /**
             * @param factor  The factor of the effect between 0-1
             */
            constructor(factor?: number);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Saturate" effect to a sprite, saturates the color acccording to HSL
         */
        class Saturate implements ISpriteEffect {
            factor: number;
            /**
             * @param factor  The factor of the effect between 0-1
             */
            constructor(factor?: number);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Desaturate" effect to a sprite, desaturates the color acccording to HSL
         */
        class Desaturate implements ISpriteEffect {
            factor: number;
            /**
             * @param factor  The factor of the effect between 0-1
             */
            constructor(factor?: number);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Fill" effect to a sprite, changing the color channels of all non-transparent pixels to match
         * a given color
         */
        class Fill implements ISpriteEffect {
            color: Color;
            /**
             * @param color  The color to apply to the sprite
             */
            constructor(color: Color);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
    }
}
declare module ex {
    /**
     * Interface for implementing anything in Excalibur that can be drawn to the screen.
     */
    interface IDrawable {
        /**
         * Indicates whether the drawing is to be flipped vertically
         */
        flipVertical: boolean;
        /**
         * Indicates whether the drawing is to be flipped horizontally
         */
        flipHorizontal: boolean;
        /**
         * Indicates the current width of the drawing in pixels, factoring in the scale
         */
        width: number;
        /**
         * Indicates the current height of the drawing in pixels, factoring in the scale
         */
        height: number;
        /**
         * Indicates the natural width of the drawing in pixels, this is the original width of the source image
         */
        naturalWidth: number;
        /**
         * Indicates the natural height of the drawing in pixels, this is the original height of the source image
         */
        naturalHeight: number;
        /**
         * Adds a new [[ISpriteEffect]] to this drawing.
         * @param effect  Effect to add to the this drawing
         */
        addEffect(effect: ex.Effects.ISpriteEffect): any;
        /**
         * Removes an effect [[ISpriteEffect]] from this drawing.
         * @param effect  Effect to remove from this drawing
         */
        removeEffect(effect: ex.Effects.ISpriteEffect): any;
        /**
         * Removes an effect by index from this drawing.
         * @param index  Index of the effect to remove from this drawing
         */
        removeEffect(index: number): any;
        removeEffect(param: any): any;
        /**
         * Clears all effects from the drawing and return it to its original state.
         */
        clearEffects(): any;
        /**
         * Gets or sets the point about which to apply transformations to the drawing relative to the
         * top left corner of the drawing.
         */
        anchor: ex.Vector;
        /**
         * Gets or sets the scale trasformation
         */
        scale: ex.Vector;
        /**
         * Sets the current rotation transformation for the drawing.
         */
        rotation: number;
        /**
         * Resets the internal state of the drawing (if any)
         */
        reset(): any;
        /**
         * Draws the sprite appropriately to the 2D rendering context.
         * @param ctx  The 2D rendering context
         * @param x    The x coordinate of where to draw
         * @param y    The y coordinate of where to draw
         */
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): any;
    }
}
declare module ex {
    /**
     * A 2D vector on a plane.
     */
    class Vector {
        x: number;
        y: number;
        /**
         * A (0, 0) vector
         */
        static Zero: Vector;
        /**
         * A unit vector pointing up (0, -1)
         */
        static Up: Vector;
        /**
         * A unit vector pointing down (0, 1)
         */
        static Down: Vector;
        /**
         * A unit vector pointing left (-1, 0)
         */
        static Left: Vector;
        /**
         * A unit vector pointing right (1, 0)
         */
        static Right: Vector;
        /**
         * Returns a vector of unit length in the direction of the specified angle in Radians.
         * @param angle The angle to generate the vector
         */
        static fromAngle(angle: number): Vector;
        /**
         * @param x  X component of the Vector
         * @param y  Y component of the Vector
         */
        constructor(x: number, y: number);
        /**
         * Sets the x and y components at once
         */
        setTo(x: number, y: number): void;
        /**
         * Compares this point against another and tests for equality
         * @param point  The other point to compare to
         */
        equals(vector: Vector, tolerance?: number): boolean;
        /**
         * The distance to another vector
         * @param v  The other vector
         */
        distance(v?: Vector): number;
        /**
         * Normalizes a vector to have a magnitude of 1.
         */
        normalize(): Vector;
        /**
         * Returns the average (midpoint) between the current point and the specified
         */
        average(vec: Vector): Vector;
        /**
         * Scales a vector's by a factor of size
         * @param size  The factor to scale the magnitude by
         */
        scale(size: any): Vector;
        /**
         * Adds one vector to another
         * @param v The vector to add
         */
        add(v: Vector): Vector;
        /**
         * Subtracts a vector from another, if you subract vector `B.sub(A)` the resulting vector points from A -> B
         * @param v The vector to subtract
         */
        sub(v: Vector): Vector;
        /**
         * Adds one vector to this one modifying the original
         * @param v The vector to add
         */
        addEqual(v: Vector): Vector;
        /**
         * Subtracts a vector from this one modifying the original
         * @parallel v The vector to subtract
         */
        subEqual(v: Vector): Vector;
        /**
         * Scales this vector by a factor of size and modifies the original
         */
        scaleEqual(size: number): Vector;
        /**
         * Performs a dot product with another vector
         * @param v  The vector to dot
         */
        dot(v: Vector): number;
        /**
         * Performs a 2D cross product with scalar. 2D cross products with a scalar return a vector.
         * @param v  The vector to cross
         */
        cross(v: number): Vector;
        /**
         * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
         * @param v  The vector to cross
         */
        cross(v: Vector): number;
        /**
         * Returns the perpendicular vector to this one
         */
        perpendicular(): Vector;
        /**
         * Returns the normal vector to this one, same as the perpendicular of length 1
         */
        normal(): Vector;
        /**
         * Negate the current vector
         */
        negate(): Vector;
        /**
         * Returns the angle of this vector.
         */
        toAngle(): number;
        /**
         * Rotates the current vector around a point by a certain number of
         * degrees in radians
         */
        rotate(angle: number, anchor?: Vector): Vector;
        /**
         * Creates new vector that has the same values as the previous.
         */
        clone(): Vector;
        /**
         * Returns a string repesentation of the vector.
         */
        toString(): string;
    }
    /**
     * A 2D ray that can be cast into the scene to do collision detection
     */
    class Ray {
        pos: Vector;
        dir: Vector;
        /**
         * @param pos The starting position for the ray
         * @param dir The vector indicating the direction of the ray
         */
        constructor(pos: Vector, dir: Vector);
        /**
         * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success.
         * This number indicates the mathematical intersection time.
         * @param line  The line to test
         */
        intersect(line: Line): number;
        /**
         * Returns the point of intersection given the intersection time
         */
        getPoint(time: number): Vector;
    }
    /**
     * A 2D line segment
     */
    class Line {
        begin: Vector;
        end: Vector;
        /**
         * @param begin  The starting point of the line segment
         * @param end  The ending point of the line segment
         */
        constructor(begin: Vector, end: Vector);
        /**
         * Returns the slope of the line in the form of a vector
         */
        getSlope(): Vector;
        /**
         * Returns the length of the line segment in pixels
         */
        getLength(): number;
    }
    /**
     * A 1 dimensional projection on an axis, used to test overlaps
     */
    class Projection {
        min: number;
        max: number;
        constructor(min: number, max: number);
        overlaps(projection: Projection): boolean;
        getOverlap(projection: Projection): number;
    }
}
declare module ex {
    interface IEnginePhysics {
        /**
         * Global engine acceleration, useful for defining consitent gravity on all actors
         */
        acc: Vector;
        /**
         * Global to switch physics on or off (switching physics off will improve performance)
         */
        enabled: boolean;
        /**
         * Default mass of new actors created in excalibur
         */
        defaultMass: number;
        /**
         * Number of pos/vel integration steps
         */
        integrationSteps: number;
        /**
         * The integration method
         */
        integrator: string;
        /**
         * Number of collision resultion passes
         */
        collisionPasses: number;
        /**
         * Broadphase strategy for identifying potential collision contacts
         */
        broadphaseStrategy: BroadphaseStrategy;
        /**
         * Collision resolution strategy for handling collision contacts
         */
        collisionResolutionStrategy: CollisionResolutionStrategy;
        /**
         * Bias motion calculation towards the current frame, or the last frame
         */
        motionBias: number;
        /**
         * Allow rotation in the physics simulation
         */
        allowRotation: boolean;
    }
}
declare module ex {
    /**
     * Possible collision resolution strategies
     *
     * The default is [[CollisionResolutionStrategy.Box]] which performs simple axis aligned arcade style physcs.
     *
     * More advanced rigid body physics are enabled by setting [[CollisionResolutionStrategy.RigidBody]] which allows for complicated
     * simulated physical interactions.
     */
    enum CollisionResolutionStrategy {
        Box = 0,
        RigidBody = 1,
    }
    /**
     * Possible broadphase collision pair identification strategies
     *
     * The default strategy is [[BroadphaseStrategy.DynamicAABBTree]] which uses a binary tree of axis-aligned bounding boxes to identify
     * potential collision pairs which is O(nlog(n)) faster. The other possible strategy is the [[BroadphaseStrategy.Naive]] strategy
     * which loops over every object for every object in the scene to identify collision pairs which is O(n^2) slower.
     */
    enum BroadphaseStrategy {
        Naive = 0,
        DynamicAABBTree = 1,
    }
    /**
     * Possible numerical integrators for position and velocity
     */
    enum Integrator {
        Euler = 0,
    }
    /**
     *
     * Excalibur Physics
     *
     * The [[Physics]] object is the global configuration object for all Excalibur physics.
     *
     * Excalibur comes built in with two physics systems. The first system is [[CollisionResolutionStrategy.Box|Box physics]], and is a
     * simple axis-aligned way of doing basic collision detection for non-rotated rectangular areas, defined by an actor's
     * [[BoundingBox|bounding box]].
     *
     * ## Enabling Excalibur physics
     *
     * To enable physics in your game it is as simple as setting [[Physics.enabled]] to true and picking your
     * [[CollisionResolutionStrategy]]
     *
     * Excalibur supports 3 different types of collision area shapes in its physics simulation: [[PolygonArea|polygons]],
     * [[CircleArea|circles]], and [[EdgeArea|edges]]. To use any one of these areas on an actor there are convenience methods off of
     * the [[Actor|actor]] [[Body|physics body]]: [[Body.useBoxCollision|useBoxCollision]],
     * [[Body.usePolygonCollision|usePolygonCollision]], [[Body.useCircleCollision|useCircleCollision]], and [[Body.useEdgeCollision]]
     *
     * ```ts
     * // setup game
     * var game = new ex.Engine({
     *     width: 600,
     *     height: 400
     *  });
     *
     * // use rigid body
     * ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;
     *
     * // set global acceleration simulating gravity pointing down
     * ex.Physics.acc.setTo(0, 700);
     *
     * var block = new ex.Actor(300, 0, 20, 20, ex.Color.Blue.clone());
     * block.body.useBoxCollision(); // useBoxCollision is the default, technically optional
     * game.add(block);
     *
     * var circle = new ex.Actor(300, 100, 20, 20, ex.Color.Red.clone());
     * circle.body.useCircleCollision(10);
     * game.add(circle);
     *
     * var ground = new ex.Actor(300, 380, 600, 10, ex.Color.Black.clone());
     * ground.collisionType = ex.CollisionType.Fixed;
     * edge.body.useBoxCollision(); // optional
     * game.add(ground);
     *
     * // start the game
     * game.start();
     * ```
     *
     * ## Limitations
     *
     * Currently Excalibur only supports single contact point collisions and non-sleeping physics bodies. This has some negative stability
     * and performance implications. Single contact point collisions can have odd oscilating behavior. Non-sleeping bodies will recalculate
     * collisions whether they need to or not. We fully intend to add these features into Excalibur in future releases.
     *
     */
    class Physics {
        /**
         * Global acceleration that is applied to all vanilla actors (it wont effect [[Label|labels]], [[UIActor|ui actors]], or
         * [[Trigger|triggers]] in Excalibur that have an [[CollisionType.Active|active]] collison type).
         *
         *
         * This is a great way to globally simulate effects like gravity.
         */
        static acc: Vector;
        /**
         * Globally switches all Excalibur physics behavior on or off.
         */
        static enabled: boolean;
        /**
         * Gets or sets the number of collision passes for Excalibur to perform on physics bodies.
         *
         * Reducing collision passes may cause things not to collide as expected in your game, but may increase performance.
         *
         * More passes can improve the visual quality of collisions when many objects are on the screen. This can reduce jitter, improve the
         * collison resolution of fast move objects, or the stability of large numbers of objects stacked together.
         *
         * Fewer passes will improve the performance of the game at the cost of collision quality, more passes will improve quality at the
         * cost of performance.
         *
         * The default is set to 5 passes which is a good start.
         */
        static collisionPasses: number;
        /**
         * Gets or sets the broadphase pair identification strategy.
         *
         * The default strategy is [[BroadphaseStrategy.DynamicAABBTree]] which uses a binary tree of axis-aligned bounding boxes to identify
         * potential collision pairs which is O(nlog(n)) faster. The other possible strategy is the [[BroadphaseStrategy.Naive]] strategy
         * which loops over every object for every object in the scene to identify collision pairs which is O(n^2) slower.
         */
        static broadphaseStrategy: BroadphaseStrategy;
        /**
         * Globally switches the debug information for the broadphase strategy
         */
        static broadphaseDebug: boolean;
        /**
         * Show the normals as a result of collision on the screen.
         */
        static showCollisionNormals: boolean;
        /**
         * Show the position, velocity, and acceleration as graphical vectors.
         */
        static showMotionVectors: boolean;
        /**
         * Show the axis-aligned bounding boxes of the collision bodies on the screen.
         */
        static showBounds: boolean;
        /**
         * Show the bounding collision area shapes
         */
        static showArea: boolean;
        /**
         * Show points of collision interpreted by excalibur as a result of collision.
         */
        static showContacts: boolean;
        /**
         * Show the surface normals of the collision areas.
         */
        static showNormals: boolean;
        /**
         * Gets or sets the global collision resolution strategy (narrowphase).
         *
         * The default is [[CollisionResolutionStrategy.Box]] which performs simple axis aligned arcade style physics.
         *
         * More advanced rigid body physics are enabled by setting [[CollisionResolutionStrategy.RigidBody]] which allows for complicated
         * simulated physical interactions.
         */
        static collisionResolutionStrategy: CollisionResolutionStrategy;
        /**
         * The default mass to use if none is specified
         */
        static defaultMass: number;
        /**
         * Gets or sets the position and velocity positional integrator, currently only Euler is supported.
         */
        static integrator: Integrator;
        /**
         * Number of steps to use in integration. A higher number improves the positional accuracy over time. This can be useful to increase
         * if you have fast moving objects in your simulation or you have a large number of objects and need to increase stability.
         */
        static integrationSteps: number;
        /**
         * Gets or sets whether rotation is allowed in a RigidBody collision resolution
         */
        static allowRigidBodyRotation: boolean;
        /**
         * Configures Excalibur to use box physics. Box physics which performs simple axis aligned arcade style physics.
         */
        static useBoxPhysics(): void;
        /**
         * Configures Excalibur to use rigid body physics. Rigid body physics allows for complicated
         * simulated physical interactions.
         */
        static useRigidBodyPhysics(): void;
        /**
         * Small value to help collision passes settle themselves after the narrowphase.
         */
        static collisionShift: number;
    }
}
declare module ex {
    /**
     * Collision contacts are used internally by Excalibur to resolve collision between actors. This
     * Pair prevents collisions from being evaluated more than one time
     */
    class CollisionContact {
        /**
         * The id of this collision contact
         */
        id: string;
        /**
         * The first rigid body in the collision
         */
        bodyA: ICollisionArea;
        /**
         * The second rigid body in the collision
         */
        bodyB: ICollisionArea;
        /**
         * The minimum translation vector to resolve penetration, pointing away from bodyA
         */
        mtv: Vector;
        /**
         * The point of collision shared between bodyA and bodyB
         */
        point: Vector;
        /**
         * The collision normal, pointing away from bodyA
         */
        normal: Vector;
        constructor(bodyA: ICollisionArea, bodyB: ICollisionArea, mtv: Vector, point: Vector, normal: Vector);
        resolve(delta: number, strategy: CollisionResolutionStrategy): void;
        private _applyBoxImpluse(bodyA, bodyB, mtv, side);
        private _resolveBoxCollision(delta);
        private _resolveRigidBodyCollision(delta);
    }
}
declare module ex {
    interface IDebugFlags {
    }
}
declare module ex {
    /**
     * A collision area is a region of space that can detect when other collision areas intersect
     * for the purposes of colliding 2 objects in excalibur.
     */
    interface ICollisionArea {
        /**
         * Position of the collision area relative to the actor if it exists
         */
        pos: Vector;
        /**
         * Reference to the actor associated with this collision area
         */
        body: Body;
        /**
         * The center point of the collision area, for example if the area is a circle it would be the center.
         */
        getCenter(): Vector;
        /**
         * Find the furthest point on the convex hull of this particular area in a certain direction.
         */
        getFurthestPoint(direction: Vector): Vector;
        /**
         * Return the axis-aligned bounding box of the collision area
         */
        getBounds(): BoundingBox;
        /**
         * Return the axes of this particular shape
         */
        getAxes(): Vector[];
        /**
         * Return the calculated moment of intertia for this area
         */
        getMomentOfInertia(): number;
        collide(area: ICollisionArea): CollisionContact;
        /**
         * Return wether the area contains a point inclusive to it's border
         */
        contains(point: Vector): boolean;
        /**
         * Return the point on the border of the collision area that intersects with a ray (if any).
         */
        castRay(ray: Ray): Vector;
        /**
         * Create a projection of this area along an axis. Think of this as casting a "shadow" along an axis
         */
        project(axis: Vector): Projection;
        /**
         * Recalculates internal caches and values
         */
        recalc(): void;
        debugDraw(ctx: CanvasRenderingContext2D, color: Color): any;
    }
}
declare module ex {
    var CollisionJumpTable: {
        CollideCircleCircle(circleA: CircleArea, circleB: CircleArea): CollisionContact;
        CollideCirclePolygon(circle: CircleArea, polygon: PolygonArea): CollisionContact;
        CollideCircleEdge(circle: CircleArea, edge: EdgeArea): CollisionContact;
        CollideEdgeEdge(edgeA: EdgeArea, edgeB: EdgeArea): CollisionContact;
        CollidePolygonEdge(polygon: PolygonArea, edge: EdgeArea): CollisionContact;
        CollidePolygonPolygon(polyA: PolygonArea, polyB: PolygonArea): CollisionContact;
    };
}
declare module ex {
    interface ICircleAreaOptions {
        pos?: Vector;
        radius?: number;
        body?: Body;
    }
    /**
     * This is a circle collision area for the excalibur rigid body physics simulation
     */
    class CircleArea implements ICollisionArea {
        /**
         * This is the center position of the circle, relative to the body position
         */
        pos: Vector;
        /**
         * This is the radius of the circle
         */
        radius: number;
        /**
         * The actor associated with this collision area
         */
        body: Body;
        constructor(options: ICircleAreaOptions);
        /**
         * Get the center of the collision area in world coordinates
         */
        getCenter(): Vector;
        /**
         * Tests if a point is contained in this collision area
         */
        contains(point: Vector): boolean;
        /**
         * Casts a ray at the CircleArea and returns the nearest point of collision
         * @param ray
         */
        castRay(ray: Ray): Vector;
        collide(area: ICollisionArea): CollisionContact;
        /**
         * Find the point on the shape furthest in the direction specified
         */
        getFurthestPoint(direction: Vector): Vector;
        /**
         * Get the axis aligned bounding box for the circle area
         */
        getBounds(): BoundingBox;
        /**
         * Get axis not implemented on circles, since their are infinite axis
         */
        getAxes(): Vector[];
        /**
         * Returns the moment of intertia of a circle given it's mass
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         * @param mass
         */
        getMomentOfInertia(): number;
        testSeparatingAxisTheorem(polygon: PolygonArea): Vector;
        recalc(): void;
        /**
         * Project the circle along a specified axis
         */
        project(axis: Vector): Projection;
        debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
    }
}
declare module ex {
    interface IEdgeAreaOptions {
        begin?: Vector;
        end?: Vector;
        body?: Body;
    }
    class EdgeArea implements ICollisionArea {
        body: Body;
        pos: Vector;
        begin: Vector;
        end: Vector;
        constructor(options: IEdgeAreaOptions);
        /**
         * Get the center of the collision area in world coordinates
         */
        getCenter(): Vector;
        private _getBodyPos();
        private _getTransformedBegin();
        private _getTransformedEnd();
        /**
         * Returns the slope of the line in the form of a vector
         */
        getSlope(): Vector;
        /**
         * Returns the length of the line segment in pixels
         */
        getLength(): number;
        /**
         * Tests if a point is contained in this collision area
         */
        contains(point: Vector): boolean;
        castRay(ray: Ray): Vector;
        collide(area: ICollisionArea): CollisionContact;
        /**
         * Find the point on the shape furthest in the direction specified
         */
        getFurthestPoint(direction: Vector): Vector;
        /**
         * Get the axis aligned bounding box for the circle area
         */
        getBounds(): BoundingBox;
        /**
         * Get the axis associated with the edge
         */
        getAxes(): Vector[];
        /**
         * Get the momemnt of inertia for an edge
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        getMomentOfInertia(): number;
        recalc(): void;
        /**
         * Project the edge along a specified axis
         */
        project(axis: Vector): Projection;
        debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
    }
}
declare module ex {
    interface IPolygonAreaOptions {
        pos?: Vector;
        points?: Vector[];
        clockwiseWinding?: boolean;
        body?: Body;
    }
    /**
     * Polygon collision area for detecting collisions for actors, or independently
     */
    class PolygonArea implements ICollisionArea {
        pos: Vector;
        points: Vector[];
        body: Body;
        private _transformedPoints;
        private _axes;
        private _sides;
        constructor(options: IPolygonAreaOptions);
        /**
         * Get the center of the collision area in world coordinates
         */
        getCenter(): Vector;
        /**
         * Calculates the underlying transformation from the body relative space to world space
         */
        private _calculateTransformation();
        /**
         * Gets the points that make up the polygon in world space, from actor relative space (if specified)
         */
        getTransformedPoints(): Vector[];
        /**
         * Gets the sides of the polygon in world space
         */
        getSides(): Line[];
        recalc(): void;
        /**
         * Tests if a point is contained in this collision area in world space
         */
        contains(point: Vector): boolean;
        /**
         * Returns a collision contact if the 2 collision areas collide, otherwise collide will
         * return null.
         * @param area
         */
        collide(area: ICollisionArea): CollisionContact;
        /**
         * Find the point on the shape furthest in the direction specified
         */
        getFurthestPoint(direction: Vector): Vector;
        /**
         * Get the axis aligned bounding box for the polygon area
         */
        getBounds(): BoundingBox;
        /**
         * Get the moment of inertia for an arbitrary polygon
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        getMomentOfInertia(): number;
        /**
         * Casts a ray into the polygon and returns a vector representing the point of contact (in world space) or null if no collision.
         */
        castRay(ray: Ray): Vector;
        /**
         * Get the axis associated with the edge
         */
        getAxes(): Vector[];
        /**
         * Perform Separating Axis test against another polygon, returns null if no overlap in polys
         * Reference http://www.dyn4j.org/2010/01/sat/
         */
        testSeparatingAxisTheorem(other: PolygonArea): Vector;
        /**
         * Project the edges of the polygon along a specified axis
         */
        project(axis: Vector): Projection;
        debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
    }
}
declare module ex {
    interface IEvented {
        /**
         * Emits an event for target
         * @param eventName  The name of the event to publish
         * @param event      Optionally pass an event data object to the handler
         */
        emit(eventName: string, event?: GameEvent): any;
        /**
         * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
         * @param eventName  The name of the event to subscribe to
         * @param handler    The handler callback to fire on this event
         */
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        /**
         * Unsubscribe an event handler(s) from an event. If a specific handler
         * is specified for an event, only that handler will be unsubscribed.
         * Otherwise all handlers will be unsubscribed for that event.
         *
         * @param eventName  The name of the event to unsubscribe
         * @param handler    Optionally the specific handler to unsubscribe
         *
         */
        off(eventName: string, handler: (event?: GameEvent) => void): any;
    }
}
declare module ex {
    /**
     * An interface describing actor update pipeline traits
     */
    interface IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex.Traits {
    class EulerMovement implements IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex {
    class CullingBox {
        private _topLeft;
        private _topRight;
        private _bottomLeft;
        private _bottomRight;
        private _xCoords;
        private _yCoords;
        private _xMin;
        private _yMin;
        private _xMax;
        private _yMax;
        private _xMinWorld;
        private _yMinWorld;
        private _xMaxWorld;
        private _yMaxWorld;
        isSpriteOffScreen(actor: Actor, engine: Engine): boolean;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex.Traits {
    class OffscreenCulling implements IActorTrait {
        cullingBox: ex.CullingBox;
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex.Traits {
    interface ICapturePointerConfig {
        /**
         * Capture PointerMove events (may be expensive!)
         */
        captureMoveEvents: boolean;
    }
    /**
     * Propogates pointer events to the actor
     */
    class CapturePointer implements IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex.Traits {
    class TileMapCollisionDetection implements IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex {
    /**
     * An enum that describes the sides of an Actor for collision
     */
    enum Side {
        None = 0,
        Top = 1,
        Bottom = 2,
        Left = 3,
        Right = 4,
    }
}
/**
 * Utilities
 *
 * Excalibur utilities for math, string manipulation, etc.
 */
declare module ex.Util {
    const TwoPI: number;
    /**
     * Merges one or more objects into a single target object
     *
     * @param deep Whether or not to do a deep clone
     * @param target The target object to attach properties on
     * @param objects The objects whose properties to merge
     * @returns Merged object with properties from other objects
     */
    function extend(deep: boolean, target: any, ...objects: any[]): any;
    /**
     * Merges one or more objects into a single target object
     *
     * @param target The target object to attach properties on
     * @param objects The objects whose properties to merge
     * @returns Merged object with properties from other objects
     */
    function extend(target: any, ...objects: any[]): any;
    function base64Encode(inputStr: string): string;
    function clamp(val: any, min: any, max: any): any;
    function randomInRange(min: number, max: number): number;
    function randomIntInRange(min: number, max: number): number;
    function canonicalizeAngle(angle: number): number;
    function toDegrees(radians: number): number;
    function toRadians(degrees: number): number;
    function getPosition(el: HTMLElement): Vector;
    function addItemToArray<T>(item: T, array: T[]): boolean;
    function removeItemToArray<T>(item: T, array: T[]): boolean;
    function contains(array: Array<any>, obj: any): boolean;
    function getOppositeSide(side: ex.Side): Side;
    function getSideFromVector(direction: Vector): Side;
    /**
     * Excaliburs dynamically resizing collection
     */
    class Collection<T> {
        /**
         * Default collection size
         */
        static DefaultSize: number;
        private _internalArray;
        private _endPointer;
        /**
         * @param initialSize  Initial size of the internal backing array
         */
        constructor(initialSize?: number);
        private _resize();
        /**
         * Push elements to the end of the collection
         */
        push(element: T): T;
        /**
         * Removes elements from the end of the collection
         */
        pop(): T;
        /**
         * Returns the count of the collection
         */
        count(): number;
        /**
         * Empties the collection
         */
        clear(): void;
        /**
         * Returns the size of the internal backing array
         */
        internalSize(): number;
        /**
         * Returns an element at a specific index
         * @param index  Index of element to retreive
         */
        elementAt(index: number): T;
        /**
         * Inserts an element at a specific index
         * @param index  Index to insert the element
         */
        insert(index: number, value: T): T;
        /**
         * Removes an element at a specific index
         * @param index  Index of element to remove
         */
        remove(index: number): T;
        /**
         * Removes an element by reference
         * @param element  Element to retreive
         */
        removeElement(element: T): void;
        /**
         * Returns a array representing the collection
         */
        toArray(): T[];
        /**
         * Iterate over every element in the collection
         * @param func  Callback to call for each element passing a reference to the element and its index, returned values are ignored
         */
        forEach(func: (element: T, index: number) => any): void;
        /**
         * Mutate every element in the collection
         * @param func  Callback to call for each element passing a reference to the element and its index, any values returned mutate
         * the collection
         */
        map(func: (element: T, index: number) => any): void;
    }
}
declare module ex {
    /**
     * Sprites
     *
     * A [[Sprite]] is one of the main drawing primitives. It is responsible for drawing
     * images or parts of images from a [[Texture]] resource to the screen.
     *
     * ## Creating a sprite
     *
     * To create a [[Sprite]] you need to have a loaded [[Texture]] resource. You can
     * then use [[Texture.asSprite]] to quickly create a [[Sprite]] or you can create
     * a new instance of [[Sprite]] using the constructor. This is useful if you
     * want to "slice" out a portion of an image or if you want to change the dimensions.
     *
     * ```js
     * var game = new ex.Engine();
     * var txPlayer = new ex.Texture("/assets/tx/player.png");
     *
     * // load assets
     * var loader = new ex.Loader(txPlayer);
     *
     * // start game
     * game.start(loader).then(function () {
     *
     *   // create a sprite (quick)
     *   var playerSprite = txPlayer.asSprite();
     *
     *   // create a sprite (custom)
     *   var playerSprite = new ex.Sprite(txPlayer, 0, 0, 80, 80);
     *
     * });
     * ```
     *
     * You can then assign an [[Actor]] a sprite through [[Actor.addDrawing]] and
     * [[Actor.setDrawing]].
     *
     * ## Sprite Effects
     *
     * Excalibur offers many sprite effects such as [[Effects.Colorize]] to let you manipulate
     * sprites. Keep in mind, more effects requires more power and can lead to memory or CPU
     * constraints and hurt performance. Each effect must be reprocessed every frame for each sprite.
     *
     * It's still recommended to create an [[Animation]] or build in your effects to the sprites
     * for optimal performance.
     *
     * There are a number of convenience methods available to perform sprite effects. Sprite effects are
     * side-effecting.
     *
     * ```typescript
     *
     * var playerSprite = new ex.Sprite(txPlayer, 0, 0, 80, 80);
     *
     * // darken a sprite by a percentage
     * playerSprite.darken(.2); // 20%
     *
     * // lighten a sprite by a percentage
     * playerSprite.lighten(.2); // 20%
     *
     * // saturate a sprite by a percentage
     * playerSprite.saturate(.2); // 20%
     *
     * // implement a custom effect
     * class CustomEffect implements ex.EffectsISpriteEffect {
     *
     *   updatePixel(x: number, y: number, imageData: ImageData) {
     *       // modify ImageData
     *   }
     * }
     *
     * playerSprite.addEffect(new CustomEffect());
     *
     * ```
     */
    class Sprite implements IDrawable {
        sx: number;
        sy: number;
        swidth: number;
        sheight: number;
        private _texture;
        rotation: number;
        anchor: Vector;
        scale: Vector;
        logger: Logger;
        /**
         * Draws the sprite flipped vertically
         */
        flipVertical: boolean;
        /**
         * Draws the sprite flipped horizontally
         */
        flipHorizontal: boolean;
        width: number;
        height: number;
        effects: Effects.ISpriteEffect[];
        internalImage: HTMLImageElement;
        naturalWidth: number;
        naturalHeight: number;
        private _spriteCanvas;
        private _spriteCtx;
        private _pixelData;
        private _pixelsLoaded;
        private _dirtyEffect;
        /**
         * @param image   The backing image texture to build the Sprite
         * @param sx      The x position of the sprite
         * @param sy      The y position of the sprite
         * @param swidth  The width of the sprite in pixels
         * @param sheight The height of the sprite in pixels
         */
        constructor(image: Texture, sx: number, sy: number, swidth: number, sheight: number);
        private _loadPixels();
        /**
         * Applies the [[Effects.Opacity]] to a sprite, setting the alpha of all pixels to a given value
         */
        opacity(value: number): void;
        /**
         * Applies the [[Effects.Grayscale]] to a sprite, removing color information.
         */
        grayscale(): void;
        /**
         * Applies the [[Effects.Invert]] to a sprite, inverting the pixel colors.
         */
        invert(): void;
        /**
         * Applies the [[Effects.Fill]] to a sprite, changing the color channels of all non-transparent pixels to match a given color
         */
        fill(color: Color): void;
        /**
         * Applies the [[Effects.Colorize]] to a sprite, changing the color channels of all pixesl to be the average of the original color
         * and the provided color.
         */
        colorize(color: Color): void;
        /**
         * Applies the [[Effects.Lighten]] to a sprite, changes the lightness of the color according to HSL
         */
        lighten(factor?: number): void;
        /**
         * Applies the [[Effects.Darken]] to a sprite, changes the darkness of the color according to HSL
         */
        darken(factor?: number): void;
        /**
         * Applies the [[Effects.Saturate]] to a sprite, saturates the color acccording to HSL
         */
        saturate(factor?: number): void;
        /**
         * Applies the [[Effects.Desaturate]] to a sprite, desaturates the color acccording to HSL
         */
        desaturate(factor?: number): void;
        /**
         * Adds a new [[Effects.ISpriteEffect]] to this drawing.
         * @param effect  Effect to add to the this drawing
         */
        addEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes a [[Effects.ISpriteEffect]] from this sprite.
         * @param effect  Effect to remove from this sprite
         */
        removeEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes an effect given the index from this sprite.
         * @param index  Index of the effect to remove from this sprite
         */
        removeEffect(index: number): void;
        private _applyEffects();
        /**
         * Clears all effects from the drawing and return it to its original state.
         */
        clearEffects(): void;
        /**
         * Resets the internal state of the drawing (if any)
         */
        reset(): void;
        debugDraw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        /**
         * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
         * @param ctx  The 2D rendering context
         * @param x    The x coordinate of where to draw
         * @param y    The y coordinate of where to draw
         */
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        /**
         * Produces a copy of the current sprite
         */
        clone(): Sprite;
    }
}
declare module ex {
    /**
     * Sprite Sheets
     *
     * Sprite sheets are a useful mechanism for slicing up image resources into
     * separate sprites or for generating in game animations. [[Sprite|Sprites]] are organized
     * in row major order in the [[SpriteSheet]].
     *
     * You can also use a [[SpriteFont]] which is special kind of [[SpriteSheet]] for use
     * with [[Label|Labels]].
     *
     * ## Creating a SpriteSheet
     *
     * To create a [[SpriteSheet]] you need a loaded [[Texture]] resource.
     *
     * ```js
     * var game = new ex.Engine();
     * var txAnimPlayerIdle = new ex.Texture("/assets/tx/anim-player-idle.png");
     *
     * // load assets
     * var loader = new ex.Loader(txAnimPlayerIdle);
     *
     * // start game
     * game.start(loader).then(function () {
     *   var player = new ex.Actor();
     *
     *   // create sprite sheet with 5 columns, 1 row, 80x80 frames
     *   var playerIdleSheet = new ex.SpriteSheet(txAnimPlayerIdle, 5, 1, 80, 80);
     *
     *   // create animation (125ms frame speed)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(game, 125);
     *
     *   // add drawing to player as "idle"
     *   player.addDrawing("idle", playerIdleAnimation);
     *
     *   // add player to game
     *   game.add(player);
     * });
     * ```
     *
     * ## Creating animations
     *
     * [[SpriteSheets]] provide a quick way to generate a new [[Animation]] instance.
     * You can use *all* the frames of a [[Texture]] ([[SpriteSheet.getAnimationForAll]])
     * or you can use a range of frames ([[SpriteSheet.getAnimationBetween]]) or you
     * can use specific frames ([[SpriteSheet.getAnimationByIndices]]).
     *
     * To create an [[Animation]] these methods must be passed an instance of [[Engine]].
     * It's recommended to generate animations for an [[Actor]] in their [[Actor.onInitialize]]
     * event because the [[Engine]] is passed to the initialization function. However, if your
     * [[Engine]] instance is in the global scope, you can create an [[Animation]] at any time
     * provided the [[Texture]] has been [[Loader|loaded]].
     *
     * ```js
     *   // create sprite sheet with 5 columns, 1 row, 80x80 frames
     *   var playerIdleSheet = new ex.SpriteSheet(txAnimPlayerIdle, 5, 1, 80, 80);
     *
     *   // create animation for all frames (125ms frame speed)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(game, 125);
     *
     *   // create animation for a range of frames (2-4) (125ms frame speed)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationBetween(game, 1, 3, 125);
     *
     *   // create animation for specific frames 2, 4, 5 (125ms frame speed)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationByIndices(game, [1, 3, 4], 125);
     *
     *   // create a repeating animation (ping-pong)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationByIndices(game, [1, 3, 4, 3, 1], 125);
     * ```
     *
     * ## Multiple rows
     *
     * Sheets are organized in "row major order" which means left-to-right, top-to-bottom.
     * Indexes are zero-based, so while you might think to yourself the first column is
     * column "1", to the engine it is column "0". You can easily calculate an index
     * of a frame using this formula:
     *
     *     Given: col = 5, row = 3, columns = 10
     *
     *     index = col + row * columns
     *     index = 4 + 2 * 10 // zero-based, subtract 1 from col & row
     *     index = 24
     *
     * You can also simply count the frames of the image visually starting from the top left
     * and beginning with zero.
     *
     * ```js
     * // get a sprite for column 3, row 6
     * var sprite = animation.getSprite(2 + 5 * 10)
     * ```
     */
    class SpriteSheet {
        image: Texture;
        private columns;
        private rows;
        sprites: Sprite[];
        private _internalImage;
        /**
         * @param image     The backing image texture to build the SpriteSheet
         * @param columns   The number of columns in the image texture
         * @param rows      The number of rows in the image texture
         * @param spWidth   The width of each individual sprite in pixels
         * @param spHeight  The height of each individual sprite in pixels
         */
        constructor(image: Texture, columns: number, rows: number, spWidth: number, spHeight: number);
        /**
         * Create an animation from the this SpriteSheet by listing out the
         * sprite indices. Sprites are organized in row major order in the SpriteSheet.
         * @param engine   Reference to the current game [[Engine]]
         * @param indices  An array of sprite indices to use in the animation
         * @param speed    The number in milliseconds to display each frame in the animation
         */
        getAnimationByIndices(engine: Engine, indices: number[], speed: number): Animation;
        /**
         * Create an animation from the this SpriteSheet by specifing the range of
         * images with the beginning and ending index
         * @param engine      Reference to the current game Engine
         * @param beginIndex  The index to start taking frames
         * @param endIndex    The index to stop taking frames
         * @param speed       The number in milliseconds to display each frame in the animation
         */
        getAnimationBetween(engine: Engine, beginIndex: number, endIndex: number, speed: number): Animation;
        /**
         * Treat the entire SpriteSheet as one animation, organizing the frames in
         * row major order.
         * @param engine  Reference to the current game [[Engine]]
         * @param speed   The number in milliseconds to display each frame the animation
         */
        getAnimationForAll(engine: Engine, speed: number): Animation;
        /**
         * Retreive a specific sprite from the SpriteSheet by its index. Sprites are organized
         * in row major order in the SpriteSheet.
         * @param index  The index of the sprite
         */
        getSprite(index: number): Sprite;
    }
    /**
     * Sprite Fonts
     *
     * Sprite fonts are a used in conjunction with a [[Label]] to specify
     * a particular bitmap as a font. Note that some font features are not
     * supported by Sprite fonts.
     *
     * ## Generating the font sheet
     *
     * You can use tools such as [Bitmap Font Builder](http://www.lmnopc.com/bitmapfontbuilder/) to
     * generate a sprite sheet for you to load into Excalibur.
     *
     * ## Creating a sprite font
     *
     * Start with an image with a grid containing all the letters you want to support.
     * Once you load it into Excalibur using a [[Texture]] resource, you can create
     * a [[SpriteFont]] using the constructor.
     *
     * For example, here is a representation of a font sprite sheet for an uppercase alphabet
     * with 4 columns and 7 rows:
     *
     * ```
     * ABCD
     * EFGH
     * IJKL
     * MNOP
     * QRST
     * UVWX
     * YZ
     * ```
     *
     * Each letter is 30x30 and after Z is a blank one to represent a space.
     *
     * Then to create the [[SpriteFont]]:
     *
     * ```js
     * var game = new ex.Engine();
     * var txFont = new ex.Texture("/assets/tx/font.png");
     *
     * // load assets
     * var loader = new ex.Loader(txFont);
     *
     * // start game
     * game.start(loader).then(function () {
     *
     *   // create a font
     *   var font = new ex.SpriteFont(txFont, "ABCDEFGHIJKLMNOPQRSTUVWXYZ ", true, 4, 7, 30, 30);
     *
     *   // create a label using this font
     *   var label = new ex.Label("Hello World", 0, 0, null, font);
     *
     *   // display in-game
     *   game.add(label);
     *
     * });
     * ```
     *
     * If you want to use a lowercase representation in the font, you can pass `false` for [[caseInsensitive]]
     * and the matching will be case-sensitive. In our example, you would need another 7 rows of
     * lowercase characters.
     *
     * ## Font colors
     *
     * When using sprite fonts with a [[Label]], you can set the [[Label.color]] property
     * to use different colors.
     *
     * ## Known Issues
     *
     * **One font per Label**
     * [Issue #172](https://github.com/excaliburjs/Excalibur/issues/172)
     *
     * If you intend on changing colors or applying opacity effects, you have to use
     * a new [[SpriteFont]] instance per [[Label]].
     *
     * **Using opacity removes other effects**
     * [Issue #148](https://github.com/excaliburjs/Excalibur/issues/148)
     *
     * If you apply any custom effects to the sprites in a SpriteFont, including trying to
     * use [[Label.color]], they will be removed when modifying [[Label.opacity]].
     *
     */
    class SpriteFont extends SpriteSheet {
        image: Texture;
        private alphabet;
        private caseInsensitive;
        spWidth: number;
        spHeight: number;
        private _spriteLookup;
        private _colorLookup;
        private _currentColor;
        private _currentOpacity;
        private _sprites;
        private _textShadowOn;
        private _textShadowDirty;
        private _textShadowColor;
        private _textShadowSprites;
        private _shadowOffsetX;
        private _shadowOffsetY;
        /**
         * @param image           The backing image texture to build the SpriteFont
         * @param alphabet        A string representing all the characters in the image, in row major order.
         * @param caseInsensitve  Indicate whether this font takes case into account
         * @param columns         The number of columns of characters in the image
         * @param rows            The number of rows of characters in the image
         * @param spWdith         The width of each character in pixels
         * @param spHeight        The height of each character in pixels
         */
        constructor(image: Texture, alphabet: string, caseInsensitive: boolean, columns: number, rows: number, spWidth: number, spHeight: number);
        /**
         * Returns a dictionary that maps each character in the alphabet to the appropriate [[Sprite]].
         */
        getTextSprites(): {
            [key: string]: Sprite;
        };
        /**
         * Sets the text shadow for sprite fonts
         * @param offsetX      The x offset in pixels to place the shadow
         * @param offsetY      The y offset in pixles to place the shadow
         * @param shadowColor  The color of the text shadow
         */
        setTextShadow(offsetX: number, offsetY: number, shadowColor: Color): void;
        /**
         * Toggles text shadows on or off
         */
        useTextShadow(on: boolean): void;
        /**
         * Draws the current sprite font
         */
        draw(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, options: ISpriteFontOptions): void;
        private _parseOptions(options);
    }
    /**
     * Specify various font attributes for sprite fonts
     */
    interface ISpriteFontOptions {
        color?: Color;
        opacity?: number;
        fontSize?: number;
        letterSpacing?: number;
        textAlign?: TextAlign;
        baseAlign?: BaseAlign;
        maxWidth?: number;
    }
}
declare module ex {
    /**
     * Tile Maps
     *
     * The [[TileMap]] class provides a lightweight way to do large complex scenes with collision
     * without the overhead of actors.
     *
     * Tile maps are made up of [[Cell|Cells]] which can draw [[TileSprite|TileSprites]]. Tile
     * maps support multiple layers and work well for building tile-based games such as RPGs,
     * adventure games, strategy games, and others. Cells can be [[Cell.solid|solid]] so
     * that Actors can't pass through them.
     *
     * We recommend using the [Tiled map editor](http://www.mapeditor.org/) to build your maps
     * and export them to JSON. You can then load them using a [[Resource|Generic Resource]]
     * and process them to create your levels. A [[TileMap]] can then be used as part of a
     * level or map class that adds enemies and builds game objects from the Tiled map.
     *
     *
     * ## Creating a tile map
     *
     * A [[TileMap]] is meant to be used in conjuction with a map editor. Creating
     * a tile map is fairly straightforward.
     *
     * You need a tile sheet (see [[SpriteSheet]]) that holds all the available tiles to
     * draw. [[TileMap]] supports multiple sprite sheets, letting you organize tile sheets
     * to your liking.
     *
     * Next, you need to populate each [[Cell]] with one or more [[TileSprite|TileSprites]]
     * using [[Cell.pushSprite]].
     * Once the [[TileMap]] is added to a [[Scene]], it will be drawn and updated.
     *
     * You can then add [[Actor|Actors]] to the [[Scene]] and interact with the [[TileMap]].
     *
     * In this example, we take in a map configuration that we designed (for example,
     * based on the exported structure of a JSON file).
     *
     * ```ts
     *
     * // define TypeScript interfaces to make our life easier
     *
     * public interface IMapDefinition {
     *   cells: IMapCellDefinition[];
     *   tileSheets: IMapTileSheet[];
     *   width: number;
     *   height: number;
     *   tileWidth: number;
     *   tileHeight: number;
     * }
     *
     * public interface IMapCellDefinition {
     *   x: number;
     *   y: number;
     *   tileId: number;
     *   sheetId: number;
     * }
     *
     * public interface IMapTileSheet {
     *   id: number;
     *   path: string;
     *   columns: number;
     *   rows: number;
     * }
     *
     * // create a Map class that creates a game map
     * // based on JSON configuration
     *
     * public class Map extends ex.Scene {
     *
     *   private _mapDefinition: IMapDefinition;
     *   private _tileMap: ex.TileMap;
     *
     *   constructor(mapDef: IMapDefinition) {
     *
     *     // store reference to definition
     *     this._mapDefinition = mapDef;
     *
     *     // create a tile map
     *     this._tileMap = new ex.TileMap(0, 0, mapDef.tileWidth, mapDef.tileHeight,
     *       mapDef.width / mapDef.tileWidth, mapDef.height / mapDef.tileHeight);
     *   }
     *
     *   public onInitialize() {
     *     // build our map based on JSON config
     *
     *     // build sprite sheets
     *     this._mapDefinition.tileSheets.forEach(sheet => {
     *
     *       // register sprite sheet with the tile map
     *       // normally, you will want to ensure you load the Texture before
     *       // creating the SpriteSheet
     *       // this can be done outside the Map class, in a Loader
     *       this._tileMap.registerSpriteSheet(sheet.id.toString(),
     *         new ex.SpriteSheet(new ex.Texture(sheet.path), sheet.columns, sheet.rows,
     *           this._mapDefinition.tileWidth, this._mapDefinition.tileHeight));
     *
     *     });
     *
     *     // fill cells with sprites
     *     this._mapDefinition.cells.forEach(cell => {
     *
     *       // create a TileSprite
     *       // assume tileId is the index of the frame in the sprite sheet
     *       var ts = new ex.TileSprite(cell.sheetId.toString(), cell.spriteId);
     *
     *       // add to cell
     *       this._tileMap.getCell(cell.x, cell.y).pushSprite(ts);
     *     }
     *   }
     * }
     *
     * // create a game
     * var game = new ex.Engine();
     *
     * // add our level (JSON from external source)
     * var map1 = new Map({ ... });
     *
     * game.add("map1", map1);
     *
     * game.start();
     * ```
     *
     * In a real game, you will want to ensure all the textures for the sprite sheets
     * have been loaded. You could do this in the [[Resource.processDownload]] function
     * of the generic resource when loading your JSON, before creating your `Map` object.
     *
     * ## Off-screen culling
     *
     * The [[TileMap]] takes care of only drawing the portion of the map that is on-screen.
     * This significantly improves performance and essentially means Excalibur can support
     * huge maps. Since Actors off-screen are not drawn, this also means maps can support
     * many actors.
     *
     * ## Collision checks
     *
     * You can use [[TileMap.collides]] to check if a given [[Actor]] is colliding with a
     * solid [[Cell]]. This method returns an intersection [[Vector]] that represents
     * the smallest overlap with colliding cells.
     */
    class TileMap {
        x: number;
        y: number;
        cellWidth: number;
        cellHeight: number;
        rows: number;
        cols: number;
        private _collidingX;
        private _collidingY;
        private _onScreenXStart;
        private _onScreenXEnd;
        private _onScreenYStart;
        private _onScreenYEnd;
        private _spriteSheets;
        logger: Logger;
        data: Cell[];
        /**
         * @param x             The x coordinate to anchor the TileMap's upper left corner (should not be changed once set)
         * @param y             The y coordinate to anchor the TileMap's upper left corner (should not be changed once set)
         * @param cellWidth     The individual width of each cell (in pixels) (should not be changed once set)
         * @param cellHeight    The individual height of each cell (in pixels) (should not be changed once set)
         * @param rows          The number of rows in the TileMap (should not be changed once set)
         * @param cols          The number of cols in the TileMap (should not be changed once set)
         * @param spriteSheet   The spriteSheet to use for drawing
         */
        constructor(x: number, y: number, cellWidth: number, cellHeight: number, rows: number, cols: number);
        registerSpriteSheet(key: string, spriteSheet: SpriteSheet): void;
        /**
         * Returns the intersection vector that can be used to resolve collisions with actors. If there
         * is no collision null is returned.
         */
        collides(actor: Actor): Vector;
        /**
         * Returns the [[Cell]] by index (row major order)
         */
        getCellByIndex(index: number): Cell;
        /**
         * Returns the [[Cell]] by its x and y coordinates
         */
        getCell(x: number, y: number): Cell;
        /**
         * Returns the [[Cell]] by testing a point in global coordinates,
         * returns `null` if no cell was found.
         */
        getCellByPoint(x: number, y: number): Cell;
        update(engine: Engine, delta: number): void;
        /**
         * Draws the tile map to the screen. Called by the [[Scene]].
         * @param ctx    The current rendering context
         * @param delta  The number of milliseconds since the last draw
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Draws all the tile map's debug info. Called by the [[Scene]].
         * @param ctx  The current rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * Tile sprites are used to render a specific sprite from a [[TileMap]]'s spritesheet(s)
     */
    class TileSprite {
        spriteSheetKey: string;
        spriteId: number;
        /**
         * @param spriteSheetKey  The key of the spritesheet to use
         * @param spriteId        The index of the sprite in the [[SpriteSheet]]
         */
        constructor(spriteSheetKey: string, spriteId: number);
    }
    /**
     * TileMap Cell
     *
     * A light-weight object that occupies a space in a collision map. Generally
     * created by a [[TileMap]].
     *
     * Cells can draw multiple sprites. Note that the order of drawing is the order
     * of the sprites in the array so the last one will be drawn on top. You can
     * use transparency to create layers this way.
     */
    class Cell {
        x: number;
        y: number;
        width: number;
        height: number;
        index: number;
        solid: boolean;
        sprites: TileSprite[];
        private _bounds;
        /**
         * @param x       Gets or sets x coordinate of the cell in world coordinates
         * @param y       Gets or sets y coordinate of the cell in world coordinates
         * @param width   Gets or sets the width of the cell
         * @param height  Gets or sets the height of the cell
         * @param index   The index of the cell in row major order
         * @param solid   Gets or sets whether this cell is solid
         * @param sprites The list of tile sprites to use to draw in this cell (in order)
         */
        constructor(x: number, y: number, width: number, height: number, index: number, solid?: boolean, sprites?: TileSprite[]);
        /**
         * Returns the bounding box for this cell
         */
        getBounds(): BoundingBox;
        /**
         * Gets the center coordinate of this cell
         */
        getCenter(): Vector;
        /**
         * Add another [[TileSprite]] to this cell
         */
        pushSprite(tileSprite: TileSprite): void;
        /**
         * Remove an instance of [[TileSprite]] from this cell
         */
        removeSprite(tileSprite: TileSprite): void;
        /**
         * Clear all sprites from this cell
         */
        clearSprites(): void;
    }
}
declare module ex {
    /**
     * Interface all collidable objects must implement
     */
    interface ICollidable {
        /**
         * Test whether this bounding box collides with another one.
         *
         * @param collidable  Other collidable to test
         * @returns Vector The intersection vector that can be used to resolve the collision.
         * If there is no collision, `null` is returned.
         */
        collides(collidable: ICollidable): Vector;
        /**
         * Tests wether a point is contained within the collidable
         * @param point  The point to test
         */
        contains(point: Vector): boolean;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * Axis Aligned collision primitive for Excalibur.
     */
    class BoundingBox implements ICollidable {
        left: number;
        top: number;
        right: number;
        bottom: number;
        /**
         * @param left    x coordinate of the left edge
         * @param top     y coordinate of the top edge
         * @param right   x coordinate of the right edge
         * @param bottom  y coordinate of the bottom edge
         */
        constructor(left?: number, top?: number, right?: number, bottom?: number);
        /**
         * Returns the calculated width of the bounding box
         */
        getWidth(): number;
        /**
         * Returns the calculated height of the bounding box
         */
        getHeight(): number;
        /**
         * Returns the perimeter of the bounding box
         */
        getPerimeter(): number;
        getPoints(): Vector[];
        /**
         * Creates a Polygon collision area from the points of the bounding box
         */
        toPolygon(actor?: Actor): PolygonArea;
        /**
         * Tests wether a point is contained within the bounding box
         * @param p  The point to test
         */
        contains(p: Vector): boolean;
        /**
         * Tests whether another bounding box is totally contained in this one
         * @param bb  The bounding box to test
         */
        contains(bb: BoundingBox): boolean;
        /**
         * Combines this bounding box and another together returning a new bounding box
         * @param other  The bounding box to combine
         */
        combine(other: BoundingBox): BoundingBox;
        /**
         * Test wether this bounding box collides with another returning,
         * the intersection vector that can be used to resovle the collision. If there
         * is no collision null is returned.
         * @param collidable  Other collidable to test
         */
        collides(collidable: ICollidable): Vector;
        debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
    }
}
declare module ex {
    class Body {
        actor: Actor;
        /**
         * Constructs a new physics body associated with an actor
         */
        constructor(actor: Actor);
        /**
         * [ICollisionArea|Collision area] of this physics body, defines the shape for rigid body collision
         */
        collisionArea: ICollisionArea;
        /**
         * The (x, y) position of the actor this will be in the middle of the actor if the [[anchor]] is set to (0.5, 0.5) which is default.
         * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0).
         */
        pos: Vector;
        /**
         * The position of the actor last frame (x, y) in pixels
         */
        oldPos: Vector;
        /**
         * The current velocity vector (vx, vy) of the actor in pixels/second
         */
        vel: Vector;
        /**
         * The velocity of the actor last frame (vx, vy) in pixels/second
         */
        oldVel: Vector;
        /**
         * The curret acceleration vector (ax, ay) of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may
         * be useful to simulate a gravitational effect.
         */
        acc: Vector;
        /**
         * The current torque applied to the actor
         */
        torque: number;
        /**
         * The current mass of the actor, mass can be thought of as the resistance to acceleration.
         */
        mass: number;
        /**
         * The current momemnt of inertia, moi can be thought of as the resistance to rotation.
         */
        moi: number;
        /**
         * The current "motion" of the actor, used to calculated sleep in the physics simulation
         */
        motion: number;
        /**
         * The coefficient of friction on this actor
         */
        friction: number;
        /**
         * The coefficient of restitution of this actor, represents the amount of energy preserved after collision
         */
        restitution: number;
        /**
         * The rotation of the actor in radians
         */
        rotation: number;
        /**
         * The rotational velocity of the actor in radians/second
         */
        rx: number;
        /**
         * Returns the body's [[BoundingBox]] calculated for this instant in world space.
         */
        getBounds(): BoundingBox;
        /**
         * Returns the actor's [[BoundingBox]] relative to the actors position.
         */
        getRelativeBounds(): BoundingBox;
        /**
         * Updates the collision area geometry and internal caches
         */
        update(): void;
        /**
         * Sets up a box collision area based on the current bounds of the associated actor of this physics body.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        useBoxCollision(center?: Vector): void;
        /**
         * Sets up a polygon collision area based on a list of of points relative to the anchor of the associated actor of this physics body.
         *
         * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        usePolygonCollision(points: Vector[], center?: Vector): void;
        /**
         * Sets up a [[CircleArea|circle collision area]] with a specified radius in pixels.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        useCircleCollision(radius?: number, center?: Vector): void;
        /**
         * Sets up an [[EdgeArea|edge collision]] with a start point and an end point relative to the anchor of the associated actor
         * of this physics body.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        useEdgeCollision(begin: Vector, end: Vector, center?: Vector): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
    /**
     * Excalibur base class that provides basic functionality such as [[EventDispatcher]]
     * and extending abilities for vanilla Javascript projects
     */
    class Class implements IEvented {
        /**
         * Direct access to the game object event dispatcher.
         */
        eventDispatcher: EventDispatcher;
        constructor();
        /**
         * Alias for `addEventListener`. You can listen for a variety of
         * events off of the engine; see the events section below for a complete list.
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         */
        on(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * Alias for `removeEventListener`. If only the eventName is specified
         * it will remove all handlers registered for that specific event. If the eventName
         * and the handler instance are specified only that handler will be removed.
         *
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         */
        off(eventName: string, handler?: (event?: GameEvent) => void): void;
        /**
         * Emits a new event
         * @param eventName   Name of the event to emit
         * @param eventObject Data associated with this event
         */
        emit(eventName: string, eventObject?: GameEvent): void;
        /**
         * You may wish to extend native Excalibur functionality in vanilla Javascript.
         * Any method on a class inheriting [[Class]] may be extended to support
         * additional functionaliy. In the example below we create a new type called `MyActor`.
         *
         *
         * ```js
         * var MyActor = Actor.extend({
         *
         *    constructor: function() {
         *       this.newprop = 'something';
         *       Actor.apply(this, arguments);
         *    },
         *
         *    update: function(engine, delta) {
         *       // Implement custom update
         *       // Call super constructor update
         *       Actor.prototype.update.call(this, engine, delta);
         *
         *       console.log("Something cool!");
         *    }
         * });
         *
         * var myActor = new MyActor(100, 100, 100, 100, Color.Azure);
         * ```
         *
         * In TypeScript, you only need to use the `extends` syntax, you do not need
         * to use this method of extension.
         *
         * @param methods A JSON object contain any methods/properties you want to extend
         */
        static extend(methods: any): any;
    }
}
declare module ex {
    /**
     * The Excalibur timer hooks into the internal timer and fires callbacks,
     * after a certain interval, optionally repeating.
     */
    class Timer {
        static id: number;
        id: number;
        interval: number;
        fcn: () => void;
        repeats: boolean;
        private _elapsedTime;
        private _totalTimeAlive;
        complete: boolean;
        scene: Scene;
        /**
         * @param callback   The callback to be fired after the interval is complete.
         * @param repeats    Indicates whether this call back should be fired only once, or repeat after every interval as completed.
         */
        constructor(fcn: () => void, interval: number, repeats?: boolean);
        /**
         * Updates the timer after a certain number of milliseconds have elapsed. This is used internally by the engine.
         * @param delta  Number of elapsed milliseconds since the last update.
         */
        update(delta: number): void;
        getTimeRunning(): number;
        /**
         * Cancels the timer, preventing any further executions.
         */
        cancel(): void;
    }
}
declare module ex {
    interface ICollisionBroadphase {
        track(target: Body): any;
        untrack(tartet: Body): any;
        detect(targets: Actor[], delta: number): CollisionContact[];
        update(targets: Actor[], delta: number): number;
        debugDraw(ctx: any, delta: any): void;
    }
}
declare module ex {
    class NaiveCollisionBroadphase implements ICollisionBroadphase {
        track(target: Body): void;
        untrack(tartet: Body): void;
        detect(targets: Actor[], delta: number): CollisionContact[];
        update(targets: Actor[]): number;
        debugDraw(ctx: CanvasRenderingContext2D, delta: number): void;
    }
}
declare module ex {
    class TreeNode {
        parent: any;
        left: TreeNode;
        right: TreeNode;
        bounds: BoundingBox;
        height: number;
        body: Body;
        constructor(parent?: any);
        isLeaf(): boolean;
    }
    class DynamicTree {
        root: TreeNode;
        nodes: {
            [key: number]: TreeNode;
        };
        constructor();
        insert(leaf: TreeNode): void;
        remove(leaf: TreeNode): void;
        trackBody(body: Body): void;
        updateBody(body: Body): boolean;
        untrackBody(body: Body): void;
        balance(node: TreeNode): TreeNode;
        getHeight(): number;
        query(body: Body, callback: (other: Body) => boolean): void;
        rayCast(ray: Ray, max: any): Actor;
        getNodes(): TreeNode[];
        debugDraw(ctx: CanvasRenderingContext2D, delta: number): void;
    }
}
declare module ex {
    class DynamicTreeCollisionBroadphase implements ICollisionBroadphase {
        private _dynamicCollisionTree;
        private _collisionHash;
        private _collisionContactCache;
        /**
         * Tracks a physics body for collisions
         */
        track(target: Body): void;
        /**
         * Untracks a physics body
         */
        untrack(target: Body): void;
        private _canCollide(actorA, actorB);
        detect(targets: Actor[], delta: number): CollisionContact[];
        /**
         * Update the dynamic tree positions
         */
        update(targets: Actor[], delta: number): number;
        debugDraw(ctx: CanvasRenderingContext2D, delta: number): void;
    }
}
declare module ex {
    /**
     * Cameras
     *
     * [[BaseCamera]] is the base class for all Excalibur cameras. Cameras are used
     * to move around your game and set focus. They are used to determine
     * what is "off screen" and can be used to scale the game.
     *
     * Excalibur comes with a [[LockedCamera]] and a [[SideCamera]], depending on
     * your game needs.
     *
     * Cameras are attached to [[Scene|Scenes]] and can be changed by
     * setting [[Scene.camera]]. By default, a [[Scene]] is initialized with a
     * [[BaseCamera]] that doesn't move and is centered on the screen.
     *
     * ## Focus
     *
     * Cameras have a position ([[x]], [[y]]) which means they center around a specific
     * [[Vector|point]]. This can also be an [[Actor]] ([[BaseCamera.setActorToFollow]]) which
     * the camera will follow as the actor moves, which can be useful for cutscene scenarios (using
     * invisible actors).
     *
     * If a camera is following an [[Actor]], it will ensure the [[Actor]] is always at the
     * center of the screen. You can use [[x]] and [[y]] instead if you wish to
     * offset the focal point.
     *
     * ## Camera Shake
     *
     * To add some fun effects to your game, the [[shake]] method
     * will do a random shake. This is great for explosions, damage, and other
     * in-game effects.
     *
     * ## Camera Lerp
     *
     * "Lerp" is short for [Linear Interpolation](http://en.wikipedia.org/wiki/Linear_interpolation)
     * and it enables the camera focus to move smoothly between two points using timing functions.
     * Use [[move]] to ease to a specific point using a provided [[EasingFunction]].
     *
     * ## Camera Zooming
     *
     * To adjust the zoom for your game, use [[zoom]] which will scale the
     * game accordingly. You can pass a duration to transition between zoom levels.
     *
     * ## Known Issues
     *
     * **Actors following a path will wobble when camera is moving**
     * [Issue #276](https://github.com/excaliburjs/Excalibur/issues/276)
     *
     */
    class BaseCamera {
        protected _follow: Actor;
        z: number;
        dx: number;
        dy: number;
        dz: number;
        ax: number;
        ay: number;
        az: number;
        rotation: number;
        rx: number;
        private _x;
        private _y;
        private _cameraMoving;
        private _currentLerpTime;
        private _lerpDuration;
        private _totalLerpTime;
        private _lerpStart;
        private _lerpEnd;
        private _lerpPromise;
        protected _isShaking: boolean;
        private _shakeMagnitudeX;
        private _shakeMagnitudeY;
        private _shakeDuration;
        private _elapsedShakeTime;
        private _xShake;
        private _yShake;
        protected _isZooming: boolean;
        private _currentZoomScale;
        private _maxZoomScale;
        private _zoomDuration;
        private _elapsedZoomTime;
        private _zoomIncrement;
        private _easing;
        /**
         * Get the camera's x position
         */
        /**
         * Set the camera's x position (cannot be set when following an [[Actor]] or when moving)
         */
        x: number;
        /**
         * Get the camera's y position
         */
        /**
         * Set the camera's y position (cannot be set when following an [[Actor]] or when moving)
         */
        y: number;
        /**
         * Sets the [[Actor]] to follow with the camera
         * @param actor  The actor to follow
         */
        setActorToFollow(actor: Actor): void;
        /**
         * Returns the focal point of the camera, a new point giving the x and y position of the camera
         */
        getFocus(): Vector;
        /**
         * This moves the camera focal point to the specified position using specified easing function. Cannot move when following an Actor.
         *
         * @param pos The target position to move to
         * @param duration The duration in millseconds the move should last
         * @param [easingFn] An optional easing function ([[ex.EasingFunctions.EaseInOutCubic]] by default)
         * @returns A [[Promise]] that resolves when movement is finished, including if it's interrupted.
         *          The [[Promise]] value is the [[Vector]] of the target position. It will be rejected if a move cannot be made.
         */
        move(pos: Vector, duration: number, easingFn?: EasingFunction): IPromise<Vector>;
        /**
         * Sets the camera to shake at the specified magnitudes for the specified duration
         * @param magnitudeX  The x magnitude of the shake
         * @param magnitudeY  The y magnitude of the shake
         * @param duration    The duration of the shake in milliseconds
         */
        shake(magnitudeX: number, magnitudeY: number, duration: number): void;
        /**
         * Zooms the camera in or out by the specified scale over the specified duration.
         * If no duration is specified, it take effect immediately.
         * @param scale    The scale of the zoom
         * @param duration The duration of the zoom in milliseconds
         */
        zoom(scale: number, duration?: number): void;
        /**
         * Gets the current zoom scale
         */
        getZoom(): number;
        private _setCurrentZoomScale(zoomScale);
        update(engine: Engine, delta: number): void;
        /**
         * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
         * @param delta  The number of milliseconds since the last update
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
        private _isDoneShaking();
        private _isDoneZooming();
    }
    /**
     * An extension of [[BaseCamera]] that is locked vertically; it will only move side to side.
     *
     * Common usages: platformers.
     */
    class SideCamera extends BaseCamera {
        getFocus(): Vector;
    }
    /**
     * An extension of [[BaseCamera]] that is locked to an [[Actor]] or
     * [[LockedCamera.focus|focal point]]; the actor will appear in the
     * center of the screen.
     *
     * Common usages: RPGs, adventure games, top-down games.
     */
    class LockedCamera extends BaseCamera {
        getFocus(): Vector;
    }
}
declare module ex {
    interface IActionable {
        actions: ActionContext;
    }
}
declare module ex {
    /**
     * An enum that describes the strategies that rotation actions can use
     */
    enum RotationType {
        /**
         * Rotation via `ShortestPath` will use the smallest angle
         * between the starting and ending points. This strategy is the default behavior.
         */
        ShortestPath = 0,
        /**
         * Rotation via `LongestPath` will use the largest angle
         * between the starting and ending points.
         */
        LongestPath = 1,
        /**
         * Rotation via `Clockwise` will travel in a clockwise direction,
         * regardless of the starting and ending points.
         */
        Clockwise = 2,
        /**
         * Rotation via `CounterClockwise` will travel in a counterclockwise direction,
         * regardless of the starting and ending points.
         */
        CounterClockwise = 3,
    }
}
/**
 * See [[ActionContext|Action API]] for more information about Actions.
 */
declare module ex.Internal.Actions {
    /**
     * Used for implementing actions for the [[ActionContext|Action API]].
     */
    interface IAction {
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
        stop(): void;
    }
    class EaseTo implements IAction {
        actor: Actor;
        easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        private _currentLerpTime;
        private _lerpDuration;
        private _lerpStart;
        private _lerpEnd;
        private _initialized;
        private _stopped;
        private _distance;
        constructor(actor: Actor, x: number, y: number, duration: number, easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number);
        private _initialize();
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
        stop(): void;
    }
    class MoveTo implements IAction {
        private _actor;
        x: number;
        y: number;
        private _start;
        private _end;
        private _dir;
        private _speed;
        private _distance;
        private _started;
        private _stopped;
        constructor(actor: Actor, destx: number, desty: number, speed: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class MoveBy implements IAction {
        private _actor;
        x: number;
        y: number;
        private _distance;
        private _speed;
        private _time;
        private _start;
        private _end;
        private _dir;
        private _started;
        private _stopped;
        constructor(actor: Actor, destx: number, desty: number, time: number);
        update(delta: Number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Follow implements IAction {
        private _actor;
        private _actorToFollow;
        x: number;
        y: number;
        private _current;
        private _end;
        private _dir;
        private _speed;
        private _maximumDistance;
        private _distanceBetween;
        private _started;
        private _stopped;
        constructor(actor: Actor, actorToFollow: Actor, followDistance?: number);
        update(delta: number): void;
        stop(): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
    }
    class Meet implements IAction {
        private _actor;
        private _actorToMeet;
        x: number;
        y: number;
        private _current;
        private _end;
        private _dir;
        private _speed;
        private _distanceBetween;
        private _started;
        private _stopped;
        private _speedWasSpecified;
        constructor(actor: Actor, actorToMeet: Actor, speed?: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class RotateTo implements IAction {
        private _actor;
        x: number;
        y: number;
        private _start;
        private _end;
        private _speed;
        private _rotationType;
        private _direction;
        private _distance;
        private _shortDistance;
        private _longDistance;
        private _shortestPathIsPositive;
        private _started;
        private _stopped;
        constructor(actor: Actor, angleRadians: number, speed: number, rotationType?: RotationType);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class RotateBy implements IAction {
        private _actor;
        x: number;
        y: number;
        private _start;
        private _end;
        private _speed;
        private _time;
        private _rotationType;
        private _direction;
        private _distance;
        private _shortDistance;
        private _longDistance;
        private _shortestPathIsPositive;
        private _started;
        private _stopped;
        constructor(actor: Actor, angleRadians: number, time: number, rotationType?: RotationType);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class ScaleTo implements IAction {
        private _actor;
        x: number;
        y: number;
        private _startX;
        private _startY;
        private _endX;
        private _endY;
        private _speedX;
        private _speedY;
        private _distanceX;
        private _distanceY;
        private _started;
        private _stopped;
        constructor(actor: Actor, scaleX: number, scaleY: number, speedX: number, speedY: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class ScaleBy implements IAction {
        private _actor;
        x: number;
        y: number;
        private _startX;
        private _startY;
        private _endX;
        private _endY;
        private _time;
        private _distanceX;
        private _distanceY;
        private _started;
        private _stopped;
        private _speedX;
        private _speedY;
        constructor(actor: Actor, scaleX: number, scaleY: number, time: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Delay implements IAction {
        x: number;
        y: number;
        private _actor;
        private _elapsedTime;
        private _delay;
        private _started;
        private _stopped;
        constructor(actor: Actor, delay: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Blink implements IAction {
        private _timeVisible;
        private _timeNotVisible;
        private _elapsedTime;
        private _totalTime;
        private _actor;
        private _duration;
        private _stopped;
        private _started;
        constructor(actor: Actor, timeVisible: number, timeNotVisible: number, numBlinks?: number);
        update(delta: any): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Fade implements IAction {
        x: number;
        y: number;
        private _actor;
        private _endOpacity;
        private _speed;
        private _multiplier;
        private _started;
        private _stopped;
        constructor(actor: Actor, endOpacity: number, speed: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Die implements IAction {
        x: number;
        y: number;
        private _actor;
        private _started;
        private _stopped;
        constructor(actor: Actor);
        update(delta: number): void;
        isComplete(): boolean;
        stop(): void;
        reset(): void;
    }
    class CallMethod implements IAction {
        x: number;
        y: number;
        private _method;
        private _actor;
        private _hasBeenCalled;
        constructor(actor: Actor, method: () => any);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
        stop(): void;
    }
    class Repeat implements IAction {
        x: number;
        y: number;
        private _actor;
        private _actionQueue;
        private _repeat;
        private _originalRepeat;
        private _stopped;
        constructor(actor: Actor, repeat: number, actions: IAction[]);
        update(delta: any): void;
        isComplete(): boolean;
        stop(): void;
        reset(): void;
    }
    class RepeatForever implements IAction {
        x: number;
        y: number;
        private _actor;
        private _actionQueue;
        private _stopped;
        constructor(actor: Actor, actions: IAction[]);
        update(delta: any): void;
        isComplete(): boolean;
        stop(): void;
        reset(): void;
    }
    /**
     * Action Queues
     *
     * Action queues are part of the [[ActionContext|Action API]] and
     * store the list of actions to be executed for an [[Actor]].
     *
     * Actors implement [[Action.actionQueue]] which can be manipulated by
     * advanced users to adjust the actions currently being executed in the
     * queue.
     */
    class ActionQueue {
        private _actor;
        private _actions;
        private _currentAction;
        private _completedActions;
        constructor(actor: Actor);
        add(action: IAction): void;
        remove(action: IAction): void;
        clearActions(): void;
        getActions(): IAction[];
        hasNext(): boolean;
        reset(): void;
        update(delta: number): void;
    }
}
declare module ex {
    /**
     * Action API
     *
     * The fluent Action API allows you to perform "actions" on
     * [[Actor|Actors]] such as following, moving, rotating, and
     * more. You can implement your own actions by implementing
     * the [[IAction]] interface.
     *
     * Actions can be chained together and can be set to repeat,
     * or can be interrupted to change.
     *
     * Actor actions are available off of [[Actor.actions]].
     *
     * ## Chaining Actions
     *
     * You can chain actions to create a script because the action
     * methods return the context, allowing you to build a queue of
     * actions that get executed as part of an [[ActionQueue]].
     *
     * ```ts
     * class Enemy extends ex.Actor {
     *
     *   public patrol() {
     *
     *      // clear existing queue
     *      this.actions.clearActions();
     *
     *      // guard a choke point
     *      // move to 100, 100 and take 1.2s
     *      // wait for 3s
     *      // move back to 0, 100 and take 1.2s
     *      // wait for 3s
     *      // repeat
     *      this.actions.moveTo(100, 100, 1200)
     *        .delay(3000)
     *        .moveTo(0, 100, 1200)
     *        .delay(3000)
     *        .repeatForever();
     *   }
     * }
     * ```
     *
     * ## Example: Follow a Path
     *
     * You can use [[Actor.actions.moveTo]] to move to a specific point,
     * allowing you to chain together actions to form a path.
     *
     * This example has a `Ship` follow a path that it guards by
     * spawning at the start point, moving to the end, then reversing
     * itself and repeating that forever.
     *
     * ```ts
     * public Ship extends ex.Actor {
     *
     *   public onInitialize() {
     *     var path = [
     *       new ex.Point(20, 20),
     *       new ex.Point(50, 40),
     *       new ex.Point(25, 30),
     *       new ex.Point(75, 80)
     *     ];
     *
     *     // spawn at start point
     *     this.x = path[0].x;
     *     this.y = path[0].y;
     *
     *     // create action queue
     *
     *     // forward path (skip first spawn point)
     *     for (var i = 1; i < path.length; i++) {
     *       this.actions.moveTo(path[i].x, path[i].y, 300);
     *     }
     *
     *     // reverse path (skip last point)
     *     for (var j = path.length - 2; j >= 0; j--) {
     *       this.actions.moveTo(path[j].x, path[j].y, 300);
     *     }
     *
     *     // repeat
     *     this.actions.repeatForever();
     *   }
     * }
     * ```
     *
     * While this is a trivial example, the Action API allows complex
     * routines to be programmed for Actors. For example, using the
     * [Tiled Map Editor](http://mapeditor.org) you can create a map that
     * uses polylines to create paths, load in the JSON using a
     * [[Resource|Generic Resource]], create a [[TileMap]],
     * and spawn ships programmatically  while utilizing the polylines
     * to automatically generate the actions needed to do pathing.
     *
     * ## Custom Actions
     *
     * The API does allow you to implement new actions by implementing the [[IAction]]
     * interface, but this will be improved in future versions as right now it
     * is meant for the Excalibur team and can be advanced to implement.
     *
     * You can manually manipulate an Actor's [[ActionQueue]] using
     * [[Actor.actionQueue]]. For example, using [[ActionQueue.add]] for
     * custom actions.
     *
     * ## Future Plans
     *
     * The Excalibur team is working on extending and rebuilding the Action API
     * in future versions to support multiple timelines/scripts, better eventing,
     * and a more robust API to allow for complex and customized actions.
     *
     */
    class ActionContext {
        private _actors;
        private _queues;
        constructor();
        constructor(actor: Actor);
        constructor(actors: Actor[]);
        /**
         * Clears all queued actions from the Actor
         */
        clearActions(): void;
        addActorToContext(actor: Actor): void;
        removeActorFromContext(actor: Actor): void;
        /**
         * This method will move an actor to the specified `x` and `y` position over the
         * specified duration using a given [[EasingFunctions]] and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x         The x location to move the actor to
         * @param y         The y location to move the actor to
         * @param duration  The time it should take the actor to move to the new location in milliseconds
         * @param easingFcn Use [[EasingFunctions]] or a custom function to use to calculate position
         */
        easeTo(x: number, y: number, duration: number, easingFcn?: EasingFunction): this;
        /**
         * This method will move an actor to the specified x and y position at the
         * speed specified (in pixels per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x      The x location to move the actor to
         * @param y      The y location to move the actor to
         * @param speed  The speed in pixels per second to move
         */
        moveTo(x: number, y: number, speed: number): ActionContext;
        /**
         * This method will move an actor to the specified x and y position by a
         * certain time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param x     The x location to move the actor to
         * @param y     The y location to move the actor to
         * @param time  The time it should take the actor to move to the new location in milliseconds
         */
        moveBy(x: number, y: number, time: number): ActionContext;
        /**
         * This method will rotate an actor to the specified angle at the speed
         * specified (in radians per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param speed         The angular velocity of the rotation specified in radians per second
         * @param rotationType  The [[RotationType]] to use for this rotation
         */
        rotateTo(angleRadians: number, speed: number, rotationType?: RotationType): ActionContext;
        /**
         * This method will rotate an actor to the specified angle by a certain
         * time (in milliseconds) and return back the actor. This method is part
         * of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param time          The time it should take the actor to complete the rotation in milliseconds
         * @param rotationType  The [[RotationType]] to use for this rotation
         */
        rotateBy(angleRadians: number, time: number, rotationType?: RotationType): ActionContext;
        /**
         * This method will scale an actor to the specified size at the speed
         * specified (in magnitude increase per second) and return back the
         * actor. This method is part of the actor 'Action' fluent API allowing
         * action chaining.
         * @param size   The scaling factor to apply
         * @param speed  The speed of scaling specified in magnitude increase per second
         */
        scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): ActionContext;
        /**
         * This method will scale an actor to the specified size by a certain time
         * (in milliseconds) and return back the actor. This method is part of the
         * actor 'Action' fluent API allowing action chaining.
         * @param size   The scaling factor to apply
         * @param time   The time it should take to complete the scaling in milliseconds
         */
        scaleBy(sizeX: number, sizeY: number, time: number): ActionContext;
        /**
         * This method will cause an actor to blink (become visible and not
         * visible). Optionally, you may specify the number of blinks. Specify the amount of time
         * the actor should be visible per blink, and the amount of time not visible.
         * This method is part of the actor 'Action' fluent API allowing action chaining.
         * @param timeVisible     The amount of time to stay visible per blink in milliseconds
         * @param timeNotVisible  The amount of time to stay not visible per blink in milliseconds
         * @param numBlinks       The number of times to blink
         */
        blink(timeVisible: number, timeNotVisible: number, numBlinks?: number): ActionContext;
        /**
         * This method will cause an actor's opacity to change from its current value
         * to the provided value by a specified time (in milliseconds). This method is
         * part of the actor 'Action' fluent API allowing action chaining.
         * @param opacity  The ending opacity
         * @param time     The time it should take to fade the actor (in milliseconds)
         */
        fade(opacity: number, time: number): ActionContext;
        /**
         * This method will delay the next action from executing for a certain
         * amount of time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param time  The amount of time to delay the next action in the queue from executing in milliseconds
         */
        delay(time: number): ActionContext;
        /**
         * This method will add an action to the queue that will remove the actor from the
         * scene once it has completed its previous actions. Any actions on the
         * action queue after this action will not be executed.
         */
        die(): ActionContext;
        /**
         * This method allows you to call an arbitrary method as the next action in the
         * action queue. This is useful if you want to execute code in after a specific
         * action, i.e An actor arrives at a destinatino after traversing a path
         */
        callMethod(method: () => any): ActionContext;
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions a certain number of times. If the number of repeats
         * is not specified it will repeat forever. This method is part of
         * the actor 'Action' fluent API allowing action chaining
         * @param times  The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions
         * will repeat forever
         */
        repeat(times?: number): ActionContext;
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions forever. This method is part of the actor 'Action'
         * fluent API allowing action chaining.
         */
        repeatForever(): ActionContext;
        /**
         * This method will cause the actor to follow another at a specified distance
         * @param actor           The actor to follow
         * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
         */
        follow(actor: Actor, followDistance?: number): ActionContext;
        /**
         * This method will cause the actor to move towards another until they
         * collide "meet" at a specified speed.
         * @param actor  The actor to meet
         * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
         */
        meet(actor: Actor, speed?: number): ActionContext;
        /**
         * Returns a promise that resolves when the current action queue up to now
         * is finished.
         */
        asPromise<T>(): Promise<T>;
    }
}
declare module ex {
    /**
     * Grouping
     *
     * Groups are used for logically grouping Actors so they can be acted upon
     * in bulk.
     *
     * ## Using Groups
     *
     * Groups can be used to detect collisions across a large nubmer of actors. For example
     * perhaps a large group of "enemy" actors.
     *
     * ```typescript
     * var enemyShips = engine.currentScene.createGroup("enemy");
     * var enemies = [...]; // Large array of enemies;
     * enemyShips.add(enemies);
     *
     * var player = new Actor();
     * engine.currentScene.add(player);
     *
     * enemyShips.on('collision', function(ev: CollisionEvent){
     *   if (e.other === player) {
     *       //console.log("collision with player!");
     *   }
     * });
     *
     * ```
     */
    class Group extends Class implements IActionable, IEvented {
        name: string;
        scene: Scene;
        private _logger;
        private _members;
        actions: ActionContext;
        constructor(name: string, scene: Scene);
        add(actor: Actor): any;
        add(actors: Actor[]): any;
        remove(actor: Actor): void;
        move(vector: Vector): void;
        move(dx: number, dy: number): void;
        rotate(angle: number): void;
        on(eventName: string, handler: (event?: GameEvent) => void): void;
        off(eventName: string, handler?: (event?: GameEvent) => void): void;
        emit(topic: string, event?: GameEvent): void;
        contains(actor: Actor): boolean;
        getMembers(): Actor[];
        getRandomMember(): Actor;
        getBounds(): BoundingBox;
    }
}
declare module ex {
    /**
     * A sorted list implementation. NOTE: this implementation is not self-balancing
     */
    class SortedList<T> {
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
    class BinaryTreeNode {
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
    class MockedElement {
        private _key;
        constructor(key: number);
        getTheKey(): number;
        setKey(key: number): void;
    }
}
declare module ex {
    /**
     * Scenes
     *
     * [[Actor|Actors]] are composed together into groupings called Scenes in
     * Excalibur. The metaphor models the same idea behind real world
     * actors in a scene. Only actors in scenes will be updated and drawn.
     *
     * Typical usages of a scene include: levels, menus, loading screens, etc.
     *
     * ## Adding actors to the scene
     *
     * For an [[Actor]] to be drawn and updated, it needs to be part of the "scene graph".
     * The [[Engine]] provides several easy ways to quickly add/remove actors from the
     * current scene.
     *
     * ```js
     * var game   = new ex.Engine(...);
     *
     * var player = new ex.Actor();
     * var enemy  = new ex.Actor();
     *
     * // add them to the "root" scene
     *
     * game.add(player);
     * game.add(enemy);
     *
     * // start game
     * game.start();
     * ```
     *
     * You can also add actors to a [[Scene]] instance specifically.
     *
     * ```js
     * var game   = new ex.Engine();
     * var level1 = new ex.Scene();
     *
     * var player = new ex.Actor();
     * var enemy  = new ex.Actor();
     *
     * // add actors to level1
     * level1.add(player);
     * level1.add(enemy);
     *
     * // add level1 to the game
     * game.add("level1", level1);
     *
     * // start the game
     * game.start();
     *
     * // after player clicks start game, for example
     * game.goToScene("level1");
     *
     * ```
     *
     * ## Scene Lifecycle
     *
     * A [[Scene|scene]] has a basic lifecycle that dictacts how it is initialized, updated, and drawn. Once a [[Scene|scene]] is added to
     * the [[Engine|engine]] it will follow this lifecycle.
     *
     * ![Scene Lifecycle](/assets/images/docs/SceneLifecycle.png)
     *
     * ## Extending scenes
     *
     * For more complex games, you might want more control over a scene in which
     * case you can extend [[Scene]]. This is useful for menus, custom loaders,
     * and levels.
     *
     * Just use [[Engine.add]] to add a new scene to the game. You can then use
     * [[Engine.goToScene]] to switch scenes which calls [[Scene.onActivate]] for the
     * new scene and [[Scene.onDeactivate]] for the old scene. Use [[Scene.onInitialize]]
     * to perform any start-up logic, which is called once.
     *
     * **TypeScript**
     *
     * ```ts
     * class MainMenu extends ex.Scene {
     *
     *   // start-up logic, called once
     *   public onInitialize(engine: ex.Engine) { }
     *
     *   // each time the scene is entered (Engine.goToScene)
     *   public onActivate() { }
     *
     *   // each time the scene is exited (Engine.goToScene)
     *   public onDeactivate() { }
     * }
     *
     * // add to game and activate it
     * game.add("mainmenu", new MainMenu());
     * game.goToScene("mainmenu");
     * ```
     *
     * **Javascript**
     *
     * ```js
     * var MainMenu = ex.Scene.extend({
     *   // start-up logic, called once
     *   onInitialize: function (engine) { },
     *
     *   // each time the scene is activated by Engine.goToScene
     *   onActivate: function () { },
     *
     *   // each time the scene is deactivated by Engine.goToScene
     *   onDeactivate: function () { }
     * });
     *
     * game.add("mainmenu", new MainMenu());
     * game.goToScene("mainmenu");
     * ```
     *
     * ## Scene camera
     *
     * By default, a [[Scene]] is initialized with a [[BaseCamera]] which
     * does not move and centers the game world.
     *
     * Learn more about [[BaseCamera|Cameras]] and how to modify them to suit
     * your game.
     */
    class Scene extends ex.Class {
        /**
         * The actor this scene is attached to, if any
         */
        actor: Actor;
        /**
         * Gets or sets the current camera for the scene
         */
        camera: BaseCamera;
        /**
         * The actors in the current scene
         */
        children: Actor[];
        /**
         * The [[TileMap]]s in the scene, if any
         */
        tileMaps: TileMap[];
        /**
         * The [[Group]]s in the scene, if any
         */
        groups: {
            [key: string]: Group;
        };
        /**
         * Access to the Excalibur engine
         */
        engine: Engine;
        /**
         * The [[UIActor]]s in a scene, if any; these are drawn last
         */
        uiActors: Actor[];
        /**
         * Whether or the [[Scene]] has been initialized
         */
        isInitialized: boolean;
        private _sortedDrawingTree;
        private _broadphase;
        private _killQueue;
        private _timers;
        private _cancelQueue;
        private _logger;
        constructor(engine?: Engine);
        on(eventName: ex.Events.initialize, handler: (event?: InitializeEvent) => void): any;
        on(eventName: ex.Events.activate, handler: (event?: ActivateEvent) => void): any;
        on(eventName: ex.Events.deactivate, handler: (event?: DeactivateEvent) => void): any;
        on(eventName: ex.Events.preupdate, handler: (event?: PreUpdateEvent) => void): any;
        on(eventName: ex.Events.postupdate, handler: (event?: PostUpdateEvent) => void): any;
        on(eventName: ex.Events.predraw, handler: (event?: PreDrawEvent) => void): any;
        on(eventName: ex.Events.postdraw, handler: (event?: PostDrawEvent) => void): any;
        on(eventName: ex.Events.predebugdraw, handler: (event?: PreDebugDrawEvent) => void): any;
        on(eventName: ex.Events.postdebugdraw, handler: (event?: PostDebugDrawEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        /**
         * This is called before the first update of the [[Scene]]. Initializes scene members like the camera. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         */
        onInitialize(engine: Engine): void;
        /**
         * This is called when the scene is made active and started. It is meant to be overriden,
         * this is where you should setup any DOM UI or event handlers needed for the scene.
         */
        onActivate(): void;
        /**
         * This is called when the scene is made transitioned away from and stopped. It is meant to be overriden,
         * this is where you should cleanup any DOM UI or event handlers needed for the scene.
         */
        onDeactivate(): void;
        /**
         * Updates all the actors and timers in the scene. Called by the [[Engine]].
         * @param engine  Reference to the current Engine
         * @param delta   The number of milliseconds since the last update
         */
        update(engine: Engine, delta: number): void;
        /**
         * Draws all the actors in the Scene. Called by the [[Engine]].
         * @param ctx    The current rendering context
         * @param delta  The number of milliseconds since the last draw
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Draws all the actors' debug information in the Scene. Called by the [[Engine]].
         * @param ctx  The current rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
        /**
         * Checks whether an actor is contained in this scene or not
         */
        contains(actor: Actor): boolean;
        /**
         * Adds a [[Timer]] to the current scene.
         * @param timer  The timer to add to the current scene.
         */
        add(timer: Timer): void;
        /**
         * Adds a [[TileMap]] to the Scene, once this is done the TileMap will be drawn and updated.
         */
        add(tileMap: TileMap): void;
        /**
         * Adds an actor to the scene, once this is done the [[Actor]] will be drawn and updated.
         * @param actor  The actor to add to the current scene
         */
        add(actor: Actor): void;
        /**
         * Adds a [[UIActor]] to the scene.
         * @param uiActor  The UIActor to add to the current scene
         */
        add(uiActor: UIActor): void;
        /**
         * Removes a [[Timer]] from the current scene, it will no longer be updated.
         * @param timer  The timer to remove to the current scene.
         */
        remove(timer: Timer): void;
        /**
         * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
         * @param tileMap {TileMap}
         */
        remove(tileMap: TileMap): void;
        /**
         * Removes an actor from the scene, it will no longer be drawn or updated.
         * @param actor  The actor to remove from the current scene.
         */
        remove(actor: Actor): void;
        /**
         * Removes a [[UIActor]] to the scene, it will no longer be drawn or updated
         * @param uiActor  The UIActor to remove from the current scene
         */
        remove(uiActor: UIActor): void;
        /**
         * Adds (any) actor to act as a piece of UI, meaning it is always positioned
         * in screen coordinates. UI actors do not participate in collisions.
         * @todo Should this be `UIActor` only?
         */
        addUIActor(actor: Actor): void;
        /**
         * Removes an actor as a piece of UI
         */
        removeUIActor(actor: Actor): void;
        /**
         * Adds an actor to the scene, once this is done the actor will be drawn and updated.
         */
        protected _addChild(actor: Actor): void;
        /**
         * Adds a [[TileMap]] to the scene, once this is done the TileMap will be drawn and updated.
         */
        addTileMap(tileMap: TileMap): void;
        /**
         * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
         */
        removeTileMap(tileMap: TileMap): void;
        /**
         * Removes an actor from the scene, it will no longer be drawn or updated.
         */
        protected _removeChild(actor: Actor): void;
        /**
         * Adds a [[Timer]] to the scene
         * @param timer  The timer to add
         */
        addTimer(timer: Timer): Timer;
        /**
         * Removes a [[Timer]] from the scene.
         * @warning Can be dangerous, use [[cancelTimer]] instead
         * @param timer  The timer to remove
         */
        removeTimer(timer: Timer): Timer;
        /**
         * Cancels a [[Timer]], removing it from the scene nicely
         * @param timer  The timer to cancel
         */
        cancelTimer(timer: Timer): Timer;
        /**
         * Tests whether a [[Timer]] is active in the scene
         */
        isTimerActive(timer: Timer): boolean;
        /**
         * Creates and adds a [[Group]] to the scene with a name
         */
        createGroup(name: string): Group;
        /**
         * Returns a [[Group]] by name
         */
        getGroup(name: string): Group;
        /**
         * Removes a [[Group]] by name
         */
        removeGroup(name: string): void;
        /**
         * Removes a [[Group]] by reference
         */
        removeGroup(group: Group): void;
        /**
         * Removes the given actor from the sorted drawing tree
         */
        cleanupDrawTree(actor: ex.Actor): void;
        /**
         * Updates the given actor's position in the sorted drawing tree
         */
        updateDrawTree(actor: ex.Actor): void;
    }
}
declare module ex {
    /**
     * A definition of an EasingFunction. See [[ex.EasingFunctions]].
     */
    interface EasingFunction {
        (currentTime: number, startValue: number, endValue: number, duration: number): number;
    }
    /**
     * Standard easing functions for motion in Excalibur, defined on a domain of [0, duration] and a range from [+startValue,+endValue]
     * Given a time, the function will return a value from postive startValue to postive endValue.
     *
     * ```js
     * function Linear (t) {
     *    return t * t;
     * }
     *
     * // accelerating from zero velocity
     * function EaseInQuad (t) {
     *    return t * t;
     * }
     *
     * // decelerating to zero velocity
     * function EaseOutQuad (t) {
     *    return t * (2 - t);
     * }
     *
     * // acceleration until halfway, then deceleration
     * function EaseInOutQuad (t) {
     *    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
     * }
     *
     * // accelerating from zero velocity
     * function EaseInCubic (t) {
     *    return t * t * t;
     * }
     *
     * // decelerating to zero velocity
     * function EaseOutCubic (t) {
     *    return (--t) * t * t + 1;
     * }
     *
     * // acceleration until halfway, then deceleration
     * function EaseInOutCubic (t) {
     *    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
     * }
     * ```
     */
    class EasingFunctions {
        static Linear: EasingFunction;
        static EaseInQuad: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseOutQuad: EasingFunction;
        static EaseInOutQuad: EasingFunction;
        static EaseInCubic: EasingFunction;
        static EaseOutCubic: EasingFunction;
        static EaseInOutCubic: EasingFunction;
    }
}
declare module ex {
    /**
     * Actors
     *
     * The most important primitive in Excalibur is an `Actor`. Anything that
     * can move on the screen, collide with another `Actor`, respond to events,
     * or interact with the current scene, must be an actor. An `Actor` **must**
     * be part of a [[Scene]] for it to be drawn to the screen.
     *
     * ## Basic actors
     *
     * For quick and dirty games, you can just create an instance of an `Actor`
     * and manipulate it directly.
     *
     * Actors (and other entities) must be added to a [[Scene]] to be drawn
     * and updated on-screen.
     *
     * ```ts
     * var player = new ex.Actor();
     *
     * // move the player
     * player.dx = 5;
     *
     * // add player to the current scene
     * game.add(player);
     *
     * ```
     * `game.add` is a convenience method for adding an `Actor` to the current scene. The equivalent verbose call is `game.currentScene.add`.
     *
     * ## Actor Lifecycle
     *
     * An [[Actor|actor]] has a basic lifecycle that dictacts how it is initialized, updated, and drawn. Once an actor is part of a
     * [[Scene|scene]], it will follow this lifecycle.
     *
     * ![Actor Lifecycle](/assets/images/docs/ActorLifecycle.png)
     *
     * ## Extending actors
     *
     * For "real-world" games, you'll want to `extend` the `Actor` class.
     * This gives you much greater control and encapsulates logic for that
     * actor.
     *
     * You can override the [[onInitialize]] method to perform any startup logic
     * for an actor (such as configuring state). [[onInitialize]] gets called
     * **once** before the first frame an actor is drawn/updated. It is passed
     * an instance of [[Engine]] to access global state or perform coordinate math.
     *
     * **TypeScript**
     *
     * ```ts
     * class Player extends ex.Actor {
     *
     *   public level = 1;
     *   public endurance = 0;
     *   public fortitude = 0;
     *
     *   constructor() {
     *     super();
     *   }
     *
     *   public onInitialize(engine: ex.Engine) {
     *     this.endurance = 20;
     *     this.fortitude = 16;
     *   }
     *
     *   public getMaxHealth() {
     *     return (0.4 * this.endurance) + (0.9 * this.fortitude) + (this.level * 1.2);
     *   }
     * }
     * ```
     *
     * **Javascript**
     *
     * In Javascript you can use the [[extend]] method to override or add
     * methods to an `Actor`.
     *
     * ```js
     * var Player = ex.Actor.extend({
     *
     *   level: 1,
     *   endurance: 0,
     *   fortitude: 0,
     *
     *   onInitialize: function (engine) {
     *     this.endurance = 20;
     *     this.fortitude = 16;
     *   },
     *
     *   getMaxHealth: function () {
     *     return (0.4 * this.endurance) + (0.9 * this.fortitude) + (this.level * 1.2);
     *   }
     * });
     * ```
     *
     * ## Updating actors
     *
     * Override the [[update]] method to update the state of your actor each frame.
     * Typically things that need to be updated include state, drawing, or position.
     *
     * Remember to call `super.update` to ensure the base update logic is performed.
     * You can then write your own logic for what happens after that.
     *
     * The [[update]] method is passed an instance of the Excalibur engine, which
     * can be used to perform coordinate math or access global state. It is also
     * passed `delta` which is the time in milliseconds since the last frame, which can be used
     * to perform time-based movement or time-based math (such as a timer).
     *
     * **TypeScript**
     *
     * ```ts
     * class Player extends Actor {
     *   public update(engine: ex.Engine, delta: number) {
     *     super.update(engine, delta); // call base update logic
     *
     *     // check if player died
     *     if (this.health <= 0) {
     *       this.emit("death");
     *       this.onDeath();
     *       return;
     *     }
     *   }
     * }
     * ```
     *
     * **Javascript**
     *
     * ```js
     * var Player = ex.Actor.extend({
     *   update: function (engine, delta) {
     *     ex.Actor.prototype.update.call(this, engine, delta); // call base update logic
     *
     *     // check if player died
     *     if (this.health <= 0) {
     *       this.emit("death");
     *       this.onDeath();
     *       return;
     *     }
     *   }
     * });
     * ```
     *
     * ## Drawing actors
     *
     * Override the [[draw]] method to perform any custom drawing. For simple games,
     * you don't need to override `draw`, instead you can use [[addDrawing]] and [[setDrawing]]
     * to manipulate the [[Sprite|sprites]]/[[Animation|animations]] that the actor is using.
     *
     * ### Working with Textures & Sprites
     *
     * Think of a [[Texture|texture]] as the raw image file that will be loaded into Excalibur. In order for it to be drawn
     * it must be converted to a [[Sprite.sprite]].
     *
     * A common usage is to load a [[Texture]] and convert it to a [[Sprite]] for an actor. If you are using the [[Loader]] to
     * pre-load assets, you can simply assign an actor a [[Sprite]] to draw. You can also create a
     * [[Texture.asSprite|sprite from a Texture]] to quickly create a [[Sprite]] instance.
     *
     * ```ts
     * // assume Resources.TxPlayer is a 80x80 png image
     *
     * public onInitialize(engine: ex.Engine) {
     *
     *   // set as the "default" drawing
     *   this.addDrawing(Resources.TxPlayer);
     *
     *   // you can also set a Sprite instance to draw
     *   this.addDrawing(Resources.TxPlayer.asSprite());
     * }
     * ```
     *
     * ### Working with Animations
     *
     * A [[SpriteSheet]] holds a collection of sprites from a single [[Texture]].
     * Use [[SpriteSheet.getAnimationForAll]] to easily generate an [[Animation]].
     *
     * ```ts
     * // assume Resources.TxPlayerIdle is a texture containing several frames of an animation
     *
     * public onInitialize(engine: ex.Engine) {
     *
     *   // create a SpriteSheet for the animation
     *   var playerIdleSheet = new ex.SpriteSheet(Resources.TxPlayerIdle, 5, 1, 80, 80);
     *
     *   // create an animation
     *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(engine, 120);
     *
     *   // the first drawing is always the current
     *   this.addDrawing("idle", playerIdleAnimation);
     * }
     * ```
     *
     * ### Custom drawing
     *
     * You can always override the default drawing logic for an actor in the [[draw]] method,
     * for example, to draw complex shapes or to use the raw
     * [[https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D|Canvas API]].
     *
     * Usually you should call `super.draw` to perform the base drawing logic, but other times
     * you may want to take over the drawing completely.
     *
     * ```ts
     * public draw(ctx: Canvas2DRenderingContext, delta: number) {
     *
     *   super.draw(ctx, delta); // perform base drawing logic
     *
     *   // custom drawing
     *   ctx.lineTo(...);
     * }
     * ```
     *
     * ## Actions
     *
     * You can use the [[ActionContext|Action API]] to create chains of
     * actions and script actors into doing your bidding for your game.
     *
     * Actions can be simple or can be chained together to create complex
     * AI routines. In the future, it will be easier to create timelines or
     * scripts to run depending on the state of your actor, such as an
     * enemy ship that is Guarding a path and then is Alerted when a Player
     * draws near.
     *
     * Learn more about the [[ActionContext|Action API]].
     *
     * ## Collision Detection
     *
     * By default Actors do not participate in collisions. If you wish to make
     * an actor participate, you need to switch from the default [[CollisionType.PreventCollision|prevent collision]]
     * to [[CollisionType.Active|active]], [[CollisionType.Fixed|fixed]], or [[CollisionType.Passive|passive]] collision type.
     *
     * ```ts
     * public Player extends ex.Actor {
     *   constructor() {
     *     super();
     *     // set preferred CollisionType
     *     this.collisionType = ex.CollisionType.Active;
     *   }
     * }
     *
     * // or set the collisionType
     *
     * var actor = new ex.Actor();
     * actor.collisionType = ex.CollisionType.Active;
     *
     * ```
     * ### Collision Groups
     * TODO, needs more information.
     *
     * ## Traits
     *
     * Traits describe actor behavior that occurs every update. If you wish to build a generic behavior
     * without needing to extend every actor you can do it with a trait, a good example of this may be
     * plugging in an external collision detection library like [[https://github.com/kripken/box2d.js/|Box2D]] or
     * [[http://wellcaffeinated.net/PhysicsJS/|PhysicsJS]] by wrapping it in a trait. Removing traits can also make your
     * actors more efficient.
     *
     * Default traits provided by Excalibur are [[Traits.CapturePointer|pointer capture]],
     * [[Traits.CollisionDetection|tile map collision]], [[Traits.Movement|Euler style movement]],
     * and [[Traits.OffscreenCulling|offscreen culling]].
     *
     *
     * ## Known Issues
     *
     * **Actor bounding boxes do not rotate**
     * [Issue #68](https://github.com/excaliburjs/Excalibur/issues/68)
     *
     */
    class Actor extends ex.Class implements IActionable, IEvented {
        /**
         * Indicates the next id to be set
         */
        static maxId: number;
        /**
         * The unique identifier for the actor
         */
        id: number;
        /**
         * The physics body the is associated with this actor. The body is the container for all physical properties, like position, velocity,
         * acceleration, mass, inertia, etc.
         */
        body: Body;
        /**
         * Gets the collision area shape to use for collision possible options are [CircleArea|circles], [PolygonArea|polygons], and
         * [EdgeArea|edges].
         */
        /**
         * Gets the collision area shape to use for collision possible options are [CircleArea|circles], [PolygonArea|polygons], and
         * [EdgeArea|edges].
         */
        collisionArea: ICollisionArea;
        /**
         * Gets the x position of the actor relative to it's parent (if any)
         */
        /**
         * Sets the x position of the actor relative to it's parent (if any)
         */
        x: number;
        /**
         * Gets the y position of the actor relative to it's parent (if any)
         */
        /**
         * Sets the y position of the actor relative to it's parent (if any)
         */
        y: number;
        /**
         * Gets the position vector of the actor in pixels
         */
        /**
         * Sets the position vector of the actor in pixels
         */
        pos: Vector;
        /**
         * Gets the position vector of the actor from the last frame
         */
        /**
         * Sets the position vector of the actor in the last frame
         */
        oldPos: Vector;
        /**
         * Gets the velocity vector of the actor in pixels/sec
         */
        /**
         * Sets the velocity vector of the actor in pixels/sec
         */
        vel: Vector;
        /**
         * Gets the velocity vector of the actor from the last frame
         */
        /**
         * Sets the velocity vector of the actor from the last frame
         */
        oldVel: Vector;
        /**
         * Gets the acceleration vector of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may be
         * useful to simulate a gravitational effect.
         */
        /**
         * Sets the acceleration vector of teh actor in pixels/second/second
         */
        acc: Vector;
        /**
         * Gets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
         */
        /**
         * Sets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
         */
        rotation: number;
        /**
         * Gets the rotational velocity of the actor in radians/second
         */
        /**
         * Sets the rotational velocity of the actor in radians/sec
         */
        rx: number;
        /**
         * Gets the current torque applied to the actor. Torque can be thought of as rotational force
         */
        /**
         * Sets the current torque applied to the actor. Torque can be thought of as rotational force
         */
        torque: number;
        /**
         * Get the current mass of the actor, mass can be thought of as the resistance to acceleration.
         */
        /**
         * Sets the mass of the actor, mass can be thought of as the resistance to acceleration.
         */
        mass: number;
        /**
         * Gets the current momemnt of inertia, moi can be thought of as the resistance to rotation.
         */
        /**
         * Sets the current momemnt of inertia, moi can be thought of as the resistance to rotation.
         */
        moi: number;
        /**
         * Gets the coefficient of friction on this actor, this can be thought of as how sticky or slippery an object is.
         */
        /**
         * Sets the coefficient of friction of this actor, this can ve thought of as how stick or slippery an object is.
         */
        friction: number;
        /**
         * Gets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
         * as bounciness.
         */
        /**
         * Sets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
         * as bounciness.
         */
        restitution: number;
        /**
         * The anchor to apply all actor related transformations like rotation,
         * translation, and rotation. By default the anchor is in the center of
         * the actor. By default it is set to the center of the actor (.5, .5)
         *
         * An anchor of (.5, .5) will ensure that drawings are centered.
         *
         * Use `anchor.setTo` to set the anchor to a different point using
         * values between 0 and 1. For example, anchoring to the top-left would be
         * `Actor.anchor.setTo(0, 0)` and top-right would be `Actor.anchor.setTo(0, 1)`.
         */
        anchor: Vector;
        private _height;
        private _width;
        /**
         * Collision maintenance
         */
        private _collisionContacts;
        private _totalMtv;
        /**
         * The scale vector of the actor
         */
        scale: ex.Vector;
        /**
         * The x scalar velocity of the actor in scale/second
         */
        sx: number;
        /**
         * The y scalar velocity of the actor in scale/second
         */
        sy: number;
        /**
         * Indicates whether the actor is physically in the viewport
         */
        isOffScreen: boolean;
        /**
         * The visibility of an actor
         */
        visible: boolean;
        /**
         * The opacity of an actor. Passing in a color in the [[constructor]] will use the
         * color's opacity.
         */
        opacity: number;
        previousOpacity: number;
        /**
         * Direct access to the actor's [[ActionQueue]]. Useful if you are building custom actions.
         */
        actionQueue: ex.Internal.Actions.ActionQueue;
        /**
         * [[ActionContext|Action context]] of the actor. Useful for scripting actor behavior.
         */
        actions: ActionContext;
        /**
         * Convenience reference to the global logger
         */
        logger: Logger;
        /**
         * The scene that the actor is in
         */
        scene: Scene;
        /**
         * The parent of this actor
         */
        parent: Actor;
        /**
         * The children of this actor
         */
        children: Actor[];
        /**
         * Gets or sets the current collision type of this actor. By
         * default it is ([[CollisionType.PreventCollision]]).
         */
        collisionType: CollisionType;
        collisionGroups: string[];
        private _collisionHandlers;
        private _isInitialized;
        frames: {
            [key: string]: IDrawable;
        };
        private _framesDirty;
        /**
         * Access to the current drawing for the actor, this can be
         * an [[Animation]], [[Sprite]], or [[Polygon]].
         * Set drawings with [[setDrawing]].
         */
        currentDrawing: IDrawable;
        /**
         * Modify the current actor update pipeline.
         */
        traits: IActorTrait[];
        /**
         * Sets the color of the actor. A rectangle of this color will be
         * drawn if no [[IDrawable]] is specified as the actors drawing.
         *
         * The default is `null` which prevents a rectangle from being drawn.
         */
        color: Color;
        /**
         * Whether or not to enable the [[CapturePointer]] trait that propogates
         * pointer events to this actor
         */
        enableCapturePointer: boolean;
        /**
         * Configuration for [[CapturePointer]] trait
         */
        capturePointer: Traits.ICapturePointerConfig;
        private _zIndex;
        private _isKilled;
        private _opacityFx;
        /**
         * @param x       The starting x coordinate of the actor
         * @param y       The starting y coordinate of the actor
         * @param width   The starting width of the actor
         * @param height  The starting height of the actor
         * @param color   The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
         * initial [[opacity]].
         */
        constructor(x?: number, y?: number, width?: number, height?: number, color?: Color);
        /**
         * This is called before the first update of the actor. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         */
        onInitialize(engine: Engine): void;
        private _checkForPointerOptIn(eventName);
        on(eventName: ex.Events.kill, handler: (event?: KillEvent) => void): any;
        on(eventName: ex.Events.initialize, handler: (event?: InitializeEvent) => void): any;
        on(eventName: ex.Events.preupdate, handler: (event?: PreUpdateEvent) => void): any;
        on(eventName: ex.Events.postupdate, handler: (event?: PostUpdateEvent) => void): any;
        on(eventName: ex.Events.predraw, handler: (event?: PreDrawEvent) => void): any;
        on(eventName: ex.Events.postdraw, handler: (event?: PostDrawEvent) => void): any;
        on(eventName: ex.Events.predebugdraw, handler: (event?: PreDebugDrawEvent) => void): any;
        on(eventName: ex.Events.postdebugdraw, handler: (event?: PostDebugDrawEvent) => void): any;
        on(eventName: ex.Events.pointerup, handler: (event?: PointerEvent) => void): any;
        on(eventName: ex.Events.pointerdown, handler: (event?: PointerEvent) => void): any;
        on(eventName: ex.Events.pointermove, handler: (event?: PointerEvent) => void): any;
        on(eventName: ex.Events.pointercancel, handler: (event?: PointerEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        /**
         * If the current actor is a member of the scene, this will remove
         * it from the scene graph. It will no longer be drawn or updated.
         */
        kill(): void;
        /**
         * If the current actor is killed, it will now not be killed.
         */
        unkill(): void;
        /**
         * Indicates wether the actor has been killed.
         */
        isKilled(): boolean;
        /**
         * Adds a child actor to this actor. All movement of the child actor will be
         * relative to the parent actor. Meaning if the parent moves the child will
         * move with it.
         * @param actor The child actor to add
         */
        add(actor: Actor): void;
        /**
         * Removes a child actor from this actor.
         * @param actor The child actor to remove
         */
        remove(actor: Actor): void;
        /**
         * Sets the current drawing of the actor to the drawing corresponding to
         * the key.
         * @param key The key of the drawing
         */
        setDrawing(key: string): any;
        /**
         * Sets the current drawing of the actor to the drawing corresponding to
         * an `enum` key (e.g. `Animations.Left`)
         * @param key The `enum` key of the drawing
         */
        setDrawing(key: number): any;
        /**
         * Add minimum translation vectors accumulated during the current frame to resolve collisons.
         */
        addMtv(mtv: Vector): void;
        /**
         * Applies the accumulated translation vectors to the actors position
         */
        applyMtv(): void;
        /**
         * Adds a whole texture as the "default" drawing. Set a drawing using [[setDrawing]].
         */
        addDrawing(texture: Texture): any;
        /**
         * Adds a whole sprite as the "default" drawing. Set a drawing using [[setDrawing]].
         */
        addDrawing(sprite: Sprite): any;
        /**
         * Adds a drawing to the list of available drawings for an actor. Set a drawing using [[setDrawing]].
         * @param key     The key to associate with a drawing for this actor
         * @param drawing This can be an [[Animation]], [[Sprite]], or [[Polygon]].
         */
        addDrawing(key: any, drawing: IDrawable): any;
        z: number;
        /**
         * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
         * Actors with a higher z-index are drawn on top of actors with a lower z-index
         */
        getZIndex(): number;
        /**
         * Sets the z-index of an actor and updates it in the drawing list for the scene.
         * The z-index determines the relative order an actor is drawn in.
         * Actors with a higher z-index are drawn on top of actors with a lower z-index
         * @param actor The child actor to remove
         */
        setZIndex(newIndex: number): void;
        /**
         * Adds an actor to a collision group. Actors with no named collision groups are
         * considered to be in every collision group.
         *
         * Once in a collision group(s) actors will only collide with other actors in
         * that group.
         *
         * @param name The name of the collision group
         */
        addCollisionGroup(name: string): void;
        /**
         * Removes an actor from a collision group.
         * @param name The name of the collision group
         */
        removeCollisionGroup(name: string): void;
        /**
         * Calculates the unique pair hash between two actors
         * @param other
         */
        calculatePairHash(other: Actor): string;
        /**
         * Get the center point of an actor
         */
        getCenter(): Vector;
        /**
         * Gets the calculated width of an actor, factoring in scale
         */
        getWidth(): number;
        /**
         * Sets the width of an actor, factoring in the current scale
         */
        setWidth(width: any): void;
        /**
         * Gets the calculated height of an actor, factoring in scale
         */
        getHeight(): number;
        /**
         * Sets the height of an actor, factoring in the current scale
         */
        setHeight(height: any): void;
        /**
         * Gets the left edge of the actor
         */
        getLeft(): number;
        /**
         * Gets the right edge of the actor
         */
        getRight(): number;
        /**
         * Gets the top edge of the actor
         */
        getTop(): number;
        /**
         * Gets the bottom edge of the actor
         */
        getBottom(): number;
        /**
         * Gets this actor's rotation taking into account any parent relationships
         *
         * @returns Rotation angle in radians
         */
        getWorldRotation(): number;
        /**
         * Gets an actor's world position taking into account parent relationships, scaling, rotation, and translation
         *
         * @returns Position in world coordinates
         */
        getWorldPos(): Vector;
        /**
         * Gets the global scale of the Actor
         */
        getGlobalScale(): Vector;
        /**
         * Returns the actor's [[BoundingBox]] calculated for this instant in world space.
         */
        getBounds(): BoundingBox;
        /**
         * Returns the actor's [[BoundingBox]] relative to the actors position.
         */
        getRelativeBounds(): BoundingBox;
        /**
         * Tests whether the x/y specified are contained in the actor
         * @param x  X coordinate to test (in world coordinates)
         * @param y  Y coordinate to test (in world coordinates)
         * @param recurse checks whether the x/y are contained in any child actors (if they exist).
         */
        contains(x: number, y: number, recurse?: boolean): boolean;
        /**
         * Returns the side of the collision based on the intersection
         * @param intersect The displacement vector returned by a collision
         */
        getSideFromIntersect(intersect: Vector): Side;
        /**
         * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
         * @param actor The other actor to test
         */
        collidesWithSide(actor: Actor): Side;
        /**
         * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
         * `null` when there is no collision;
         * @param actor The other actor to test
         */
        collides(actor: Actor): Vector;
        /**
         * Register a handler to fire when this actor collides with another in a specified group
         * @param group The group name to listen for
         * @param func The callback to fire on collision with another actor from the group. The callback is passed the other actor.
         */
        onCollidesWith(group: string, func: (actor: Actor) => void): void;
        getCollisionHandlers(): {
            [key: string]: {
                (actor: Actor): void;
            }[];
        };
        /**
         * Removes all collision handlers for this group on this actor
         * @param group Group to remove all handlers for on this actor.
         */
        removeCollidesWith(group: string): void;
        /**
         * Returns true if the two actors are less than or equal to the distance specified from each other
         * @param actor     Actor to test
         * @param distance  Distance in pixels to test
         */
        within(actor: Actor, distance: number): boolean;
        private _getCalculatedAnchor();
        /**
         * Perform euler integration at the specified time step
         */
        integrate(delta: number): void;
        /**
         * Called by the Engine, updates the state of the actor
         * @param engine The reference to the current game engine
         * @param delta  The time elapsed since the last update in milliseconds
         */
        update(engine: Engine, delta: number): void;
        /**
         * Called by the Engine, draws the actor to the screen
         * @param ctx   The rendering context
         * @param delta The time since the last draw in milliseconds
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Called by the Engine, draws the actors debugging to the screen
         * @param ctx The rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * An enum that describes the types of collisions actors can participate in
     */
    enum CollisionType {
        /**
         * Actors with the `PreventCollision` setting do not participate in any
         * collisions and do not raise collision events.
         */
        PreventCollision = 0,
        /**
         * Actors with the `Passive` setting only raise collision events, but are not
         * influenced or moved by other actors and do not influence or move other actors.
         */
        Passive = 1,
        /**
         * Actors with the `Active` setting raise collision events and participate
         * in collisions with other actors and will be push or moved by actors sharing
         * the `Active` or `Fixed` setting.
         */
        Active = 2,
        /**
         * Actors with the `Elastic` setting will behave the same as `Active`, except that they will
         * "bounce" in the opposite direction given their velocity dx/dy. This is a naive implementation meant for
         * prototyping, for a more robust elastic collision listen to the "collision" event and perform your custom logic.
         * @obsolete This behavior will be handled by a future physics system
         */
        Elastic = 3,
        /**
         * Actors with the `Fixed` setting raise collision events and participate in
         * collisions with other actors. Actors with the `Fixed` setting will not be
         * pushed or moved by other actors sharing the `Fixed`. Think of Fixed
         * actors as "immovable/onstoppable" objects. If two `Fixed` actors meet they will
         * not be pushed or moved by each other, they will not interact except to throw
         * collision events.
         */
        Fixed = 4,
    }
}
declare module ex {
    /**
     * Logging level that Excalibur will tag
     */
    enum LogLevel {
        Debug = 0,
        Info = 1,
        Warn = 2,
        Error = 3,
        Fatal = 4,
    }
    /**
     * Static singleton that represents the logging facility for Excalibur.
     * Excalibur comes built-in with a [[ConsoleAppender]] and [[ScreenAppender]].
     * Derive from [[IAppender]] to create your own logging appenders.
     *
     * ## Example: Logging
     *
     * ```js
     * // set default log level (default: Info)
     * ex.Logger.getInstance().defaultLevel = ex.LogLevel.Warn;
     *
     * // this will not be shown because it is below Warn
     * ex.Logger.getInstance().info("This will be logged as Info");
     * // this will show because it is Warn
     * ex.Logger.getInstance().warn("This will be logged as Warn");
     * // this will show because it is above Warn
     * ex.Logger.getInstance().error("This will be logged as Error");
     * // this will show because it is above Warn
     * ex.Logger.getInstance().fatal("This will be logged as Fatal");
     * ```
     */
    class Logger {
        private static _instance;
        private _appenders;
        constructor();
        /**
         * Gets or sets the default logging level. Excalibur will only log
         * messages if equal to or above this level. Default: [[LogLevel.Info]]
         */
        defaultLevel: LogLevel;
        /**
         * Gets the current static instance of Logger
         */
        static getInstance(): Logger;
        /**
         * Adds a new [[IAppender]] to the list of appenders to write to
         */
        addAppender(appender: IAppender): void;
        /**
         * Clears all appenders from the logger
         */
        clearAppenders(): void;
        /**
         * Logs a message at a given LogLevel
         * @param level  The LogLevel`to log the message at
         * @param args   An array of arguments to write to an appender
         */
        private _log(level, args);
        /**
         * Writes a log message at the [[LogLevel.Debug]] level
         * @param args  Accepts any number of arguments
         */
        debug(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Info]] level
         * @param args  Accepts any number of arguments
         */
        info(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Warn]] level
         * @param args  Accepts any number of arguments
         */
        warn(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Error]] level
         * @param args  Accepts any number of arguments
         */
        error(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Fatal]] level
         * @param args  Accepts any number of arguments
         */
        fatal(...args: any[]): void;
    }
    /**
     * Contract for any log appender (such as console/screen)
     */
    interface IAppender {
        /**
         * Logs a message at the given [[LogLevel]]
         * @param level  Level to log at
         * @param args   Arguments to log
         */
        log(level: LogLevel, args: any[]): void;
    }
    /**
     * Console appender for browsers (i.e. `console.log`)
     */
    class ConsoleAppender implements IAppender {
        /**
         * Logs a message at the given [[LogLevel]]
         * @param level  Level to log at
         * @param args   Arguments to log
         */
        log(level: LogLevel, args: any[]): void;
    }
    /**
     * On-screen (canvas) appender
     */
    class ScreenAppender implements IAppender {
        private _messages;
        private _canvas;
        private _ctx;
        /**
         * @param width   Width of the screen appender in pixels
         * @param height  Height of the screen appender in pixels
         */
        constructor(width?: number, height?: number);
        /**
         * Logs a message at the given [[LogLevel]]
         * @param level  Level to log at
         * @param args   Arguments to log
         */
        log(level: LogLevel, args: any[]): void;
    }
}
declare module ex.Events {
    type kill = 'kill';
    type predraw = 'predraw';
    type postdraw = 'postdraw';
    type predebugdraw = 'predebugdraw';
    type postdebugdraw = 'postdebugdraw';
    type preupdate = 'preupdate';
    type postupdate = 'postupdate';
    type collision = 'collision';
    type initialize = 'initialize';
    type activate = 'activate';
    type deactivate = 'deactivate';
    type exitviewport = 'exitviewport';
    type enterviewport = 'enterviewport';
    type connect = 'connect';
    type disconnect = 'disconnect';
    type button = 'button';
    type axis = 'axis';
    type subscribe = 'subscribe';
    type unsubscribe = 'unsubscribe';
    type visible = 'visible';
    type hidden = 'hidden';
    type start = 'start';
    type stop = 'stop';
    type pointerup = 'pointerup';
    type pointerdown = 'pointerdown';
    type pointermove = 'pointermove';
    type pointercancel = 'pointercancel';
    type up = 'up';
    type down = 'down';
    type move = 'move';
    type cancel = 'cancel';
    type press = 'press';
    type release = 'release';
    type hold = 'hold';
}
declare module ex {
    /**
     * Base event type in Excalibur that all other event types derive from. Not all event types are thrown on all Excalibur game objects,
     * some events are unique to a type, others are not.
     *
     * Excalibur events follow the convention that the name of the thrown event for listening will be the same as the Event object in all
     * lower case with the 'Event' suffix removed.
     *
     * For example:
     * - PreDrawEvent event object and "predraw" as the event name
     *
     * ```typescript
     *
     * actor.on('predraw', (evtObj: PreDrawEvent) => {
     *    // do some pre drawing
     * })
     *
     * ```
     *
     */
    class GameEvent {
        /**
         * Target object for this event.
         */
        target: any;
    }
    /**
     * The 'kill' event is emitted on actors when it is killed. The target is the actor that was killed.
     */
    class KillEvent extends GameEvent {
        target: any;
        constructor(target: any);
    }
    /**
     * The 'start' event is emitted on engine when has started and is ready for interaction.
     */
    class GameStartEvent extends GameEvent {
        target: any;
        constructor(target: any);
    }
    /**
     * The 'stop' event is emitted on engine when has been stopped and will no longer take input, update or draw.
     */
    class GameStopEvent extends GameEvent {
        target: any;
        constructor(target: any);
    }
    /**
     * The 'predraw' event is emitted on actors, scenes, and engine before drawing starts. Actors' predraw happens inside their graphics
     * transform so that all drawing takes place with the actor as the origin.
     *
     */
    class PreDrawEvent extends GameEvent {
        ctx: CanvasRenderingContext2D;
        delta: any;
        target: any;
        constructor(ctx: CanvasRenderingContext2D, delta: any, target: any);
    }
    /**
     * The 'postdraw' event is emitted on actors, scenes, and engine after drawing finishes. Actors' postdraw happens inside their graphics
     * transform so that all drawing takes place with the actor as the origin.
     *
     */
    class PostDrawEvent extends GameEvent {
        ctx: CanvasRenderingContext2D;
        delta: any;
        target: any;
        constructor(ctx: CanvasRenderingContext2D, delta: any, target: any);
    }
    /**
     * The 'predebugdraw' event is emitted on actors, scenes, and engine before debug drawing starts.
     */
    class PreDebugDrawEvent extends GameEvent {
        ctx: CanvasRenderingContext2D;
        target: any;
        constructor(ctx: CanvasRenderingContext2D, target: any);
    }
    /**
     * The 'postdebugdraw' event is emitted on actors, scenes, and engine after debug drawing starts.
     */
    class PostDebugDrawEvent extends GameEvent {
        ctx: CanvasRenderingContext2D;
        target: any;
        constructor(ctx: CanvasRenderingContext2D, target: any);
    }
    /**
     * The 'preupdate' event is emitted on actors, scenes, and engine before the update starts.
     */
    class PreUpdateEvent extends GameEvent {
        engine: Engine;
        delta: any;
        target: any;
        constructor(engine: Engine, delta: any, target: any);
    }
    /**
     * The 'postupdate' event is emitted on actors, scenes, and engine after the update ends. This is equivalent to the obsolete 'update'
     * event.
     */
    class PostUpdateEvent extends GameEvent {
        engine: Engine;
        delta: any;
        target: any;
        constructor(engine: Engine, delta: any, target: any);
    }
    /**
     * Event received when a gamepad is connected to Excalibur. [[Input.Gamepads|engine.input.gamepads]] receives this event.
     */
    class GamepadConnectEvent extends GameEvent {
        index: number;
        gamepad: ex.Input.Gamepad;
        constructor(index: number, gamepad: ex.Input.Gamepad);
    }
    /**
     * Event received when a gamepad is disconnected from Excalibur. [[Input.Gamepads|engine.input.gamepads]] receives this event.
     */
    class GamepadDisconnectEvent extends GameEvent {
        index: number;
        constructor(index: number);
    }
    /**
     * Gamepad button event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
     */
    class GamepadButtonEvent extends ex.GameEvent {
        button: ex.Input.Buttons;
        value: number;
        /**
         * @param button  The Gamepad button
         * @param value   A numeric value between 0 and 1
         */
        constructor(button: ex.Input.Buttons, value: number);
    }
    /**
     * Gamepad axis event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
     */
    class GamepadAxisEvent extends ex.GameEvent {
        axis: ex.Input.Axes;
        value: number;
        /**
         * @param axis  The Gamepad axis
         * @param value A numeric value between -1 and 1
         */
        constructor(axis: ex.Input.Axes, value: number);
    }
    /**
     * Subscribe event thrown when handlers for events other than subscribe are added. Meta event that is received by
     * [[EventDispatcher|event dispatchers]].
     */
    class SubscribeEvent extends GameEvent {
        topic: string;
        handler: (event?: GameEvent) => void;
        constructor(topic: string, handler: (event?: GameEvent) => void);
    }
    /**
     * Unsubscribe event thrown when handlers for events other than unsubscribe are removed. Meta event that is received by
     * [[EventDispatcher|event dispatchers]].
     */
    class UnsubscribeEvent extends GameEvent {
        topic: string;
        handler: (event?: GameEvent) => void;
        constructor(topic: string, handler: (event?: GameEvent) => void);
    }
    /**
     * Event received by the [[Engine]] when the browser window is visible on a screen.
     */
    class VisibleEvent extends GameEvent {
        constructor();
    }
    /**
     * Event received by the [[Engine]] when the browser window is hidden from all screens.
     */
    class HiddenEvent extends GameEvent {
        constructor();
    }
    /**
     * Event thrown on an [[Actor|actor]] when a collision has occured
     */
    class CollisionEvent extends GameEvent {
        actor: Actor;
        other: Actor;
        side: Side;
        intersection: Vector;
        /**
         * @param actor  The actor the event was thrown on
         * @param other  The actor that was collided with
         * @param side   The side that was collided with
         */
        constructor(actor: Actor, other: Actor, side: Side, intersection: Vector);
    }
    /**
     * Event thrown on an [[Actor]] and a [[Scene]] only once before the first update call
     */
    class InitializeEvent extends GameEvent {
        engine: Engine;
        /**
         * @param engine  The reference to the current engine
         */
        constructor(engine: Engine);
    }
    /**
     * Event thrown on a [[Scene]] on activation
     */
    class ActivateEvent extends GameEvent {
        oldScene: Scene;
        /**
         * @param oldScene  The reference to the old scene
         */
        constructor(oldScene: Scene);
    }
    /**
     * Event thrown on a [[Scene]] on deactivation
     */
    class DeactivateEvent extends GameEvent {
        newScene: Scene;
        /**
         * @param newScene  The reference to the new scene
         */
        constructor(newScene: Scene);
    }
    /**
     * Event thrown on an [[Actor]] when it completely leaves the screen.
     */
    class ExitViewPortEvent extends GameEvent {
        constructor();
    }
    /**
     * Event thrown on an [[Actor]] when it completely leaves the screen.
     */
    class EnterViewPortEvent extends GameEvent {
        constructor();
    }
}
declare module ex {
    /**
     * Excalibur's internal event dispatcher implementation.
     * Callbacks are fired immediately after an event is published.
     * Typically you will use [[Class.eventDispatcher]] since most classes in
     * Excalibur inherit from [[Class]]. You will rarely create an `EventDispatcher`
     * yourself.
     *
     * When working with events, be sure to keep in mind the order of subscriptions
     * and try not to create a situation that requires specific things to happen in
     * order. Events are best used for input events, tying together disparate objects,
     * or for UI updates.
     *
     * ## Example: Actor events
     *
     * Actors implement an EventDispatcher ([[Actor.eventDispatcher]]) so they can
     * send and receive events. For example, they can enable Pointer events (mouse/touch)
     * and you can respond to them by subscribing to the event names.
     *
     * You can also emit any other kind of event for your game just by using a custom
     * `string` value and implementing a class that inherits from [[GameEvent]].
     *
     * ```js
     * var player = new ex.Actor(...);
     *
     * // Enable pointer events for this actor
     * player.enableCapturePointer = true;
     *
     * // subscribe to pointerdown event
     * player.on("pointerdown", function (evt: ex.Input.PointerEvent) {
     *   console.log("Player was clicked!");
     * });
     *
     * // turn off subscription
     * player.off("pointerdown");
     *
     * // subscribe to custom event
     * player.on("death", function (evt) {
     *   console.log("Player died:", evt);
     * });
     *
     * // trigger custom event
     * player.emit("death", new DeathEvent());
     *
     * ```
     *
     * ## Example: Pub/Sub with Excalibur
     *
     * You can also create an EventDispatcher for any arbitrary object, for example
     * a global game event aggregator (shown below as `vent`). Anything in your game can subscribe to
     * it, if the event aggregator is in the global scope.
     *
     * *Warning:* This can easily get out of hand. Avoid this usage, it just serves as
     * an example.
     *
     * ```js
     * // create a publisher on an empty object
     * var vent = new ex.EventDispatcher({});
     *
     * // handler for an event
     * var subscription = function (event) {
     *   console.log(event);
     * }
     *
     * // add a subscription
     * vent.on("someevent", subscription);
     *
     * // publish an event somewhere in the game
     * vent.emit("someevent", new ex.GameEvent());
     * ```
     */
    class EventDispatcher implements IEvented {
        private _handlers;
        private _wiredEventDispatchers;
        private _target;
        private _log;
        /**
         * @param target  The object that will be the recipient of events from this event dispatcher
         */
        constructor(target: any);
        /**
         * Emits an event for target
         * @param eventName  The name of the event to publish
         * @param event      Optionally pass an event data object to the handler
         */
        emit(eventName: string, event?: GameEvent): void;
        /**
         * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
         * @param eventName  The name of the event to subscribe to
         * @param handler    The handler callback to fire on this event
         */
        on(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * Unsubscribe an event handler(s) from an event. If a specific handler
         * is specified for an event, only that handler will be unsubscribed.
         * Otherwise all handlers will be unsubscribed for that event.
         *
         * @param eventName  The name of the event to unsubscribe
         * @param handler    Optionally the specific handler to unsubscribe
         *
         */
        off(eventName: string, handler?: (event?: GameEvent) => void): void;
        /**
         * Wires this event dispatcher to also recieve events from another
         */
        wire(eventDispatcher: EventDispatcher): void;
        /**
         * Unwires this event dispatcher from another
         */
        unwire(eventDispatcher: EventDispatcher): void;
    }
}
declare module ex {
    /**
     * Provides standard colors (e.g. [[Color.Black]])
     * but you can also create custom colors using RGB, HSL, or Hex. Also provides
     * useful color operations like [[Color.lighten]], [[Color.darken]], and more.
     *
     * ## Creating colors
     *
     * ```js
     * // RGBA
     * new ex.Color(r, g, b, a);
     * ex.Color.fromRGB(r, g, b, a);
     *
     * // HSLA
     * ex.Color.fromHSL(h, s, l, a);
     *
     * // Hex, alpha optional
     * ex.Color.fromHex("#000000");
     * ex.Color.fromHex("#000000FF");
     * ```
     *
     * ## Working with colors
     *
     * Since Javascript does not support structs, if you change a color "constant" like [[Color.Black]]
     * it will change it across the entire game. You can safely use the color operations
     * like [[Color.lighten]] and [[Color.darken]] because they `clone` the color to
     * return a new color. However, be aware that this can use up memory if used excessively.
     *
     * Just be aware that if you directly alter properties (i.e. [[Color.r]], etc.) , this will change it
     * for all the code that uses that instance of Color.
     */
    class Color {
        /**
         * Black (#000000)
         */
        static Black: Color;
        /**
         * White (#FFFFFF)
         */
        static White: Color;
        /**
         * Gray (#808080)
         */
        static Gray: Color;
        /**
         * Light gray (#D3D3D3)
         */
        static LightGray: Color;
        /**
         * Dark gray (#A9A9A9)
         */
        static DarkGray: Color;
        /**
         * Yellow (#FFFF00)
         */
        static Yellow: Color;
        /**
         * Orange (#FFA500)
         */
        static Orange: Color;
        /**
         * Red (#FF0000)
         */
        static Red: Color;
        /**
         * Vermillion (#FF5B31)
         */
        static Vermillion: Color;
        /**
         * Rose (#FF007F)
         */
        static Rose: Color;
        /**
         * Magenta (#FF00FF)
         */
        static Magenta: Color;
        /**
         * Violet (#7F00FF)
         */
        static Violet: Color;
        /**
         * Blue (#0000FF)
         */
        static Blue: Color;
        /**
         * Azure (#007FFF)
         */
        static Azure: Color;
        /**
         * Cyan (#00FFFF)
         */
        static Cyan: Color;
        /**
         * Viridian (#59978F)
         */
        static Viridian: Color;
        /**
         * Green (#00FF00)
         */
        static Green: Color;
        /**
         * Chartreuse (#7FFF00)
         */
        static Chartreuse: Color;
        /**
         * Transparent (#FFFFFF00)
         */
        static Transparent: Color;
        /**
         * Red channel
         */
        r: number;
        /**
         * Green channel
         */
        g: number;
        /**
         * Blue channel
         */
        b: number;
        /**
         * Alpha channel (between 0 and 1)
         */
        a: number;
        /**
         * Hue
         */
        h: number;
        /**
         * Saturation
         */
        s: number;
        /**
         * Lightness
         */
        l: number;
        /**
         * Creates a new instance of Color from an r, g, b, a
         *
         * @param r  The red component of color (0-255)
         * @param g  The green component of color (0-255)
         * @param b  The blue component of color (0-255)
         * @param a  The alpha component of color (0-1.0)
         */
        constructor(r: number, g: number, b: number, a?: number);
        /**
         * Creates a new instance of Color from an r, g, b, a
         *
         * @param r  The red component of color (0-255)
         * @param g  The green component of color (0-255)
         * @param b  The blue component of color (0-255)
         * @param a  The alpha component of color (0-1.0)
         */
        static fromRGB(r: number, g: number, b: number, a?: number): Color;
        /**
         * Creates a new inscance of Color from a hex string
         *
         * @param hex  CSS color string of the form #ffffff, the alpha component is optional
         */
        static fromHex(hex: string): Color;
        /**
         * Creats a new instance of Color from hsla values
         *
         * @param h  Hue is represented [0-1]
         * @param s  Saturation is represented [0-1]
         * @param l  Luminance is represented [0-1]
         * @param a  Alpha is represented [0-1]
         */
        static fromHSL(h: number, s: number, l: number, a?: number): Color;
        /**
         * Lightens the current color by a specified amount
         *
         * @param factor  The amount to lighten by [0-1]
         */
        lighten(factor?: number): Color;
        /**
         * Darkens the current color by a specified amount
         *
         * @param factor  The amount to darken by [0-1]
         */
        darken(factor?: number): Color;
        /**
         * Saturates the current color by a specified amount
         *
         * @param factor  The amount to saturate by [0-1]
         */
        saturate(factor?: number): Color;
        /**
         * Desaturates the current color by a specified amount
         *
         * @param factor  The amount to desaturate by [0-1]
         */
        desaturate(factor?: number): Color;
        /**
         * Multiplies a color by another, results in a darker color
         *
         * @param color  The other color
         */
        mulitiply(color: Color): Color;
        /**
         * Screens a color by another, results in a lighter color
         *
         * @param color  The other color
         */
        screen(color: Color): Color;
        /**
         * Inverts the current color
         */
        invert(): Color;
        /**
         * Averages the current color with another
         *
         * @param color  The other color
         */
        average(color: Color): Color;
        /**
         * Returns a CSS string representation of a color.
         */
        toString(): string;
        /**
         * Returns a CSS string representation of a color.
         */
        fillStyle(): string;
        /**
         * Returns a clone of the current color.
         */
        clone(): Color;
    }
}
declare module ex {
    /**
     * Creates a closed polygon drawing given a list of [[Point]]s.
     *
     * @warning Use sparingly as Polygons are performance intensive
     */
    class Polygon implements IDrawable {
        flipVertical: boolean;
        flipHorizontal: boolean;
        width: number;
        height: number;
        naturalWidth: number;
        naturalHeight: number;
        /**
         * The color to use for the lines of the polygon
         */
        lineColor: Color;
        /**
         * The color to use for the interior of the polygon
         */
        fillColor: Color;
        /**
         * The width of the lines of the polygon
         */
        lineWidth: number;
        /**
         * Indicates whether the polygon is filled or not.
         */
        filled: boolean;
        private _points;
        anchor: Vector;
        rotation: number;
        scale: Vector;
        /**
         * @param points  The vectors to use to build the polygon in order
         */
        constructor(points: Vector[]);
        /**
         * @notimplemented Effects are not supported on `Polygon`
         */
        addEffect(effect: Effects.ISpriteEffect): void;
        /**
         * @notimplemented Effects are not supported on `Polygon`
         */
        removeEffect(index: number): any;
        /**
         * @notimplemented Effects are not supported on `Polygon`
         */
        removeEffect(effect: Effects.ISpriteEffect): any;
        /**
         * @notimplemented Effects are not supported on `Polygon`
         */
        clearEffects(): void;
        reset(): void;
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
    }
}
declare module ex {
    /**
     * Loadables
     *
     * An interface describing loadable resources in Excalibur. Built-in loadable
     * resources include [[Texture]], [[Sound]], and a generic [[Resource]].
     *
     * ## Advanced: Custom loadables
     *
     * You can implement the [[ILoadable]] interface to create your own custom loadables.
     * This is an advanced feature, as the [[Resource]] class already wraps logic around
     * blob/plain data for usages like JSON, configuration, levels, etc through XHR (Ajax).
     *
     * However, as long as you implement the facets of a loadable, you can create your
     * own.
     */
    interface ILoadable {
        /**
         * Begins loading the resource and returns a promise to be resolved on completion
         */
        load(): Promise<any>;
        /**
         * Gets the data that was loaded
         */
        getData(): any;
        /**
         * Sets the data (can be populated from remote request or in-memory data)
         */
        setData(data: any): void;
        /**
         * Processes the downloaded data. Meant to be overridden.
         */
        processData(data: any): any;
        /**
         * Wires engine into loadable to receive game level events
         */
        wireEngine(engine: Engine): void;
        /**
         * onprogress handler
         */
        onprogress: (e: any) => void;
        /**
         * oncomplete handler
         */
        oncomplete: () => void;
        /**
         * onerror handler
         */
        onerror: (e: any) => void;
        /**
         * Returns true if the loadable is loaded
         */
        isLoaded(): boolean;
    }
}
declare module ex {
    /**
     * Generic Resources
     *
     * The [[Resource]] type allows games built in Excalibur to load generic resources.
     * For any type of remote resource it is recommended to use [[Resource]] for preloading.
     *
     * [[Resource]] is an [[ILoadable]] so it can be passed to a [[Loader]] to pre-load before
     * a level or game.
     *
     * Example usages: JSON, compressed files, blobs.
     *
     * ## Pre-loading generic resources
     *
     * ```js
     * var resLevel1 = new ex.Resource("/assets/levels/1.json", "application/json");
     * var loader = new ex.Loader(resLevel1);
     *
     * // attach a handler to process once loaded
     * resLevel1.processData = function (data) {
     *
     *   // process JSON
     *   var json = JSON.parse(data);
     *
     *   // create a new level (inherits Scene) with the JSON configuration
     *   var level = new Level(json);
     *
     *   // add a new scene
     *   game.add(level.name, level);
     * }
     *
     * game.start(loader);
     * ```
     */
    class Resource<T> extends Class implements ILoadable {
        path: string;
        responseType: string;
        bustCache: boolean;
        data: T;
        logger: Logger;
        private _engine;
        /**
         * @param path          Path to the remote resource
         * @param responseType  The Content-Type to expect (e.g. `application/json`)
         * @param bustCache     Whether or not to cache-bust requests
         */
        constructor(path: string, responseType: string, bustCache?: boolean);
        /**
         * Returns true if the Resource is completely loaded and is ready
         * to be drawn.
         */
        isLoaded(): boolean;
        wireEngine(engine: Engine): void;
        private _cacheBust(uri);
        private _start(e);
        /**
         * Begin loading the resource and returns a promise to be resolved on completion
         */
        load(): Promise<T>;
        /**
         * Returns the loaded data once the resource is loaded
         */
        getData(): any;
        /**
         * Sets the data for this resource directly
         */
        setData(data: any): void;
        /**
         * This method is meant to be overriden to handle any additional
         * processing. Such as decoding downloaded audio bits.
         */
        processData(data: T): any;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: (e: any) => void;
    }
}
declare module ex {
    /**
     * Valid states for a promise to be in
     */
    enum PromiseState {
        Resolved = 0,
        Rejected = 1,
        Pending = 2,
    }
    interface IPromise<T> {
        then(successCallback?: (value?: T) => any, rejectCallback?: (value?: T) => any): IPromise<T>;
        error(rejectCallback?: (value?: any) => any): IPromise<T>;
        resolve(value?: T): IPromise<T>;
        reject(value?: any): IPromise<T>;
        state(): PromiseState;
    }
    /**
     * Promises/A+ spec implementation of promises
     *
     * Promises are used to do asynchronous work and they are useful for
     * creating a chain of actions. In Excalibur they are used for loading,
     * sounds, animation, actions, and more.
     *
     * ## A Promise Chain
     *
     * Promises can be chained together and can be useful for creating a queue
     * of functions to be called when something is done.
     *
     * The first [[Promise]] you will encounter is probably [[Engine.start]]
     * which resolves when the game has finished loading.
     *
     * ```js
     * var game = new ex.Engine();
     *
     * // perform start-up logic once game is ready
     * game.start().then(function () {
     *
     *   // start-up & initialization logic
     *
     * });
     * ```
     *
     * ## Handling errors
     *
     * You can optionally pass an error handler to [[Promise.then]] which will handle
     * any errors that occur during Promise execution.
     *
     * ```js
     * var game = new ex.Engine();
     *
     * game.start().then(
     *   // success handler
     *   function () {
     *   },
     *
     *   // error handler
     *   function (err) {
     *   }
     * );
     * ```
     *
     * Any errors that go unhandled will be bubbled up to the browser.
     */
    class Promise<T> implements IPromise<T> {
        private _state;
        private _value;
        private _successCallbacks;
        private _rejectCallback;
        private _errorCallback;
        private _logger;
        /**
         * Wrap a value in a resolved promise
         * @param value  An optional value to wrap in a resolved promise
         */
        static wrap<T>(value?: T): Promise<T>;
        /**
         * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
         * when at least 1 promise rejects.
         */
        static join<T>(promises: Promise<T>[]): any;
        /**
         * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
         * when at least 1 promise rejects.
         */
        static join<T>(...promises: Promise<T>[]): any;
        /**
         * Chain success and reject callbacks after the promise is resovled
         * @param successCallback  Call on resolution of promise
         * @param rejectCallback   Call on rejection of promise
         */
        then(successCallback?: (value?: T) => any, rejectCallback?: (value?: any) => any): this;
        /**
         * Add an error callback to the promise
         * @param errorCallback  Call if there was an error in a callback
         */
        error(errorCallback?: (value?: any) => any): this;
        /**
         * Resolve the promise and pass an option value to the success callbacks
         * @param value  Value to pass to the success callbacks
         */
        resolve(value?: T): Promise<T>;
        /**
         * Reject the promise and pass an option value to the reject callbacks
         * @param value  Value to pass to the reject callbacks
         */
        reject(value?: any): this;
        /**
         * Inpect the current state of a promise
         */
        state(): PromiseState;
        private _handleError(e);
    }
}
declare module ex {
    /**
     * Textures
     *
     * The [[Texture]] object allows games built in Excalibur to load image resources.
     * [[Texture]] is an [[ILoadable]] which means it can be passed to a [[Loader]]
     * to pre-load before starting a level or game.
     *
     * Textures are the raw image so to add a drawing to a game, you must create
     * a [[Sprite]]. You can use [[Texture.asSprite]] to quickly generate a Sprite
     * instance.
     *
     * ## Pre-loading textures
     *
     * Pass the [[Texture]] to a [[Loader]] to pre-load the asset. Once a [[Texture]]
     * is loaded, you can generate a [[Sprite]] with it.
     *
     * ```js
     * var txPlayer = new ex.Texture("/assets/tx/player.png");
     *
     * var loader = new ex.Loader(txPlayer);
     *
     * game.start(loader).then(function () {
     *
     *   var player = new ex.Actor();
     *
     *   player.addDrawing(txPlayer);
     *
     *   game.add(player);
     * });
     * ```
     */
    class Texture extends Resource<HTMLImageElement> {
        path: string;
        bustCache: boolean;
        /**
         * The width of the texture in pixels
         */
        width: number;
        /**
         * The height of the texture in pixels
         */
        height: number;
        /**
         * A [[Promise]] that resolves when the Texture is loaded.
         */
        loaded: Promise<any>;
        private _isLoaded;
        private _sprite;
        /**
         * Populated once loading is complete
         */
        image: HTMLImageElement;
        private _progressCallback;
        private _doneCallback;
        private _errorCallback;
        /**
         * @param path       Path to the image resource
         * @param bustCache  Optionally load texture with cache busting
         */
        constructor(path: string, bustCache?: boolean);
        /**
         * Returns true if the Texture is completely loaded and is ready
         * to be drawn.
         */
        isLoaded(): boolean;
        /**
         * Begins loading the texture and returns a promise to be resolved on completion
         */
        load(): Promise<HTMLImageElement>;
        asSprite(): Sprite;
    }
}
declare module ex {
    /**
     * Represents an audio control implementation
     */
    interface IAudio {
        /**
         * Set the volume (between 0 and 1)
         */
        setVolume(volume: number): any;
        /**
         * Set whether the audio should loop (repeat forever)
         */
        setLoop(loop: boolean): any;
        /**
         * Whether or not any audio is playing
         */
        isPlaying(): boolean;
        /**
         * Will play the sound or resume if paused
         */
        play(): ex.Promise<any>;
        /**
         * Pause the sound
         */
        pause(): any;
        /**
         * Stop playing the sound and reset
         */
        stop(): any;
    }
}
declare module ex {
    /**
     * Represents an audio implementation like [[AudioTag]] or [[WebAudio]]
     */
    interface IAudioImplementation {
        /**
         * XHR response type
         */
        responseType: string;
        /**
         * Processes raw data and transforms into sound data
         */
        processData(data: Blob | ArrayBuffer): ex.Promise<string | AudioBuffer>;
        /**
         * Factory method that returns an instance of a played audio track
         */
        createInstance(data: string | AudioBuffer): IAudio;
    }
}
declare module ex {
    /**
     * An audio implementation for HTML5 audio.
     */
    class AudioTag implements IAudioImplementation {
        responseType: string;
        /**
         * Transforms raw Blob data into a object URL for use in audio tag
         */
        processData(data: Blob): ex.Promise<string>;
        /**
         * Creates a new instance of an audio tag referencing the provided audio URL
         */
        createInstance(url: string): IAudio;
    }
    /**
     * An audio implementation for Web Audio API.
     */
    class WebAudio implements IAudioImplementation {
        private _logger;
        responseType: string;
        /**
         * Processes raw arraybuffer data and decodes into WebAudio buffer (async).
         */
        processData(data: ArrayBuffer): ex.Promise<AudioBuffer>;
        /**
         * Creates a new WebAudio AudioBufferSourceNode to play a sound instance
         */
        createInstance(buffer: AudioBuffer): IAudio;
        private static _unlocked;
        /**
         * Play an empty sound to unlock Safari WebAudio context. Call this function
         * right after a user interaction event. Typically used by [[PauseAfterLoader]]
         * @source https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
         */
        static unlock(): void;
        static isUnlocked(): boolean;
    }
    /**
     * Factory method that gets the audio implementation to use
     */
    function getAudioImplementation(): IAudioImplementation;
    /**
     * Sounds
     *
     * The [[Sound]] object allows games built in Excalibur to load audio
     * components, from soundtracks to sound effects. [[Sound]] is an [[ILoadable]]
     * which means it can be passed to a [[Loader]] to pre-load before a game or level.
     *
     * ## Pre-loading sounds
     *
     * Pass the [[Sound]] to a [[Loader]] to pre-load the asset. Once a [[Sound]]
     * is loaded, you can [[Sound.play|play]] it.
     *
     * ```js
     * // define multiple sources (such as mp3/wav/ogg) as a browser fallback
     * var sndPlayerDeath = new ex.Sound("/assets/snd/player-death.mp3", "/assets/snd/player-death.wav");
     *
     * var loader = new ex.Loader(sndPlayerDeath);
     *
     * game.start(loader).then(function () {
     *
     *   sndPlayerDeath.play();
     * });
     * ```
     */
    class Sound implements ILoadable, IAudio {
        private _logger;
        private _data;
        private _tracks;
        private _isLoaded;
        private _isPaused;
        private _loop;
        private _volume;
        path: string;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: (e: any) => void;
        private _engine;
        private _wasPlayingOnHidden;
        /**
         * Populated once loading is complete
         */
        sound: IAudioImplementation;
        /**
         * Whether or not the browser can play this file as HTML5 Audio
         */
        static canPlayFile(file: string): boolean;
        /**
         * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
         */
        constructor(...paths: string[]);
        wireEngine(engine: Engine): void;
        /**
         * Returns how many instances of the sound are currently playing
         */
        instanceCount(): number;
        /**
         * Sets the volume of the sound clip
         * @param volume  A volume value between 0-1.0
         */
        setVolume(volume: number): void;
        /**
         * Indicates whether the clip should loop when complete
         * @param loop  Set the looping flag
         */
        setLoop(loop: boolean): void;
        /**
         * Whether or not the sound is playing right now
         */
        isPlaying(): boolean;
        /**
         * Play the sound, returns a promise that resolves when the sound is done playing
         */
        play(): ex.Promise<boolean>;
        /**
         * Stop the sound, and do not rewind
         */
        pause(): void;
        /**
         * Stop the sound and rewind
         */
        stop(): void;
        /**
         * Returns true if the sound is loaded
         */
        isLoaded(): boolean;
        /**
         * Begins loading the sound and returns a promise to be resolved on completion
         */
        load(): Promise<IAudioImplementation>;
        private _fetchResource(onload);
        /**
         * Gets the raw sound data (e.g. blob URL or AudioBuffer)
         */
        getData(): any;
        /**
         * Sets raw sound data and returns a Promise that is resolved when sound data is processed
         *
         * @param data The XHR data for the sound implementation to process (Blob or ArrayBuffer)
         */
        setData(data: any): ex.Promise<any>;
        /**
         * Set the raw sound data (e.g. blob URL or AudioBuffer)
         */
        processData(data: any): any;
    }
}
declare module ex {
    /**
     * Helper [[Actor]] primitive for drawing UI's, optimized for UI drawing. Does
     * not participate in collisions. Drawn on top of all other actors.
     */
    class UIActor extends Actor {
        protected _engine: Engine;
        /**
         * @param x       The starting x coordinate of the actor
         * @param y       The starting y coordinate of the actor
         * @param width   The starting width of the actor
         * @param height  The starting height of the actor
         */
        constructor(x?: number, y?: number, width?: number, height?: number);
        onInitialize(engine: Engine): void;
        contains(x: number, y: number, useWorld?: boolean): boolean;
    }
}
declare module ex {
    /**
     * Triggers
     *
     * Triggers are a method of firing arbitrary code on collision. These are useful
     * as 'buttons', 'switches', or to trigger effects in a game. By default triggers
     * are invisible, and can only be seen when [[Engine.isDebug]] is set to `true`.
     *
     * ## Creating a trigger
     *
     * ```js
     * var game = new ex.Game();
     *
     * // create a handler
     * function onTrigger() {
     *
     *   // `this` will be the Trigger instance
     *   ex.Logger.getInstance().info("Trigger was triggered!", this);
     * }
     *
     * // set a trigger at (100, 100) that is 40x40px
     * var trigger = new ex.Trigger(100, 100, 40, 40, onTrigger, 1);
     *
     * // create an actor across from the trigger
     * var actor = new ex.Actor(100, 0, 40, 40, ex.Color.Red);
     *
     * // tell the actor to move towards the trigger over 3 seconds
     * actor.moveTo(100, 200, 3000);
     *
     * game.add(trigger);
     * game.add(actor);
     *
     * game.start();
     * ```
     */
    class Trigger extends Actor {
        private _action;
        repeats: number;
        target: Actor;
        /**
         * @param x       The x position of the trigger
         * @param y       The y position of the trigger
         * @param width   The width of the trigger
         * @param height  The height of the trigger
         * @param action  Callback to fire when trigger is activated, `this` will be bound to the Trigger instance
         * @param repeats The number of times that this trigger should fire, by default it is 1, if -1 is supplied it will fire indefinitely
         */
        constructor(x?: number, y?: number, width?: number, height?: number, action?: () => void, repeats?: number);
        update(engine: Engine, delta: number): void;
        private _dispatchAction();
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
    /**
     * An enum that represents the types of emitter nozzles
     */
    enum EmitterType {
        /**
         * Constant for the circular emitter type
         */
        Circle = 0,
        /**
         * Constant for the rectangular emitter type
         */
        Rectangle = 1,
    }
    /**
     * Particle is used in a [[ParticleEmitter]]
     */
    class Particle {
        position: Vector;
        velocity: Vector;
        acceleration: Vector;
        particleRotationalVelocity: number;
        currentRotation: number;
        focus: Vector;
        focusAccel: number;
        opacity: number;
        beginColor: Color;
        endColor: Color;
        life: number;
        fadeFlag: boolean;
        private _rRate;
        private _gRate;
        private _bRate;
        private _aRate;
        private _currentColor;
        emitter: ParticleEmitter;
        particleSize: number;
        particleSprite: Sprite;
        startSize: number;
        endSize: number;
        sizeRate: number;
        elapsedMultiplier: number;
        constructor(emitter: ParticleEmitter, life?: number, opacity?: number, beginColor?: Color, endColor?: Color, position?: Vector, velocity?: Vector, acceleration?: Vector, startSize?: number, endSize?: number);
        kill(): void;
        update(delta: number): void;
        draw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * Particle Emitters
     *
     * Using a particle emitter is a great way to create interesting effects
     * in your game, like smoke, fire, water, explosions, etc. `ParticleEmitter`
     * extend [[Actor]] allowing you to use all of the features that come with.
     *
     * The easiest way to create a `ParticleEmitter` is to use the
     * [Particle Tester](http://excaliburjs.com/particle-tester/) to generate code for emitters.
     *
     * ## Example: Adding an emitter
     *
     * ```js
     * var actor = new ex.Actor(...);
     * var emitter = new ex.ParticleEmitter(...);
     *
     * emitter.emitterType = ex.EmitterType.Circle; // Shape of emitter nozzle
     * emitter.radius = 5;
     * emitter.minVel = 100;
     * emitter.maxVel = 200;
     * emitter.minAngle = 0;
     * emitter.maxAngle = Math.PI * 2;
     * emitter.emitRate = 300; // 300 particles/second
     * emitter.opacity = 0.5;
     * emitter.fadeFlag = true; // fade particles overtime
     * emitter.particleLife = 1000; // in milliseconds = 1 sec
     * emitter.maxSize = 10; // in pixels
     * emitter.minSize = 1;
     * emitter.particleColor = ex.Color.Rose;
     *
     * // set emitter settings
     * emitter.isEmitting = true;  // should the emitter be emitting
     *
     * // add the emitter as a child actor, it will draw on top of the parent actor
     * // and move with the parent
     * actor.add(emitter);
     *
     * // or, alternatively, add it to the current scene
     * engine.add(emitter);
     * ```
     */
    class ParticleEmitter extends Actor {
        private _particlesToEmit;
        numParticles: number;
        /**
         * Gets or sets the isEmitting flag
         */
        isEmitting: boolean;
        /**
         * Gets or sets the backing particle collection
         */
        particles: Util.Collection<Particle>;
        /**
         * Gets or sets the backing deadParticle collection
         */
        deadParticles: Util.Collection<Particle>;
        /**
         * Gets or sets the minimum partical velocity
         */
        minVel: number;
        /**
         * Gets or sets the maximum partical velocity
         */
        maxVel: number;
        /**
         * Gets or sets the acceleration vector for all particles
         */
        acceleration: Vector;
        /**
         * Gets or sets the minimum angle in radians
         */
        minAngle: number;
        /**
         * Gets or sets the maximum angle in radians
         */
        maxAngle: number;
        /**
         * Gets or sets the emission rate for particles (particles/sec)
         */
        emitRate: number;
        /**
         * Gets or sets the life of each particle in milliseconds
         */
        particleLife: number;
        /**
         * Gets or sets the opacity of each particle from 0 to 1.0
         */
        opacity: number;
        /**
         * Gets or sets the fade flag which causes particles to gradually fade out over the course of their life.
         */
        fadeFlag: boolean;
        /**
         * Gets or sets the optional focus where all particles should accelerate towards
         */
        focus: Vector;
        /**
         * Gets or sets the acceleration for focusing particles if a focus has been specified
         */
        focusAccel: number;
        startSize: number;
        endSize: number;
        /**
         * Gets or sets the minimum size of all particles
         */
        minSize: number;
        /**
         * Gets or sets the maximum size of all particles
         */
        maxSize: number;
        /**
         * Gets or sets the beginning color of all particles
         */
        beginColor: Color;
        /**
         * Gets or sets the ending color of all particles
         */
        endColor: Color;
        /**
         * Gets or sets the sprite that a particle should use
         * @warning Performance intensive
         */
        particleSprite: ex.Sprite;
        /**
         * Gets or sets the emitter type for the particle emitter
         */
        emitterType: ex.EmitterType;
        /**
         * Gets or sets the emitter radius, only takes effect when the [[emitterType]] is [[EmitterType.Circle]]
         */
        radius: number;
        /**
         * Gets or sets the particle rotational speed velocity
         */
        particleRotationalVelocity: number;
        /**
         * Indicates whether particles should start with a random rotation
         */
        randomRotation: boolean;
        /**
         * @param x       The x position of the emitter
         * @param y       The y position of the emitter
         * @param width   The width of the emitter
         * @param height  The height of the emitter
         */
        constructor(x?: number, y?: number, width?: number, height?: number);
        removeParticle(particle: Particle): void;
        /**
         * Causes the emitter to emit particles
         * @param particleCount  Number of particles to emit right now
         */
        emitParticles(particleCount: number): void;
        clearParticles(): void;
        private _createParticle();
        update(engine: Engine, delta: number): void;
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
    /**
     * Animations
     *
     * Animations allow you to display a series of images one after another,
     * creating the illusion of change. Generally these images will come from a [[SpriteSheet]] source.
     *
     * ## Creating an animation
     *
     * Create a [[Texture]] that contains the frames of your animation. Once the texture
     * is [[Loader|loaded]], you can then generate an [[Animation]] by creating a [[SpriteSheet]]
     * and using [[SpriteSheet.getAnimationForAll]].
     *
     * ```js
     * var game = new ex.Engine();
     * var txAnimPlayerIdle = new ex.Texture("/assets/tx/anim-player-idle.png");
     *
     * // load assets
     * var loader = new ex.Loader(txAnimPlayerIdle);
     *
     * // start game
     * game.start(loader).then(function () {
     *   var player = new ex.Actor();
     *
     *   // create sprite sheet with 5 columns, 1 row, 80x80 frames
     *   var playerIdleSheet = new ex.SpriteSheet(txAnimPlayerIdle, 5, 1, 80, 80);
     *
     *   // create animation (125ms frame speed)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(game, 125);
     *
     *   // add drawing to player as "idle"
     *   player.addDrawing("idle", playerIdleAnimation);
     *
     *   // add player to game
     *   game.add(player);
     * });
     * ```
     *
     * ## Sprite effects
     *
     * You can add [[SpriteEffect|sprite effects]] to an animation through methods
     * like [[Animation.invert]] or [[Animation.lighten]]. Keep in mind, since this
     * manipulates the raw pixel values of a [[Sprite]], it can have a performance impact.
     */
    class Animation implements IDrawable {
        /**
         * The sprite frames to play, in order. See [[SpriteSheet.getAnimationForAll]] to quickly
         * generate an [[Animation]].
         */
        sprites: Sprite[];
        /**
         * Duration to show each frame (in milliseconds)
         */
        speed: number;
        /**
         * Current frame index being shown
         */
        currentFrame: number;
        private _oldTime;
        anchor: Vector;
        rotation: number;
        scale: Vector;
        /**
         * Indicates whether the animation should loop after it is completed
         */
        loop: boolean;
        /**
         * Indicates the frame index the animation should freeze on for a non-looping
         * animation. By default it is the last frame.
         */
        freezeFrame: number;
        private _engine;
        /**
         * Flip each frame vertically. Sets [[Sprite.flipVertical]].
         */
        flipVertical: boolean;
        /**
         * Flip each frame horizontally. Sets [[Sprite.flipHorizontal]].
         */
        flipHorizontal: boolean;
        width: number;
        height: number;
        naturalWidth: number;
        naturalHeight: number;
        /**
         * Typically you will use a [[SpriteSheet]] to generate an [[Animation]].
         *
         * @param engine  Reference to the current game engine
         * @param images  An array of sprites to create the frames for the animation
         * @param speed   The number in milliseconds to display each frame in the animation
         * @param loop    Indicates whether the animation should loop after it is completed
         */
        constructor(engine: Engine, images: Sprite[], speed: number, loop?: boolean);
        /**
         * Applies the opacity effect to a sprite, setting the alpha of all pixels to a given value
         */
        opacity(value: number): void;
        /**
         * Applies the grayscale effect to a sprite, removing color information.
         */
        grayscale(): void;
        /**
         * Applies the invert effect to a sprite, inverting the pixel colors.
         */
        invert(): void;
        /**
         * Applies the fill effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
         */
        fill(color: Color): void;
        /**
         * Applies the colorize effect to a sprite, changing the color channels of all pixesl to be the average of the original color and the
         * provided color.
         */
        colorize(color: Color): void;
        /**
         * Applies the lighten effect to a sprite, changes the lightness of the color according to hsl
         */
        lighten(factor?: number): void;
        /**
         * Applies the darken effect to a sprite, changes the darkness of the color according to hsl
         */
        darken(factor?: number): void;
        /**
         * Applies the saturate effect to a sprite, saturates the color acccording to hsl
         */
        saturate(factor?: number): void;
        /**
         * Applies the desaturate effect to a sprite, desaturates the color acccording to hsl
         */
        desaturate(factor?: number): void;
        /**
         * Add a [[ISpriteEffect]] manually
         */
        addEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes an [[ISpriteEffect]] from this animation.
         * @param effect Effect to remove from this animation
         */
        removeEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes an effect given the index from this animation.
         * @param index  Index of the effect to remove from this animation
         */
        removeEffect(index: number): void;
        /**
         * Clear all sprite effects
         */
        clearEffects(): void;
        private _setAnchor(point);
        private _setRotation(radians);
        private _setScale(scale);
        /**
         * Resets the animation to first frame.
         */
        reset(): void;
        /**
         * Indicates whether the animation is complete, animations that loop are never complete.
         */
        isDone(): boolean;
        /**
         * Not meant to be called by game developers. Ticks the animation forward internally and
         * calculates whether to change to the frame.
         * @internal
         */
        tick(): void;
        private _updateValues();
        /**
         * Skips ahead a specified number of frames in the animation
         * @param frames  Frames to skip ahead
         */
        skip(frames: number): void;
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        /**
         * Plays an animation at an arbitrary location in the game.
         * @param x  The x position in the game to play
         * @param y  The y position in the game to play
         */
        play(x: number, y: number): void;
    }
}
declare module ex.Util.DrawUtil {
    /**
     * Draw a line on canvas context
     *
     * @param ctx The canvas context
     * @param color The color of the line
     * @param x1 The start x coordinate
     * @param y1 The start y coordinate
     * @param x2 The ending x coordinate
     * @param y2 The ending y coordinate
     */
    function line(ctx: CanvasRenderingContext2D, color: ex.Color, x1: number, y1: number, x2: number, y2: number): void;
    /**
     * Draw the vector as a point onto the canvas.
     */
    function point(ctx: CanvasRenderingContext2D, color: Color, point: Vector): void;
    /**
     * Draw the vector as a line onto the canvas starting a origin point.
     */
    function vector(ctx: CanvasRenderingContext2D, color: Color, origin: Vector, vector: Vector, scale?: number): void;
    /**
     * Represents border radius values
     */
    interface IBorderRadius {
        /**
         * Top-left
         */
        tl: number;
        /**
         * Top-right
         */
        tr: number;
        /**
         * Bottom-right
         */
        br: number;
        /**
         * Bottom-left
         */
        bl: number;
    }
    /**
     * Draw a round rectange on a canvas context
     *
     * @param ctx The canvas context
     * @param x The top-left x coordinate
     * @param y The top-left y coordinate
     * @param width The width of the rectangle
     * @param height The height of the rectangle
     * @param radius The border radius of the rectangle
     * @param fill The [[ex.Color]] to fill rectangle with
     * @param stroke The [[ex.Color]] to stroke rectangle with
     */
    function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius?: number | IBorderRadius, stroke?: Color, fill?: Color): void;
}
declare module ex {
    interface ILoader extends ILoadable {
        draw(ctx: CanvasRenderingContext2D, delta: number): any;
        update(engine: Engine, delta: number): any;
    }
}
declare module ex {
    /**
     * Pre-loading assets
     *
     * The loader provides a mechanism to preload multiple resources at
     * one time. The loader must be passed to the engine in order to
     * trigger the loading progress bar.
     *
     * The [[Loader]] itself implements [[ILoadable]] so you can load loaders.
     *
     * ## Example: Pre-loading resources for a game
     *
     * ```js
     * // create a loader
     * var loader = new ex.Loader();
     *
     * // create a resource dictionary (best practice is to keep a separate file)
     * var resources = {
     *   TextureGround: new ex.Texture("/images/textures/ground.png"),
     *   SoundDeath: new ex.Sound("/sound/death.wav", "/sound/death.mp3")
     * };
     *
     * // loop through dictionary and add to loader
     * for (var loadable in resources) {
     *   if (resources.hasOwnProperty(loadable)) {
     *     loader.addResource(resources[loadable]);
     *   }
     * }
     *
     * // start game
     * game.start(loader).then(function () {
     *   console.log("Game started!");
     * });
     * ```
     */
    class Loader extends Class implements ILoader {
        private _resourceList;
        private _index;
        private _resourceCount;
        private _numLoaded;
        private _progressCounts;
        private _totalCounts;
        private _engine;
        /**
         * @param loadables  Optionally provide the list of resources you want to load at constructor time
         */
        constructor(loadables?: ILoadable[]);
        wireEngine(engine: Engine): void;
        /**
         * Add a resource to the loader to load
         * @param loadable  Resource to add
         */
        addResource(loadable: ILoadable): void;
        /**
         * Add a list of resources to the loader to load
         * @param loadables  The list of resources to load
         */
        addResources(loadables: ILoadable[]): void;
        private _sumCounts(obj);
        /**
         * Returns true if the loader has completely loaded all resources
         */
        isLoaded(): boolean;
        /**
         * Begin loading all of the supplied resources, returning a promise
         * that resolves when loading of all is complete
         */
        load(): Promise<any>;
        /**
         * Loader draw function. Draws the default Excalibur loading screen. Override to customize the drawing.
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Perform any calculations or logic in the `update` method. The default `Loader` does not
         * do anything in this method so it is safe to override.
         */
        update(engine: ex.Engine, delta: number): void;
        getData: () => any;
        setData: (data: any) => any;
        processData: (data: any) => any;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: () => void;
    }
    /**
     * A [[Loader]] that pauses after loading to allow user
     * to proceed to play the game. Typically you will
     * want to use this loader for iOS to allow sounds
     * to play after loading (Apple Safari requires user
     * interaction to allow sounds, even for games)
     *
     * **Note:** Because Loader is not part of a Scene, you must
     * call `update` and `draw` manually on "child" objects.
     *
     * ## Implementing a Trigger
     *
     * The `PauseAfterLoader` requires an element to act as the trigger button
     * to start the game.
     *
     * For example, let's create an `<a>` tag to be our trigger and call it `tap-to-play`.
     *
     * ```html
     * <div id="wrapper">
     *    <canvas id="game"></canvas>
     *    <a id="tap-to-play" href='javascript:void(0);'>Tap to Play</a>
     * </div>
     * ```
     *
     * We've put it inside a wrapper to position it properly over the game canvas.
     *
     * Now let's add some CSS to style it (insert into `<head>`):
     *
     * ```html
     * <style>
     *     #wrapper {
     *         position: relative;
     *         width: 500px;
     *         height: 500px;
     *     }
     *     #tap-to-play {
     *         display: none;
     *         font-size: 24px;
     *         font-family: sans-serif;
     *         text-align: center;
     *         border: 3px solid white;
     *         position: absolute;
     *         color: white;
     *         width: 200px;
     *         height: 50px;
     *         line-height: 50px;
     *         text-decoration: none;
     *         left: 147px;
     *         top: 80%;
     *     }
     * </style>
     * ```
     *
     * Now we can create a `PauseAfterLoader` with a reference to our trigger button:
     *
     * ```ts
     * var loader = new ex.PauseAfterLoader('tap-to-play', [...]);
     * ```
     *
     * ## Use PauseAfterLoader for iOS
     *
     * The primary use case for pausing before starting the game is to
     * pass Apple's requirement of user interaction. The Web Audio context
     * in Safari is disabled by default until user interaction.
     *
     * Therefore, you can use this snippet to only use PauseAfterLoader when
     * iOS is detected (see [this thread](http://stackoverflow.com/questions/9038625/detect-if-device-is-ios)
     * for more techniques).
     *
     * ```ts
     * var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream;
     * var loader: ex.Loader = iOS ? new ex.PauseAfterLoader('tap-to-play') : new ex.Loader();
     *
     * loader.addResource(...);
     * ```
     */
    class PauseAfterLoader extends Loader {
        private _loaded;
        private _loadedValue;
        private _waitPromise;
        private _playTrigger;
        constructor(triggerElementId: string, loadables?: ILoadable[]);
        load(): Promise<any>;
        private _handleOnTrigger;
    }
}
declare module ex {
    /**
     * Excalibur internal feature detection helper class
     */
    class Detector {
        failedTests: string[];
        private _criticalTests;
        private _warningTest;
        test(): boolean;
    }
}
declare module ex {
    /**
     * Enum representing the different font size units
     * https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
     */
    enum FontUnit {
        /**
         * Em is a scalable unit, 1 em is equal to the current font size of the current element, parent elements can effect em values
         */
        Em = 0,
        /**
         * Rem is similar to the Em, it is a scalable unit. 1 rem is eqaul to the font size of the root element
         */
        Rem = 1,
        /**
         * Pixel is a unit of length in screen pixels
         */
        Px = 2,
        /**
         * Point is a physical unit length (1/72 of an inch)
         */
        Pt = 3,
        /**
         * Percent is a scalable unit similar to Em, the only difference is the Em units scale faster when Text-Size stuff
         */
        Percent = 4,
    }
    /**
     * Enum representing the different horizontal text alignments
     */
    enum TextAlign {
        /**
         * The text is left-aligned.
         */
        Left = 0,
        /**
         * The text is right-aligned.
         */
        Right = 1,
        /**
         * The text is centered.
         */
        Center = 2,
        /**
         * The text is aligned at the normal start of the line (left-aligned for left-to-right locales,
         * right-aligned for right-to-left locales).
         */
        Start = 3,
        /**
         * The text is aligned at the normal end of the line (right-aligned for left-to-right locales,
         * left-aligned for right-to-left locales).
         */
        End = 4,
    }
    /**
     * Enum representing the different baseline text alignments
     */
    enum BaseAlign {
        /**
         * The text baseline is the top of the em square.
         */
        Top = 0,
        /**
         * The text baseline is the hanging baseline.  Currently unsupported; this will act like
         * alphabetic.
         */
        Hanging = 1,
        /**
         * The text baseline is the middle of the em square.
         */
        Middle = 2,
        /**
         * The text baseline is the normal alphabetic baseline.
         */
        Alphabetic = 3,
        /**
         * The text baseline is the ideographic baseline; this is the bottom of
         * the body of the characters, if the main body of characters protrudes
         * beneath the alphabetic baseline.  Currently unsupported; this will
         * act like alphabetic.
         */
        Ideographic = 4,
        /**
         * The text baseline is the bottom of the bounding box.  This differs
         * from the ideographic baseline in that the ideographic baseline
         * doesn't consider descenders.
         */
        Bottom = 5,
    }
    /**
     * Labels
     *
     * Labels are the way to draw small amounts of text to the screen. They are
     * actors and inherit all of the benifits and capabilities.
     *
     * ## Creating a Label
     *
     * You can pass in arguments to the [[Label.constructor]] or simply set the
     * properties you need after creating an instance of the [[Label]].
     *
     * Since labels are [[Actor|Actors]], they need to be added to a [[Scene]]
     * to be drawn and updated on-screen.
     *
     * ```js
     * var game = new ex.Engine();
     *
     * // constructor
     * var label = new ex.Label("Hello World", 50, 50, "10px Arial");
     *
     * // properties
     * var label = new ex.Label();
     * label.x = 50;
     * label.y = 50;
     * label.fontFamily = "Arial";
     * label.fontSize = 10;
     * lable.fontUnit = ex.FontUnit.Px // pixels are the default
     * label.text = "Foo";
     * label.color = ex.Color.White;
     * label.textAlign = ex.TextAlign.Center;
     *
     * // add to current scene
     * game.add(label);
     *
     * // start game
     * game.start();
     * ```
     *
     * ## Adjusting Fonts
     *
     * You can use the [[fontFamily]], [[fontSize]], [[fontUnit]], [[textAlign]], and [[baseAlign]]
     * properties to customize how the label is drawn.
     *
     * You can also use [[getTextWidth]] to retrieve the measured width of the rendered text for
     * helping in calculations.
     *
     * ## Web Fonts
     *
     * The HTML5 Canvas API draws text using CSS syntax. Because of this, web fonts
     * are fully supported. To draw a web font, follow the same procedure you use
     * for CSS. Then simply pass in the font string to the [[Label]] constructor
     * or set [[Label.font]].
     *
     * **index.html**
     *
     * ```html
     * <!doctype html>
     * <html>
     * <head>
     *   <!-- Include the web font per usual -->
     *   <script src="//google.com/fonts/foobar"></script>
     * </head>
     * <body>
     *   <canvas id="game"></canvas>
     *   <script src="game.js"></script>
     * </body>
     * </html>
     * ```
     *
     * **game.js**
     *
     * ```js
     * var game = new ex.Engine();
     *
     * var label = new ex.Label();
     * label.fontFamily = "Foobar, Arial, Sans-Serif";
     * label.fontSize = 10;
     * label.fontUnit = ex.FontUnit.Em;
     * label.text = "Hello World";
     *
     * game.add(label);
     * game.start();
     * ```
     *
     * ## Performance Implications
     *
     * It is recommended to use a [[SpriteFont]] for labels as the raw Canvas
     * API for drawing text is slow (`fillText`). Too many labels that
     * do not use sprite fonts will visibly affect the frame rate of your game.
     *
     * Alternatively, you can always use HTML and CSS to draw UI elements, but
     * currently Excalibur does not provide a way to easily interact with the
     * DOM. Still, this will not affect canvas performance and is a way to
     * lighten your game, if needed.
     */
    class Label extends Actor {
        /**
         * The text to draw.
         */
        text: string;
        /**
         * The [[SpriteFont]] to use, if any. Overrides [[font]] if present.
         */
        spriteFont: SpriteFont;
        /**
         * The CSS font family string (e.g. `sans-serif`, `Droid Sans Pro`). Web fonts
         * are supported, same as in CSS.
         */
        fontFamily: string;
        /**
         * The font size in the selected units, default is 10 (default units is pixel)
         */
        fontSize: number;
        /**
         * The css units for a font size such as px, pt, em (SpriteFont only support px), by default is 'px';
         */
        fontUnit: FontUnit;
        /**
         * Gets or sets the horizontal text alignment property for the label.
         */
        textAlign: TextAlign;
        /**
         * Gets or sets the baseline alignment property for the label.
         */
        baseAlign: BaseAlign;
        /**
         * Gets or sets the maximum width (in pixels) that the label should occupy
         */
        maxWidth: number;
        /**
         * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
         */
        letterSpacing: number;
        /**
         * Whether or not the [[SpriteFont]] will be case-sensitive when matching characters.
         */
        caseInsensitive: boolean;
        private _textShadowOn;
        private _shadowOffsetX;
        private _shadowOffsetY;
        private _shadowColor;
        private _shadowColorDirty;
        private _textSprites;
        private _shadowSprites;
        private _color;
        /**
         * @param text        The text of the label
         * @param x           The x position of the label
         * @param y           The y position of the label
         * @param font        Use any valid CSS font string for the label's font. Web fonts are supported. Default is `10px sans-serif`.
         * @param spriteFont  Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precendence
         * over a css font.
         */
        constructor(text?: string, x?: number, y?: number, fontFamily?: string, spriteFont?: SpriteFont);
        /**
         * Returns the width of the text in the label (in pixels);
         * @param ctx  Rendering context to measure the string with
         */
        getTextWidth(ctx: CanvasRenderingContext2D): number;
        private _lookupFontUnit(fontUnit);
        private _lookupTextAlign(textAlign);
        private _lookupBaseAlign(baseAlign);
        /**
         * Sets the text shadow for sprite fonts
         * @param offsetX      The x offset in pixels to place the shadow
         * @param offsetY      The y offset in pixles to place the shadow
         * @param shadowColor  The color of the text shadow
         */
        setTextShadow(offsetX: number, offsetY: number, shadowColor: Color): void;
        /**
         * Toggles text shadows on or off, only applies when using sprite fonts
         */
        useTextShadow(on: boolean): void;
        /**
         * Clears the current text shadow
         */
        clearTextShadow(): void;
        update(engine: Engine, delta: number): void;
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        private _fontDraw(ctx, delta, sprites);
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
    /**
     * Post Processors
     *
     * Sometimes it is necessary to apply an effect to the canvas after the engine has completed its drawing pass. A few reasons to do
     * this might be creating a blur effect, adding a lighting effect, or changing how colors and pixels look.
     *
     * ## Basic post procesors
     *
     * To create and use a post processor you just need to implement a class that implements [[IPostProcessor]], which has one method
     * [[IPostProcessor.process]]. Set the `out` canvas parameter to the final result, using the `image` pixel data.
     *
     * Click to read more about [[https://developer.mozilla.org/en-US/docs/Web/API/ImageData|ImageData]] on MDN.
     *
     * For example:
     * ```typescript
     * // simple way to grayscale, a faster way would be to implement using a webgl fragment shader
     * class GrayscalePostProcessor implements IPostProcessor {
     *   process(image: ImageData, out: CanvasRenderingContext2D) {
     *      for(var i = 0; i < (image.height * image.width), i+=4){
     *         // for pixel "i""
     *         var r = image.data[i+0]; //0-255
     *         var g = image.data[i+1]; //g
     *         var b = image.data[i+2]; //b
     *         image.data[i+3]; //a
     *         var result = Math.floor((r + g + b) / 3.0) | 0; // only valid on 0-255 integers `| 0` forces int
     *         image.data[i+0] = result;
     *         image.data[i+1] = result;
     *         image.data[i+2] = result;
     *      }
     *      // finish processing and write result
     *      out.putImageData(image, 0, 0);
     *   }
     * }
     *
     * ```
     *
     * ## Color Blind Corrector Post Processor
     *
     * Choosing colors that are friendly to players with color blindness is an important consideration when making a game.
     * There is a significant portion of the population that has some form of color blindness,
     * and choosing bad colors can make your game unplayable. We have built
     * a post procesors that can shift your colors into as more visible range for the 3 most common types of
     * [[https://en.wikipedia.org/wiki/Color_blindness|color blindness]].
     *
     *  - [[ColorBlindness.Protanope|Protanope]]
     *  - [[ColorBlindness.Deuteranope|Deuteranope]]
     *  - [[ColorBlindness.Tritanope|Tritanope]]
     *
     * This post processor can correct colors, and simulate color blindness.
     * It is possible to use this on every game, but the game's performance
     * will suffer measurably. It's better to use it as a helpful tool while developing your game.
     * Remember, the best practice is to design with color blindness in mind.
     *
     * Example:
     * ```typescript
     *
     * var game = new ex.Engine();
     *
     * var colorBlindPostProcessor = new ex.ColorBlindCorrector(game, false, ColorBlindness.Protanope);
     *
     * // post processors evaluate left to right
     * game.postProcessors.push(colorBlindPostProcessor);
     * game.start();
     *
     * ```
     *
     */
    interface IPostProcessor {
        process(image: ImageData, out: CanvasRenderingContext2D): void;
    }
}
declare module ex.Input {
    interface IEngineInput {
        keyboard: Keyboard;
        pointers: Pointers;
        gamepads: Gamepads;
    }
}
declare module ex.Input {
    /**
     * The type of pointer for a [[PointerEvent]].
     */
    enum PointerType {
        Touch = 0,
        Mouse = 1,
        Pen = 2,
        Unknown = 3,
    }
    /**
     * The mouse button being pressed.
     */
    enum PointerButton {
        Left = 0,
        Middle = 1,
        Right = 2,
        Unknown = 3,
    }
    /**
     * Determines the scope of handling mouse/touch events. See [[Pointers]] for more information.
     */
    enum PointerScope {
        /**
         * Handle events on the `canvas` element only. Events originating outside the
         * `canvas` will not be handled.
         */
        Canvas = 0,
        /**
         * Handles events on the entire document. All events will be handled by Excalibur.
         */
        Document = 1,
    }
    /**
     * Pointer events
     *
     * Represents a mouse, touch, or stylus event. See [[Pointers]] for more information on
     * handling pointer input.
     *
     * For mouse-based events, you can inspect [[PointerEvent.button]] to see what button was pressed.
     */
    class PointerEvent extends ex.GameEvent {
        x: number;
        y: number;
        index: number;
        pointerType: PointerType;
        button: PointerButton;
        ev: any;
        /**
         * @param x            The `x` coordinate of the event (in world coordinates)
         * @param y            The `y` coordinate of the event (in world coordinates)
         * @param index        The index of the pointer (zero-based)
         * @param pointerType  The type of pointer
         * @param button       The button pressed (if [[PointerType.Mouse]])
         * @param ev           The raw DOM event being handled
         */
        constructor(x: number, y: number, index: number, pointerType: PointerType, button: PointerButton, ev: any);
    }
    /**
     * Mouse and Touch (Pointers)
     *
     * Handles pointer events (mouse, touch, stylus, etc.) and normalizes to
     * [W3C Pointer Events](http://www.w3.org/TR/pointerevents/).
     *
     * There is always at least one [[Pointer]] available ([[Pointers.primary]]) and
     * you can request multiple pointers to support multi-touch scenarios.
     *
     * Since [[Pointers.primary]] normalizes both mouse and touch events, your game
     * automatically supports touch for the primary pointer by default. When
     * you handle the events, you can customize what your game does based on the type
     * of pointer, if applicable.
     *
     * Excalibur handles mouse/touch events and normalizes them to a [[PointerEvent]]
     * that your game can subscribe to and handle (`engine.input.pointers`).
     *
     * ## Events
     *
     * You can subscribe to pointer events through `engine.input.pointers.on`. A [[PointerEvent]] object is
     * passed to your handler which offers information about the pointer input being received.
     *
     * - `down` - When a pointer is pressed down (any mouse button or finger press)
     * - `up` - When a pointer is lifted
     * - `move` - When a pointer moves (be wary of performance issues when subscribing to this)
     * - `cancel` - When a pointer event is canceled for some reason
     *
     * ```js
     * engine.input.pointers.primary.on("down", function (evt) { });
     * engine.input.pointers.primary.on("up", function (evt) { });
     * engine.input.pointers.primary.on("move", function (evt) { });
     * engine.input.pointers.primary.on("cancel", function (evt) { });
     * ```
     *
     * ## Pointer scope (window vs. canvas)
     *
     * You have the option to handle *all* pointer events in the browser by setting
     * [[IEngineOptions.pointerScope]] to [[PointerScope.Document]]. If this is enabled,
     * Excalibur will handle every pointer event in the browser. This is useful for handling
     * complex input and having control over every interaction.
     *
     * You can also use [[PointerScope.Canvas]] to only scope event handling to the game
     * canvas. This is useful if you don't care about events that occur outside the game.
     *
     * One real-world example is dragging and gestures. Sometimes a player will drag their
     * finger outside your game and then into it, expecting it to work. If [[PointerScope]]
     * is set to [[PointerScope.Canvas|Canvas]] this will not work. If it is set to
     * [[PointerScope.Document|Document]], it will.
     *
     * ## Responding to input
     *
     * The primary pointer can be a mouse, stylus, or single finger touch event. You
     * can inspect what type of pointer it is from the [[PointerEvent]] handled.
     *
     * ```js
     * engine.input.pointers.primary.on("down", function (pe) {
     *   if (pe.pointerType === ex.Input.PointerType.Mouse) {
     *     ex.Logger.getInstance().info("Mouse event:", pe);
     *   } else if (pe.pointerType === ex.Input.PointerType.Touch) {
     *     ex.Logger.getInstance().info("Touch event:", pe);
     *   }
     * });
     * ```
     *
     * ## Multiple Pointers (Multi-Touch)
     *
     * When there is more than one pointer detected on the screen,
     * this is considered multi-touch. For example, pressing one finger,
     * then another, will create two pointers. If you lift a finger,
     * the first one remains and the second one disappears.
     *
     * You can handle multi-touch by subscribing to however many pointers
     * you would like to support. If a pointer doesn't yet exist, it will
     * be created. You do not need to check if a pointer exists. If it does
     * exist, it will propogate events, otherwise it will remain idle.
     *
     * Excalibur does not impose a limit to the amount of pointers you can
     * subscribe to, so by all means, support all 10 fingers.
     *
     * *Note:* There is no way to identify touches after they happen; you can only
     * know that there are *n* touches on the screen at once.
     *
     * ```js
     * function paint(color) {
     *
     *   // create a handler for the event
     *   return function (pe) {
     *     if (pe.pointerType === ex.Input.PointerType.Touch) {
     *       engine.canvas.fillStyle = color;
     *       engine.canvas.fillRect(pe.x, pe.y, 5, 5);
     *     }
     *   }
     * }
     *
     * engine.input.pointers.at(0).on("move", paint("blue"));  // 1st finger
     * engine.input.pointers.at(1).on("move", paint("red"));   // 2nd finger
     * engine.input.pointers.at(2).on("move", paint("green")); // 3rd finger
     * ```
     *
     * ## Actor pointer events
     *
     * By default, [[Actor|Actors]] do not participate in pointer events. In other
     * words, when you "click" an Actor, it will not throw an event **for that Actor**,
     * only a generic pointer event for the game. This is to keep performance
     * high and allow actors to "opt-in" to handling pointer events. Actors will automatically
     * opt-in if a pointer related event handler is set on them `actor.on("pointerdown", () => {})` for example.
     *
     * To opt-in manually, set [[Actor.enableCapturePointer]] to `true` and the [[Actor]] will
     * start publishing `pointerup` and `pointerdown` events. `pointermove` events
     * will not be published by default due to performance implications. If you want
     * an actor to receive move events, set [[ICapturePointerConfig.captureMoveEvents]] to
     * `true`.
     *
     * Actor pointer events will be prefixed with `pointer`.
     *
     * ```js
     * var player = new ex.Actor();
     *
     * // enable propogating pointer events
     * player.enableCapturePointer = true;
     *
     * // enable move events, warning: performance intensive!
     * player.capturePointer.captureMoveEvents = true;
     *
     * // subscribe to input
     * player.on("pointerup", function (ev) {
     *   player.logger.info("Player selected!", ev);
     * });
     * ```
     */
    class Pointers extends ex.Class {
        private _engine;
        private _pointerDown;
        private _pointerUp;
        private _pointerMove;
        private _pointerCancel;
        private _pointers;
        private _activePointers;
        constructor(engine: ex.Engine);
        on(eventName: ex.Events.up, handler: (event?: PointerEvent) => void): any;
        on(eventName: ex.Events.down, handler: (event?: PointerEvent) => void): any;
        on(eventName: ex.Events.move, handler: (event?: PointerEvent) => void): any;
        on(eventName: ex.Events.cancel, handler: (event?: PointerEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        /**
         * Primary pointer (mouse, 1 finger, stylus, etc.)
         */
        primary: Pointer;
        /**
         * Initializes pointer event listeners
         */
        init(scope?: PointerScope): void;
        update(delta: number): void;
        /**
         * Safely gets a Pointer at a specific index and initializes one if it doesn't yet exist
         * @param index  The pointer index to retrieve
         */
        at(index: number): Pointer;
        /**
         * Get number of pointers being watched
         */
        count(): number;
        /**
         * Propogates events to actor if necessary
         */
        propogate(actor: any): void;
        private _handleMouseEvent(eventName, eventArr);
        private _handleTouchEvent(eventName, eventArr);
        private _handlePointerEvent(eventName, eventArr);
        /**
         * Gets the index of the pointer specified for the given pointer ID or finds the next empty pointer slot available.
         * This is required because IE10/11 uses incrementing pointer IDs so we need to store a mapping of ID => idx
         */
        private _getPointerIndex(pointerId);
        private _stringToPointerType(s);
    }
    /**
     * Captures and dispatches PointerEvents
     */
    class Pointer extends Class {
    }
}
declare module ex.Input {
    /**
     * Enum representing input key codes
     */
    enum Keys {
        Num1 = 97,
        Num2 = 98,
        Num3 = 99,
        Num4 = 100,
        Num5 = 101,
        Num6 = 102,
        Num7 = 103,
        Num8 = 104,
        Num9 = 105,
        Num0 = 96,
        Numlock = 144,
        Semicolon = 186,
        A = 65,
        B = 66,
        C = 67,
        D = 68,
        E = 69,
        F = 70,
        G = 71,
        H = 72,
        I = 73,
        J = 74,
        K = 75,
        L = 76,
        M = 77,
        N = 78,
        O = 79,
        P = 80,
        Q = 81,
        R = 82,
        S = 83,
        T = 84,
        U = 85,
        V = 86,
        W = 87,
        X = 88,
        Y = 89,
        Z = 90,
        Shift = 16,
        Alt = 18,
        Up = 38,
        Down = 40,
        Left = 37,
        Right = 39,
        Space = 32,
        Esc = 27,
    }
    /**
     * Event thrown on a game object for a key event
     */
    class KeyEvent extends GameEvent {
        key: Keys;
        /**
         * @param key  The key responsible for throwing the event
         */
        constructor(key: Keys);
    }
    /**
     * Keyboard input
     *
     * Working with the keyboard is easy in Excalibur. You can inspect
     * whether a button was just [[Keyboard.wasPressed|pressed]] or [[Keyboard.wasReleased|released]] this frame, or
     * if the key is currently being [[Keyboard.isHeld|held]] down. Common keys are held in the [[Input.Keys]]
     * enumeration but you can pass any character code to the methods.
     *
     * Excalibur subscribes to the browser events and keeps track of
     * what keys are currently held, released, or pressed. A key can be held
     * for multiple frames, but a key cannot be pressed or released for more than one subsequent
     * update frame.
     *
     * ## Inspecting the keyboard
     *
     * You can inspect [[Engine.input]] to see what the state of the keyboard
     * is during an update.
     *
     * It is recommended that keyboard actions that directly effect actors be handled like so to improve code quality:
     * ```ts
     * class Player extends ex.Actor {
     *   public update(engine, delta) {
     *
     *     if (engine.input.keyboard.isHeld(ex.Input.Keys.W) ||
     *         engine.input.keyboard.isHeld(ex.Input.Keys.Up)) {
     *
     *       player._moveForward();
     *     }
     *
     *     if (engine.input.keyboard.wasPressed(ex.Input.Keys.Right)) {
     *       player._fire();
     *     }
     *   }
     * }
     * ```
     * ## Events
     * You can subscribe to keyboard events through `engine.input.keyboard.on`. A [[KeyEvent]] object is
     * passed to your handler which offers information about the key that was part of the event.
     *
     * - `press` - When a key was just pressed this frame
     * - `release` - When a key was just released this frame
     * - `hold` - Whenever a key is in the down position
     *
     * ```ts
     * engine.input.keyboard.on("press", (evt: KeyEvent) => {...});
     * engine.input.keyboard.on("release", (evt: KeyEvent) => {...});
     * engine.input.keyboard.on("hold", (evt: KeyEvent) => {...});
     * ```
     */
    class Keyboard extends ex.Class {
        private _keys;
        private _keysUp;
        private _keysDown;
        private _engine;
        constructor(engine: ex.Engine);
        on(eventName: ex.Events.press, handler: (event?: KeyboardEvent) => void): any;
        on(eventName: ex.Events.release, handler: (event?: KeyboardEvent) => void): any;
        on(eventName: ex.Events.hold, handler: (event?: KeyboardEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        /**
         * Initialize Keyboard event listeners
         */
        init(): void;
        update(delta: number): void;
        /**
         * Gets list of keys being pressed down
         */
        getKeys(): Keys[];
        /**
         * Tests if a certain key was just pressed this frame. This is cleared at the end of the update frame.
         * @param key Test wether a key was just pressed
         */
        wasPressed(key: Keys): boolean;
        /**
         * Tests if a certain key is held down. This is persisted between frames.
         * @param key  Test wether a key is held down
         */
        isHeld(key: Keys): boolean;
        /**
         * Tests if a certain key was just released this frame. This is cleared at the end of the update frame.
         * @param key  Test wether a key was just released
         */
        wasReleased(key: Keys): boolean;
    }
}
declare module ex.Input {
    /**
     * Controller Support (Gamepads)
     *
     * Excalibur leverages the HTML5 Gamepad API [where it is supported](http://caniuse.com/#feat=gamepad)
     * to provide controller support for your games.
     *
     * You can query any [[Gamepad|Gamepads]] that are connected or listen to events ("button" and "axis").
     *
     * You must opt-in to controller support ([[Gamepads.enabled]]) because it is a polling-based
     * API, so we have to check it each update frame. If an gamepad related event handler is set, you will
     * automatically opt-in to controller polling.
     *
     * HTML5 Gamepad API only supports a maximum of 4 gamepads. You can access them using the [[Gamepads.at]] method. If a [[Gamepad]] is
     * not connected, it will simply not throw events.
     *
     * ## Gamepad Filtering
     *
     * Different browsers/devices are sometimes loose about the devices they consider Gamepads, you can set minimum device requirements with
     * `engine.input.gamepads.setMinimumGamepadConfiguration` so that undesired devices are not reported to you (Touchpads, Mice, Web
     * Cameras, etc.).
     *
     * ```js
     * // ensures that only gamepads with at least 4 axis and 8 buttons are reported for events
     * engine.input.gamepads.setMinimumGamepadConfiguration({
     *    axis: 4,
     *    buttons: 8
     * });
     * ```
     *
     * ## Events
     *
     * You can subscribe to gamepad connect and disconnect events through `engine.input.gamepads.on`.
     * A [[GamepadConnectEvent]] or [[GamepadDisconnectEvent]] will be passed to you.
     *
     * - `connect` - When a gamepad connects it will fire this event and pass a [[GamepadConnectEvent]] with a reference to the gamepad.
     * - `disconnect` - When a gamepad disconnects it will fire this event and pass a [[GamepadDisconnectEvent]]
     *
     * Once you have a reference to a gamepad you may listen to changes on that gamepad with `.on`. A [[GamepadButtonEvent]] or
     * [[GamepadAxisEvent]] will be passed to you.
     * - `button` - Whenever a button is pressed on the game
     * - `axis` - Whenever an axis
     *
     * ```ts
     *
     * engine.input.gamepads.on('connect', (ce: ex.Input.GamepadConnectEvent) => {
     *    var newPlayer = CreateNewPlayer(); // pseudo-code for new player logic on gamepad connection
     *    console.log("Gamepad connected", ce);
     *    ce.gamepad.on('button', (be: ex.GamepadButtonEvent) => {
     *       if(be.button === ex.Input.Buttons.Face1) {
     *          newPlayer.jump();
     *       }
     *    });
     *
     *    ce.gamepad.on('axis', (ae: ex.GamepadAxisEvent) => {
     *      if(ae.axis === ex.Input.Axis.LeftStickX && ae.value > .5){
     *         newPlayer.moveRight();
     *      }
     *    })
     *
     *  });
     *
     *
     * ```
     *
     * ## Responding to button input
     *
     * [[Buttons|Gamepad buttons]] typically have values between 0 and 1, however depending on
     * the sensitivity of the controller, even if a button is idle it could have a
     * very tiny value. For this reason, you can pass in a threshold to several
     * methods to customize how sensitive you want to be in detecting button presses.
     *
     * You can inspect any connected [[Gamepad]] using [[Gamepad.isButtonPressed]], [[Gamepad.getButton]],
     * or you can subscribe to the `button` event published on the [[Gamepad]] which passes
     * a [[GamepadButtonEvent]] to your handler.
     *
     * ```js
     * // enable gamepad support
     * engine.input.gamepads.enabled = true;
     *
     * // query gamepad on update
     * engine.on("update", function (ev) {
     *
     *   // access any gamepad by index
     *   if (engine.input.gamepads.at(0).isButtonPressed(ex.Input.Buttons.Face1)) {
     *     ex.Logger.getInstance().info("Controller A button pressed");
     *   }
     *
     *   // query individual button
     *   if (engine.input.gamepads.at(0).getButton(ex.Input.Buttons.DpadLeft) > 0.2) {
     *     ex.Logger.getInstance().info("Controller D-pad left value is > 0.2")
     *   }
     * });
     *
     * // subscribe to button events
     * engine.input.gamepads.at(0).on("button", function (ev) {
     *   ex.Logger.getInstance().info(ev.button, ev.value);
     * });
     * ```
     *
     * ## Responding to axis input
     *
     * [[Axes|Gamepad axes]] typically have values between -1 and 1, but even idle
     * sticks can still propogate very small values depending on the quality and age
     * of a controller. For this reason, you can set [[Gamepads.MinAxisMoveThreshold]]
     * to set the (absolute) threshold after which Excalibur will start publishing `axis` events.
     * By default it is set to a value that normally will not throw events if a stick is idle.
     *
     * You can query axes via [[Gamepad.getAxes]] or by subscribing to the `axis` event on [[Gamepad]]
     * which passes a [[GamepadAxisEvent]] to your handler.
     *
     * ```js
     * // enable gamepad support
     * engine.input.gamepads.enabled = true;
     *
     * // query gamepad on update
     * engine.on("update", function (ev) {
     *
     *   // access any gamepad by index
     *   var axisValue;
     *   if ((axisValue = engine.input.gamepads.at(0).getAxes(ex.Input.Axes.LeftStickX)) > 0.5) {
     *     ex.Logger.getInstance().info("Move right", axisValue);
     *   }
     * });
     *
     * // subscribe to axis events
     * engine.input.gamepads.at(0).on("axis", function (ev) {
     *   ex.Logger.getInstance().info(ev.axis, ev.value);
     * });
     * ```
     */
    class Gamepads extends ex.Class {
        /**
         * Whether or not to poll for Gamepad input (default: `false`)
         */
        enabled: boolean;
        /**
         * Whether or not Gamepad API is supported
         */
        supported: boolean;
        /**
         * The minimum value an axis has to move before considering it a change
         */
        static MinAxisMoveThreshold: number;
        private _gamePadTimeStamps;
        private _oldPads;
        private _pads;
        private _initSuccess;
        private _engine;
        private _navigator;
        private _minimumConfiguration;
        constructor(engine: ex.Engine);
        init(): void;
        /**
         * Sets the minimum gamepad configuration, for example {axis: 4, buttons: 4} means
         * this game requires at minimum 4 axis inputs and 4 buttons, this is not restrictive
         * all other controllers with more axis or buttons are valid as well. If no minimum
         * configuration is set all pads are valid.
         */
        setMinimumGamepadConfiguration(config: IGamepadConfiguration): void;
        /**
         * When implicitely enabled, set the enabled flag and run an update so information is updated
         */
        private _enableAndUpdate();
        /**
         * Checks a navigator gamepad against the minimum configuration if present.
         */
        private _isGamepadValid(pad);
        on(eventName: ex.Events.connect, handler: (event?: GamepadConnectEvent) => void): any;
        on(eventName: ex.Events.disconnect, handler: (event?: GamepadDisconnectEvent) => void): any;
        on(eventName: ex.Events.button, handler: (event?: GamepadButtonEvent) => void): any;
        on(eventName: ex.Events.axis, handler: (event?: GamepadAxisEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        off(eventName: string, handler?: (event?: GameEvent) => void): void;
        /**
         * Updates Gamepad state and publishes Gamepad events
         */
        update(delta: number): void;
        /**
         * Safely retrieves a Gamepad at a specific index and creates one if it doesn't yet exist
         */
        at(index: number): Gamepad;
        /**
         * Returns a list of all valid gamepads that meet the minimum configuration requirment.
         */
        getValidGamepads(): Gamepad[];
        /**
         * Gets the number of connected gamepads
         */
        count(): number;
        private _clonePads(pads);
        /**
         * Fastest way to clone a known object is to do it yourself
         */
        private _clonePad(pad);
    }
    /**
     * Gamepad holds state information for a connected controller. See [[Gamepads]]
     * for more information on handling controller input.
     */
    class Gamepad extends ex.Class {
        connected: boolean;
        navigatorGamepad: INavigatorGamepad;
        private _buttons;
        private _axes;
        constructor();
        /**
         * Whether or not the given button is pressed
         * @param button     The button to query
         * @param threshold  The threshold over which the button is considered to be pressed
         */
        isButtonPressed(button: Buttons, threshold?: number): boolean;
        /**
         * Gets the given button value between 0 and 1
         */
        getButton(button: Buttons): number;
        /**
         * Gets the given axis value between -1 and 1. Values below
         * [[MinAxisMoveThreshold]] are considered 0.
         */
        getAxes(axes: Axes): number;
        updateButton(buttonIndex: number, value: number): void;
        updateAxes(axesIndex: number, value: number): void;
    }
    /**
     * Gamepad Buttons enumeration
     */
    enum Buttons {
        /**
         * Face 1 button (e.g. A)
         */
        Face1 = 0,
        /**
         * Face 2 button (e.g. B)
         */
        Face2 = 1,
        /**
         * Face 3 button (e.g. X)
         */
        Face3 = 2,
        /**
         * Face 4 button (e.g. Y)
         */
        Face4 = 3,
        /**
         * Left bumper button
         */
        LeftBumper = 4,
        /**
         * Right bumper button
         */
        RightBumper = 5,
        /**
         * Left trigger button
         */
        LeftTrigger = 6,
        /**
         * Right trigger button
         */
        RightTrigger = 7,
        /**
         * Select button
         */
        Select = 8,
        /**
         * Start button
         */
        Start = 9,
        /**
         * Left analog stick press (e.g. L3)
         */
        LeftStick = 10,
        /**
         * Right analog stick press (e.g. R3)
         */
        RightStick = 11,
        /**
         * D-pad up
         */
        DpadUp = 12,
        /**
         * D-pad down
         */
        DpadDown = 13,
        /**
         * D-pad left
         */
        DpadLeft = 14,
        /**
         * D-pad right
         */
        DpadRight = 15,
    }
    /**
     * Gamepad Axes enumeration
     */
    enum Axes {
        /**
         * Left analogue stick X direction
         */
        LeftStickX = 0,
        /**
         * Left analogue stick Y direction
         */
        LeftStickY = 1,
        /**
         * Right analogue stick X direction
         */
        RightStickX = 2,
        /**
         * Right analogue stick Y direction
         */
        RightStickY = 3,
    }
    /**
     * @internal
     */
    interface INavigatorGamepad {
        axes: number[];
        buttons: INavigatorGamepadButton[];
        connected: boolean;
        id: string;
        index: number;
        mapping: string;
        timestamp: number;
    }
    /**
     * @internal
     */
    interface INavigatorGamepadButton {
        pressed: boolean;
        value: number;
    }
    /**
     * @internal
     */
    interface INavigatorGamepadEvent {
        gamepad: INavigatorGamepad;
    }
    /**
     * @internal
     */
    interface IGamepadConfiguration {
        axis: number;
        buttons: number;
    }
}
declare var EX_VERSION: string;
/**
 * # Welcome to the Excalibur API
 *
 * This documentation is automatically generated from the Excalibur
 * source code on [GitHub](http://github.com/excaliburjs/Excalibur).
 *
 * If you're just starting out, we recommend reading the tutorials and guides
 * on [Excaliburjs.com](http://excaliburjs.com/docs). If you have questions,
 * feel free to get help on the [Excalibur.js mailing list](https://groups.google.com/forum/#!forum/excaliburjs).
 *
 * If you're looking for a specific method or property, you can search the documentation
 * using the search icon at the top or just start typing.
 *
 * ## Where to Start
 *
 * These are the core concepts of Excalibur that you should become
 * familiar with.
 *
 * - [[Engine|Intro to the Engine]]
 *   - [[EventDispatcher|Eventing]]
 * - [[Scene|Working with Scenes]]
 *   - [[BaseCamera|Working with Cameras]]
 * - [[Actor|Working with Actors]]
 *   - [[Label|Labels]]
 *   - [[Trigger|Triggers]]
 *   - [[UIActor|UI Actors (HUD)]]
 *   - [[ActionContext|Action API]]
 *   - [[Group|Groups]]
 * - [[Physics|Working with Physics]]
 *
 * ## Working with Resources
 *
 * Excalibur provides easy ways of loading assets, from images to JSON files.
 *
 * - [[Loader|Working with the Loader]]
 * - [[Texture|Loading Textures]]
 * - [[Sound|Loading Sounds]]
 * - [[Resource|Loading Generic Resources]]
 *
 * ## Working with Input
 *
 * Excalibur comes built-in with support for mouse, keyboard, touch, and controllers.
 *
 * - [[Pointers|Mouse and Touch]]
 * - [[Keyboard]]
 * - [[Gamepads|Controller Support]]
 *
 * ## Working with Media
 *
 * Add sounds, images, and animations to your game.
 *
 * - [[Sprite|Working with Sprites]]
 * - [[Sound|Working with Sounds]]
 * - [[SpriteSheet|Working with SpriteSheets]]
 * - [[Animation|Working with Animations]]
 * - [[TileMap|Working with TileMaps]]
 *
 * ## Effects and Particles
 *
 * Every game needs an explosion or two. Add sprite effects such as lighten,
 * darken, and colorize.
 *
 * - [[Effects|Sprite Effects]]
 * - [[ParticleEmitter|Particle Emitters]]
 * - [[IPostProcessor|Post Processors]]
 *
 * ## Math
 *
 * These classes provide the basics for math & algebra operations.
 *
 * - [[Vector]]
 * - [[Ray]]
 * - [[Line]]
 * - [[Projection]]
 *
 * ## Utilities
 *
 * - [[Util|Utility Functions]]
 * - [[Promise|Promises and Async]]
 * - [[Logger|Logging]]
 * - [[Color|Colors]]
 * - [[Timer|Timers]]
 */
declare module ex {
    /**
     * Enum representing the different display modes available to Excalibur
     */
    enum DisplayMode {
        /**
         * Show the game as full screen
         */
        FullScreen = 0,
        /**
         * Scale the game to the parent DOM container
         */
        Container = 1,
        /**
         * Show the game as a fixed size
         */
        Fixed = 2,
    }
    /**
     * Defines the available options to configure the Excalibur engine at constructor time.
     */
    interface IEngineOptions {
        /**
         * Optionally configure the native canvas width of the game
         */
        width?: number;
        /**
         * Optionally configure the native canvas height of the game
         */
        height?: number;
        /**
         * Optionally specify the target canvas DOM element to render the game in
         */
        canvasElementId?: string;
        /**
         * The [[DisplayMode]] of the game. Depending on this value, [[width]] and [[height]] may be ignored.
         */
        displayMode?: ex.DisplayMode;
        /**
         * Configures the pointer scope. Pointers scoped to the 'Canvas' can only fire events within the canvas viewport; whereas, 'Document'
         * (default) scoped will fire anywhere on the page.
         */
        pointerScope?: ex.Input.PointerScope;
    }
    /**
     * The Excalibur Engine
     *
     * The [[Engine]] is the main driver for a game. It is responsible for
     * starting/stopping the game, maintaining state, transmitting events,
     * loading resources, and managing the scene.
     *
     * Excalibur uses the HTML5 Canvas API for drawing your game to the screen.
     * The canvas is available to all `draw` functions for raw manipulation,
     * but Excalibur is meant to simplify or completely remove the need to use
     * the canvas directly.
     *
     * ## Creating a Game
     *
     * To create a new game, create a new instance of [[Engine]] and pass in
     * the configuration ([[IEngineOptions]]). Excalibur only supports a single
     * instance of a game at a time, so it is safe to use globally.
     *
     * You can then call [[start]] which starts the game and optionally accepts
     * a [[Loader]] which you can use to pre-load assets.
     *
     * ```js
     * var game = new ex.Engine({
     *   width: 800, // the width of the canvas
     *   height: 600, // the height of the canvas
     *   canvasElementId: '', // the DOM canvas element ID, if you are providing your own
     *   displayMode: ex.DisplayMode.FullScreen, // the display mode
     *   pointerScope: ex.Input.PointerScope.Document // the scope of capturing pointer (mouse/touch) events
     * });
     *
     * // call game.start, which is a Promise
     * game.start().then(function () {
     *   // ready, set, go!
     * });
     * ```
     *
     * ## The Main Loop
     *
     * The Excalibur engine uses a simple main loop. The engine updates and renders
     * the "scene graph" which is the [[Scene|scenes]] and the tree of [[Actor|actors]] within that
     * scene. Only one [[Scene]] can be active at a time. The engine does not update/draw any other
     * scene, which means any actors will not be updated/drawn if they are part of a deactivated scene.
     *
     * ![Engine Lifecycle](/assets/images/docs/EngineLifecycle.png)
     *
     * **Scene Graph**
     *
     * ```
     * Engine
     *   |_ Scene 1 (activated)
     *     |_ Actor 1
     *       |_ Child Actor 1
     *     |_ Actor 2
     *   |_ Scene 2 (deactiveated)
     *   |_ Scene 3 (deactiveated)
     * ```
     *
     * The engine splits the game into two primary responsibilities: updating and drawing. This is
     * to keep your game smart about splitting duties so that you aren't drawing when doing
     * logic or performing logic as you draw.
     *
     * ### Update Loop
     *
     * The first operation run is the [[Engine._update|update]] loop. [[Actor]] and [[Scene]] both implement
     * an overridable/extendable `update` method. Use it to perform any logic-based operations
     * in your game for a particular class.
     *
     * ### Draw Loop
     *
     * The next step is the [[Engine._draw|draw]] loop. A [[Scene]] loops through its child [[Actor|actors]] and
     * draws each one. You can override the `draw` method on an actor to customize its drawing.
     * You should **not** perform any logic in a draw call, it should only relate to drawing.
     *
     * ## Working with Scenes
     *
     * The engine automatically creates a "root" [[Scene]]. You can use this for whatever you want.
     * You can manipulate scenes using [[Engine.add|add]], [[Engine.remove|remove]],
     * and [[Engine.goToScene|goToScene]]. You can overwrite or remove the `root` scene if
     * you want. There always has to be at least one scene and only **one** scene can be
     * active at any one time.
     *
     * Learn more about the [[Scene|scene lifecycle]].
     *
     * ### Adding a scene
     *
     * ```js
     * var game = new ex.Engine();
     *
     * // create a new level
     * var level1 = new ex.Scene();
     *
     * // add level 1 to the game
     * game.add("level1", level1);
     *
     * // in response to user input, go to level 1
     * game.goToScene("level1");
     *
     * // go back to main menu
     * game.goToScene("root");
     * ```
     *
     * ### Accessing the current scene
     *
     * To add actors and other entities to the current [[Scene]], you can use [[Engine.add|add]]. Alternatively,
     * you can use [[Engine.currentScene]] to directly access the current scene.
     *
     * ## Managing the Viewport
     *
     * Excalibur supports multiple [[DisplayMode|display modes]] for a game. Pass in a `displayMode`
     * option when creating a game to customize the viewport.
     *
     * The [[width]] and [[height]] are still used to represent the native width and height
     * of the canvas, but you can leave them at 0 or `undefined` to ignore them. If width and height
     * are not specified, the game won't be scaled and native resolution will be the physical screen
     * width/height.
     *
     * If you use [[ex.DisplayMode.Container]], the canvas will automatically resize to fit inside of
     * it's parent DOM element. This allows you maximum control over the game viewport, e.g. in case
     * you want to provide HTML UI on top or as part of your game.
     *
     * ## Extending the Engine
     *
     * For complex games, any entity that inherits [[Class]] can be extended to override built-in
     * functionality. This is recommended for [[Actor|actors]] and [[Scene|scenes]], especially.
     *
     * You can customize the options or provide more for your game by extending [[Engine]].
     *
     * **TypeScript**
     *
     * ```ts
     * class Game extends ex.Engine {
     *
     *   constructor() {
     *     super({ width: 800, height: 600, displayMode: DisplayMode.FullScreen });
     *   }
     *
     *   public start() {
     *     // add custom scenes
     *     this.add("mainmenu", new MainMenu());
     *
     *     return super.start(myLoader).then(() => {
     *
     *       this.goToScene("mainmenu");
     *
     *       // custom start-up
     *     });
     *   }
     * }
     *
     * var game = new Game();
     * game.start();
     * ```
     *
     * **Javascript**
     *
     * ```js
     * var Game = ex.Engine.extend({
     *
     *   constructor: function () {
     *     Engine.call(this, { width: 800, height: 600, displayMode: DisplayMode.FullScreen });
     *   }
     *
     *   start: function() {
     *     // add custom scenes
     *     this.add("mainmenu", new MainMenu());
     *
     *     var _this = this;
     *     return Engine.prototype.start.call(this, myLoader).then(function() {
     *
     *       _this.goToScene("mainmenu");
     *
     *       // custom start-up
     *     });
     *   }
     * });
     *
     * var game = new Game();
     * game.start();
     * ```
     */
    class Engine extends ex.Class {
        /**
         * Direct access to the engine's canvas element
         */
        canvas: HTMLCanvasElement;
        /**
         * Direct access to the engine's 2D rendering context
         */
        ctx: CanvasRenderingContext2D;
        /**
         * Direct access to the canvas element ID, if an ID exists
         */
        canvasElementId: string;
        /**
         * The width of the game canvas in pixels
         */
        width: number;
        /**
         * The height of the game canvas in pixels
         */
        height: number;
        /**
         * Access engine input like pointer, keyboard, or gamepad
         */
        input: ex.Input.IEngineInput;
        private _hasStarted;
        /**
         * Current FPS
         */
        fps: number;
        /**
         * Gets or sets the list of post processors to apply at the end of drawing a frame (such as [[ColorBlindCorrector]])
         */
        postProcessors: IPostProcessor[];
        /**
         * The current [[Scene]] being drawn and updated on screen
         */
        currentScene: Scene;
        /**
         * The default [[Scene]] of the game, use [[Engine.goToScene]] to transition to different scenes.
         */
        rootScene: Scene;
        /**
         * Contains all the scenes currently registered with Excalibur
         */
        scenes: {
            [key: string]: Scene;
        };
        private _animations;
        /**
         * Indicates whether the engine is set to fullscreen or not
         */
        isFullscreen: boolean;
        /**
         * Indicates the current [[DisplayMode]] of the engine.
         */
        displayMode: DisplayMode;
        /**
         * Indicates whether audio should be paused when the game is no longer visible.
         */
        pauseAudioWhenHidden: boolean;
        /**
         * Indicates whether the engine should draw with debug information
         */
        isDebug: boolean;
        debugColor: Color;
        /**
         * Sets the background color for the engine.
         */
        backgroundColor: Color;
        /**
         * The action to take when a fatal exception is thrown
         */
        onFatalException: (e: any) => void;
        private _logger;
        private _isSmoothingEnabled;
        private _requestId;
        private _compatible;
        private _timescale;
        private _loader;
        private _isLoading;
        on(eventName: ex.Events.visible, handler: (event?: VisibleEvent) => void): any;
        on(eventName: ex.Events.hidden, handler: (event?: HiddenEvent) => void): any;
        on(eventName: ex.Events.start, handler: (event?: GameStartEvent) => void): any;
        on(eventName: ex.Events.stop, handler: (event?: GameStopEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        /**
         * Default [[IEngineOptions]]
         */
        private static _DefaultEngineOptions;
        /**
         * Creates a new game using the given [[IEngineOptions]]. By default, if no options are provided,
         * the game will be rendered full screen (taking up all available browser window space).
         * You can customize the game rendering through [[IEngineOptions]].
         *
         * Example:
         *
         * ```js
         * var game = new ex.Engine({
         *   width: 0, // the width of the canvas
         *   height: 0, // the height of the canvas
         *   canvasElementId: '', // the DOM canvas element ID, if you are providing your own
         *   displayMode: ex.DisplayMode.FullScreen, // the display mode
         *   pointerScope: ex.Input.PointerScope.Document // the scope of capturing pointer (mouse/touch) events
         * });
         *
         * // call game.start, which is a Promise
         * game.start().then(function () {
         *   // ready, set, go!
         * });
         * ```
         */
        constructor(options?: IEngineOptions);
        /**
         * Gets the current engine timescale factor (default is 1.0 which is 1:1 time)
         */
        /**
         * Sets the current engine timescale factor. Useful for creating slow-motion effects or fast-forward effects
         * when using time-based movement.
         */
        timescale: number;
        /**
         * Plays a sprite animation on the screen at the specified `x` and `y`
         * (in game coordinates, not screen pixels). These animations play
         * independent of actors, and will be cleaned up internally as soon
         * as they are complete. Note animations that loop will never be
         * cleaned up.
         *
         * @param animation  Animation to play
         * @param x          x game coordinate to play the animation
         * @param y          y game coordinate to play the animation
         */
        playAnimation(animation: Animation, x: number, y: number): void;
        /**
         * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
         * will be drawn and updated.
         */
        addTileMap(tileMap: TileMap): void;
        /**
         * Removes a [[TileMap]] from the [[currentScene]], it will no longer be drawn or updated.
         */
        removeTileMap(tileMap: TileMap): void;
        /**
         * Adds a [[Timer]] to the [[currentScene]].
         * @param timer  The timer to add to the [[currentScene]].
         */
        addTimer(timer: Timer): Timer;
        /**
         * Removes a [[Timer]] from the [[currentScene]].
         * @param timer  The timer to remove to the [[currentScene]].
         */
        removeTimer(timer: Timer): Timer;
        /**
         * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
         * would levels or menus.
         *
         * @param key  The name of the scene, must be unique
         * @param scene The scene to add to the engine
         */
        addScene(key: string, scene: Scene): void;
        /**
         * Removes a [[Scene]] instance from the engine
         * @param scene  The scene to remove
         */
        removeScene(scene: Scene): void;
        /**
         * Removes a scene from the engine by key
         * @param key  The scene key to remove
         */
        removeScene(key: string): void;
        /**
         * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
         * would levels or menus.
         * @param sceneKey  The key of the scene, must be unique
         * @param scene     The scene to add to the engine
         */
        add(sceneKey: string, scene: Scene): void;
        /**
         * Adds a [[Timer]] to the [[currentScene]].
         * @param timer  The timer to add to the [[currentScene]].
         */
        add(timer: Timer): void;
        /**
         * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
         * will be drawn and updated.
         */
        add(tileMap: TileMap): void;
        /**
         * Adds an actor to the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.add(actor)`.
         *
         * Actors can only be drawn if they are a member of a scene, and only
         * the [[currentScene]] may be drawn or updated.
         *
         * @param actor  The actor to add to the [[currentScene]]
         */
        add(actor: Actor): void;
        /**
         * Adds a [[UIActor]] to the [[currentScene]] of the game,
         * UIActors do not participate in collisions, instead the
         * remain in the same place on the screen.
         * @param uiActor  The UIActor to add to the [[currentScene]]
         */
        add(uiActor: UIActor): void;
        /**
         * Removes a scene instance from the engine
         * @param scene  The scene to remove
         */
        remove(scene: Scene): void;
        /**
         * Removes a scene from the engine by key
         * @param sceneKey  The scene to remove
         */
        remove(sceneKey: string): void;
        /**
         * Removes a [[Timer]] from the [[currentScene]].
         * @param timer  The timer to remove to the [[currentScene]].
         */
        remove(timer: Timer): void;
        /**
         * Removes a [[TileMap]] from the [[currentScene]], it will no longer be drawn or updated.
         */
        remove(tileMap: TileMap): void;
        /**
         * Removes an actor from the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.removeChild(actor)`.
         * Actors that are removed from a scene will no longer be drawn or updated.
         *
         * @param actor  The actor to remove from the [[currentScene]].
         */
        remove(actor: Actor): void;
        /**
         * Removes a [[UIActor]] to the scene, it will no longer be drawn or updated
         * @param uiActor  The UIActor to remove from the [[currentScene]]
         */
        remove(uiActor: UIActor): void;
        /**
         * Adds an actor to the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.add(actor)`.
         *
         * Actors can only be drawn if they are a member of a scene, and only
         * the [[currentScene]] may be drawn or updated.
         *
         * @param actor  The actor to add to the [[currentScene]]
         */
        protected _addChild(actor: Actor): void;
        /**
         * Removes an actor from the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.remove(actor)`.
         * Actors that are removed from a scene will no longer be drawn or updated.
         *
         * @param actor  The actor to remove from the [[currentScene]].
         */
        protected _removeChild(actor: Actor): void;
        /**
         * Changes the currently updating and drawing scene to a different,
         * named scene. Calls the [[Scene]] lifecycle events.
         * @param key  The key of the scene to trasition to.
         */
        goToScene(key: string): void;
        /**
         * Returns the width of the engine's drawing surface in pixels.
         */
        getWidth(): number;
        /**
         * Returns the height of the engine's drawing surface in pixels.
         */
        getHeight(): number;
        /**
         * Transforms the current x, y from screen coordinates to world coordinates
         * @param point  Screen coordinate to convert
         */
        screenToWorldCoordinates(point: Vector): Vector;
        /**
         * Transforms a world coordinate, to a screen coordinate
         * @param point  World coordinate to convert
         */
        worldToScreenCoordinates(point: Vector): Vector;
        /**
         * Sets the internal canvas height based on the selected display mode.
         */
        private _setHeightByDisplayMode(parent);
        /**
         * Initializes the internal canvas, rendering context, displaymode, and native event listeners
         */
        private _initialize(options?);
        /**
         * If supported by the browser, this will set the antialiasing flag on the
         * canvas. Set this to `false` if you want a 'jagged' pixel art look to your
         * image resources.
         * @param isSmooth  Set smoothing to true or false
         */
        setAntialiasing(isSmooth: boolean): void;
        /**
         * Return the current smoothing status of the canvas
         */
        getAntialiasing(): boolean;
        /**
         * Updates the entire state of the game
         * @param delta  Number of milliseconds elapsed since the last update.
         */
        private _update(delta);
        /**
         * Draws the entire game
         * @param draw  Number of milliseconds elapsed since the last draw.
         */
        private _draw(delta);
        /**
         * Starts the internal game loop for Excalibur after loading
         * any provided assets.
         * @param loader  Optional [[ILoader]] to use to load resources. The default loader is [[Loader]], override to provide your own
         * custom loader.
         */
        start(loader?: ILoader): Promise<any>;
        static createMainLoop(game: Engine, raf: (Function) => number, nowFn: () => number): () => void;
        /**
         * Stops Excalibur's main loop, useful for pausing the game.
         */
        stop(): void;
        /**
         * Takes a screen shot of the current viewport and returns it as an
         * HTML Image Element.
         */
        screenshot(): HTMLImageElement;
        /**
         * Another option available to you to load resources into the game.
         * Immediately after calling this the game will pause and the loading screen
         * will appear.
         * @param loader  Some [[ILoadable]] such as a [[Loader]] collection, [[Sound]], or [[Texture]].
         */
        load(loader: ILoadable): Promise<any>;
    }
}
