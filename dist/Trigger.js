import { Color } from './Drawing/Color';
import { ActionQueue } from './Actions/Action';
import { EventDispatcher } from './EventDispatcher';
import { Actor, isActor } from './Actor';
import { Vector } from './Algebra';
import { ExitTriggerEvent, EnterTriggerEvent } from './Events';
import * as Util from './Util/Util';
import { CollisionType } from './Collision/CollisionType';
const triggerDefaults = {
    pos: Vector.Zero,
    width: 10,
    height: 10,
    visible: false,
    action: () => {
        return;
    },
    filter: () => true,
    repeat: -1
};
/**
 * Triggers are a method of firing arbitrary code on collision. These are useful
 * as 'buttons', 'switches', or to trigger effects in a game. By default triggers
 * are invisible, and can only be seen when [[Trigger.visible]] is set to `true`.
 */
export class Trigger extends Actor {
    /**
     *
     * @param opts Trigger options
     */
    constructor(opts) {
        super(opts.pos.x, opts.pos.y, opts.width, opts.height);
        /**
         * Action to fire when triggered by collision
         */
        this.action = () => {
            return;
        };
        /**
         * Filter to add additional granularity to action dispatch, if a filter is specified the action will only fire when
         * filter return true for the collided actor.
         */
        this.filter = () => true;
        /**
         * Number of times to repeat before killing the trigger,
         */
        this.repeat = -1;
        opts = Util.extend({}, triggerDefaults, opts);
        this.filter = opts.filter || this.filter;
        this.repeat = opts.repeat || this.repeat;
        this.action = opts.action || this.action;
        if (opts.target) {
            this.target = opts.target;
        }
        this.visible = opts.visible;
        this.body.collider.type = CollisionType.Passive;
        this.eventDispatcher = new EventDispatcher(this);
        this.actionQueue = new ActionQueue(this);
        this.on('collisionstart', (evt) => {
            if (isActor(evt.other) && this.filter(evt.other)) {
                this.emit('enter', new EnterTriggerEvent(this, evt.other));
                this._dispatchAction();
                // remove trigger if its done, -1 repeat forever
                if (this.repeat === 0) {
                    this.kill();
                }
            }
        });
        this.on('collisionend', (evt) => {
            if (isActor(evt.other) && this.filter(evt.other)) {
                this.emit('exit', new ExitTriggerEvent(this, evt.other));
            }
        });
    }
    set target(target) {
        this._target = target;
        this.filter = (actor) => actor === target;
    }
    get target() {
        return this._target;
    }
    _initialize(engine) {
        super._initialize(engine);
    }
    _dispatchAction() {
        this.action.call(this);
        this.repeat--;
    }
    /* istanbul ignore next */
    debugDraw(ctx) {
        super.debugDraw(ctx);
        // Meant to draw debug information about actors
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        const bb = this.body.collider.bounds;
        const wp = this.getWorldPos();
        bb.left = bb.left - wp.x;
        bb.right = bb.right - wp.x;
        bb.top = bb.top - wp.y;
        bb.bottom = bb.bottom - wp.y;
        // Currently collision primitives cannot rotate
        // ctx.rotate(this.rotation);
        ctx.fillStyle = Color.Violet.toString();
        ctx.strokeStyle = Color.Violet.toString();
        ctx.fillText('Trigger', 10, 10);
        bb.debugDraw(ctx);
        ctx.restore();
    }
}
//# sourceMappingURL=Trigger.js.map