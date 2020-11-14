import { ColorBlindFlags } from './DebugFlags';
/**
 * Debug statistics and flags for Excalibur. If polling these values, it would be
 * best to do so on the `postupdate` event for [[Engine]], after all values have been
 * updated during a frame.
 */
export class Debug {
    constructor(engine) {
        /**
         * Performance statistics
         */
        this.stats = {
            /**
             * Current frame statistics. Engine reuses this instance, use [[FrameStats.clone]] to copy frame stats.
             * Best accessed on [[postframe]] event. See [[FrameStats]]
             */
            currFrame: new FrameStats(),
            /**
             * Previous frame statistics. Engine reuses this instance, use [[FrameStats.clone]] to copy frame stats.
             * Best accessed on [[preframe]] event. Best inspected on engine event `preframe`. See [[FrameStats]]
             */
            prevFrame: new FrameStats()
        };
        this._engine = engine;
        this.colorBlindMode = new ColorBlindFlags(this._engine);
    }
}
/**
 * Implementation of a frame's stats. Meant to have values copied via [[FrameStats.reset]], avoid
 * creating instances of this every frame.
 */
export class FrameStats {
    constructor() {
        this._id = 0;
        this._delta = 0;
        this._fps = 0;
        this._actorStats = {
            alive: 0,
            killed: 0,
            ui: 0,
            get remaining() {
                return this.alive - this.killed;
            },
            get total() {
                return this.remaining + this.ui;
            }
        };
        this._durationStats = {
            update: 0,
            draw: 0,
            get total() {
                return this.update + this.draw;
            }
        };
        this._physicsStats = new PhysicsStats();
    }
    /**
     * Zero out values or clone other IFrameStat stats. Allows instance reuse.
     *
     * @param [otherStats] Optional stats to clone
     */
    reset(otherStats) {
        if (otherStats) {
            this.id = otherStats.id;
            this.delta = otherStats.delta;
            this.fps = otherStats.fps;
            this.actors.alive = otherStats.actors.alive;
            this.actors.killed = otherStats.actors.killed;
            this.actors.ui = otherStats.actors.ui;
            this.duration.update = otherStats.duration.update;
            this.duration.draw = otherStats.duration.draw;
            this._physicsStats.reset(otherStats.physics);
        }
        else {
            this.id = this.delta = this.fps = 0;
            this.actors.alive = this.actors.killed = this.actors.ui = 0;
            this.duration.update = this.duration.draw = 0;
            this._physicsStats.reset();
        }
    }
    /**
     * Provides a clone of this instance.
     */
    clone() {
        const fs = new FrameStats();
        fs.reset(this);
        return fs;
    }
    /**
     * Gets the frame's id
     */
    get id() {
        return this._id;
    }
    /**
     * Sets the frame's id
     */
    set id(value) {
        this._id = value;
    }
    /**
     * Gets the frame's delta (time since last frame)
     */
    get delta() {
        return this._delta;
    }
    /**
     * Sets the frame's delta (time since last frame). Internal use only.
     * @internal
     */
    set delta(value) {
        this._delta = value;
    }
    /**
     * Gets the frame's frames-per-second (FPS)
     */
    get fps() {
        return this._fps;
    }
    /**
     * Sets the frame's frames-per-second (FPS). Internal use only.
     * @internal
     */
    set fps(value) {
        this._fps = value;
    }
    /**
     * Gets the frame's actor statistics
     */
    get actors() {
        return this._actorStats;
    }
    /**
     * Gets the frame's duration statistics
     */
    get duration() {
        return this._durationStats;
    }
    /**
     * Gets the frame's physics statistics
     */
    get physics() {
        return this._physicsStats;
    }
}
export class PhysicsStats {
    constructor() {
        this._pairs = 0;
        this._collisions = 0;
        this._collidersHash = {};
        this._fastBodies = 0;
        this._fastBodyCollisions = 0;
        this._broadphase = 0;
        this._narrowphase = 0;
    }
    /**
     * Zero out values or clone other IPhysicsStats stats. Allows instance reuse.
     *
     * @param [otherStats] Optional stats to clone
     */
    reset(otherStats) {
        if (otherStats) {
            this.pairs = otherStats.pairs;
            this.collisions = otherStats.collisions;
            this.collidersHash = otherStats.collidersHash;
            this.fastBodies = otherStats.fastBodies;
            this.fastBodyCollisions = otherStats.fastBodyCollisions;
            this.broadphase = otherStats.broadphase;
            this.narrowphase = otherStats.narrowphase;
        }
        else {
            this.pairs = this.collisions = this.fastBodies = 0;
            this.fastBodyCollisions = this.broadphase = this.narrowphase = 0;
            this.collidersHash = {};
        }
    }
    /**
     * Provides a clone of this instance.
     */
    clone() {
        const ps = new PhysicsStats();
        ps.reset(this);
        return ps;
    }
    get pairs() {
        return this._pairs;
    }
    set pairs(value) {
        this._pairs = value;
    }
    get collisions() {
        return this._collisions;
    }
    set collisions(value) {
        this._collisions = value;
    }
    get collidersHash() {
        return this._collidersHash;
    }
    set collidersHash(colliders) {
        this._collidersHash = colliders;
    }
    get fastBodies() {
        return this._fastBodies;
    }
    set fastBodies(value) {
        this._fastBodies = value;
    }
    get fastBodyCollisions() {
        return this._fastBodyCollisions;
    }
    set fastBodyCollisions(value) {
        this._fastBodyCollisions = value;
    }
    get broadphase() {
        return this._broadphase;
    }
    set broadphase(value) {
        this._broadphase = value;
    }
    get narrowphase() {
        return this._narrowphase;
    }
    set narrowphase(value) {
        this._narrowphase = value;
    }
}
//# sourceMappingURL=Debug.js.map