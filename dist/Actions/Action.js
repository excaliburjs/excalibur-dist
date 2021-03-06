var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RotationType } from './RotationType';
import { Vector } from '../Algebra';
import { Logger } from '../Util/Log';
import * as Util from '../Util/Util';
import { obsolete } from '../Util/Decorators';
export class EaseTo {
    constructor(actor, x, y, duration, easingFcn) {
        this.actor = actor;
        this.easingFcn = easingFcn;
        this._currentLerpTime = 0;
        this._lerpDuration = 1 * 1000; // 1 second
        this._lerpStart = new Vector(0, 0);
        this._lerpEnd = new Vector(0, 0);
        this._initialized = false;
        this._stopped = false;
        this._distance = 0;
        this._lerpDuration = duration;
        this._lerpEnd = new Vector(x, y);
    }
    _initialize() {
        this._lerpStart = new Vector(this.actor.pos.x, this.actor.pos.y);
        this._currentLerpTime = 0;
        this._distance = this._lerpStart.distance(this._lerpEnd);
    }
    update(delta) {
        if (!this._initialized) {
            this._initialize();
            this._initialized = true;
        }
        // Need to update lerp time first, otherwise the first update will always be zero
        this._currentLerpTime += delta;
        let newX = this.actor.pos.x;
        let newY = this.actor.pos.y;
        if (this._currentLerpTime < this._lerpDuration) {
            if (this._lerpEnd.x < this._lerpStart.x) {
                newX =
                    this._lerpStart.x -
                        (this.easingFcn(this._currentLerpTime, this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
            }
            else {
                newX = this.easingFcn(this._currentLerpTime, this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
            }
            if (this._lerpEnd.y < this._lerpStart.y) {
                newY =
                    this._lerpStart.y -
                        (this.easingFcn(this._currentLerpTime, this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
            }
            else {
                newY = this.easingFcn(this._currentLerpTime, this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
            }
            // Given the lerp position figure out the velocity in pixels per second
            this.actor.vel.x = (newX - this.actor.pos.x) / (delta / 1000);
            this.actor.vel.y = (newY - this.actor.pos.y) / (delta / 1000);
        }
        else {
            this.actor.pos.x = this._lerpEnd.x;
            this.actor.pos.y = this._lerpEnd.y;
            this.actor.vel = Vector.Zero;
            //this._lerpStart = null;
            //this._lerpEnd = null;
            //this._currentLerpTime = 0;
        }
    }
    isComplete(actor) {
        return this._stopped || new Vector(actor.pos.x, actor.pos.y).distance(this._lerpStart) >= this._distance;
    }
    reset() {
        this._initialized = false;
    }
    stop() {
        this.actor.vel.y = 0;
        this.actor.vel.x = 0;
        this._stopped = true;
    }
}
export class MoveTo {
    constructor(actor, destx, desty, speed) {
        this._started = false;
        this._stopped = false;
        this._actor = actor;
        this._end = new Vector(destx, desty);
        this._speed = speed;
    }
    update(_delta) {
        if (!this._started) {
            this._started = true;
            this._start = new Vector(this._actor.pos.x, this._actor.pos.y);
            this._distance = this._start.distance(this._end);
            this._dir = this._end.sub(this._start).normalize();
        }
        const m = this._dir.scale(this._speed);
        this._actor.vel.x = m.x;
        this._actor.vel.y = m.y;
        if (this.isComplete(this._actor)) {
            this._actor.pos.x = this._end.x;
            this._actor.pos.y = this._end.y;
            this._actor.vel.y = 0;
            this._actor.vel.x = 0;
        }
    }
    isComplete(actor) {
        return this._stopped || new Vector(actor.pos.x, actor.pos.y).distance(this._start) >= this._distance;
    }
    stop() {
        this._actor.vel.y = 0;
        this._actor.vel.x = 0;
        this._stopped = true;
    }
    reset() {
        this._started = false;
    }
}
export class MoveBy {
    constructor(actor, offsetX, offsetY, speed) {
        this._started = false;
        this._stopped = false;
        this._actor = actor;
        this._speed = speed;
        this._offset = new Vector(offsetX, offsetY);
        if (speed <= 0) {
            Logger.getInstance().error('Attempted to moveBy with speed less than or equal to zero : ' + speed);
            throw new Error('Speed must be greater than 0 pixels per second');
        }
    }
    update(_delta) {
        if (!this._started) {
            this._started = true;
            this._start = new Vector(this._actor.pos.x, this._actor.pos.y);
            this._end = this._start.add(this._offset);
            this._distance = this._offset.size;
            this._dir = this._end.sub(this._start).normalize();
        }
        this._actor.vel = this._dir.scale(this._speed);
        if (this.isComplete(this._actor)) {
            this._actor.pos.x = this._end.x;
            this._actor.pos.y = this._end.y;
            this._actor.vel.y = 0;
            this._actor.vel.x = 0;
        }
    }
    isComplete(actor) {
        return this._stopped || actor.pos.distance(this._start) >= this._distance;
    }
    stop() {
        this._actor.vel.y = 0;
        this._actor.vel.x = 0;
        this._stopped = true;
    }
    reset() {
        this._started = false;
    }
}
export class Follow {
    constructor(actor, actorToFollow, followDistance) {
        this._started = false;
        this._stopped = false;
        this._actor = actor;
        this._actorToFollow = actorToFollow;
        this._current = new Vector(this._actor.pos.x, this._actor.pos.y);
        this._end = new Vector(actorToFollow.pos.x, actorToFollow.pos.y);
        this._maximumDistance = followDistance !== undefined ? followDistance : this._current.distance(this._end);
        this._speed = 0;
    }
    update(_delta) {
        if (!this._started) {
            this._started = true;
            this._distanceBetween = this._current.distance(this._end);
            this._dir = this._end.sub(this._current).normalize();
        }
        const actorToFollowSpeed = Math.sqrt(Math.pow(this._actorToFollow.vel.x, 2) + Math.pow(this._actorToFollow.vel.y, 2));
        if (actorToFollowSpeed !== 0) {
            this._speed = actorToFollowSpeed;
        }
        this._current.x = this._actor.pos.x;
        this._current.y = this._actor.pos.y;
        this._end.x = this._actorToFollow.pos.x;
        this._end.y = this._actorToFollow.pos.y;
        this._distanceBetween = this._current.distance(this._end);
        this._dir = this._end.sub(this._current).normalize();
        if (this._distanceBetween >= this._maximumDistance) {
            const m = this._dir.scale(this._speed);
            this._actor.vel.x = m.x;
            this._actor.vel.y = m.y;
        }
        else {
            this._actor.vel.x = 0;
            this._actor.vel.y = 0;
        }
        if (this.isComplete()) {
            this._actor.pos.x = this._end.x;
            this._actor.pos.y = this._end.y;
            this._actor.vel.y = 0;
            this._actor.vel.x = 0;
        }
    }
    stop() {
        this._actor.vel.y = 0;
        this._actor.vel.x = 0;
        this._stopped = true;
    }
    isComplete() {
        // the actor following should never stop unless specified to do so
        return this._stopped;
    }
    reset() {
        this._started = false;
    }
}
export class Meet {
    constructor(actor, actorToMeet, speed) {
        this._started = false;
        this._stopped = false;
        this._speedWasSpecified = false;
        this._actor = actor;
        this._actorToMeet = actorToMeet;
        this._current = new Vector(this._actor.pos.x, this._actor.pos.y);
        this._end = new Vector(actorToMeet.pos.x, actorToMeet.pos.y);
        this._speed = speed || 0;
        if (speed !== undefined) {
            this._speedWasSpecified = true;
        }
    }
    update(_delta) {
        if (!this._started) {
            this._started = true;
            this._distanceBetween = this._current.distance(this._end);
            this._dir = this._end.sub(this._current).normalize();
        }
        const actorToMeetSpeed = Math.sqrt(Math.pow(this._actorToMeet.vel.x, 2) + Math.pow(this._actorToMeet.vel.y, 2));
        if (actorToMeetSpeed !== 0 && !this._speedWasSpecified) {
            this._speed = actorToMeetSpeed;
        }
        this._current.x = this._actor.pos.x;
        this._current.y = this._actor.pos.y;
        this._end.x = this._actorToMeet.pos.x;
        this._end.y = this._actorToMeet.pos.y;
        this._distanceBetween = this._current.distance(this._end);
        this._dir = this._end.sub(this._current).normalize();
        const m = this._dir.scale(this._speed);
        this._actor.vel.x = m.x;
        this._actor.vel.y = m.y;
        if (this.isComplete()) {
            this._actor.pos.x = this._end.x;
            this._actor.pos.y = this._end.y;
            this._actor.vel.y = 0;
            this._actor.vel.x = 0;
        }
    }
    isComplete() {
        return this._stopped || this._distanceBetween <= 1;
    }
    stop() {
        this._actor.vel.y = 0;
        this._actor.vel.x = 0;
        this._stopped = true;
    }
    reset() {
        this._started = false;
    }
}
export class RotateTo {
    constructor(actor, angleRadians, speed, rotationType) {
        this._started = false;
        this._stopped = false;
        this._actor = actor;
        this._end = angleRadians;
        this._speed = speed;
        this._rotationType = rotationType || RotationType.ShortestPath;
    }
    update(_delta) {
        if (!this._started) {
            this._started = true;
            this._start = this._actor.rotation;
            const distance1 = Math.abs(this._end - this._start);
            const distance2 = Util.TwoPI - distance1;
            if (distance1 > distance2) {
                this._shortDistance = distance2;
                this._longDistance = distance1;
            }
            else {
                this._shortDistance = distance1;
                this._longDistance = distance2;
            }
            this._shortestPathIsPositive = (this._start - this._end + Util.TwoPI) % Util.TwoPI >= Math.PI;
            switch (this._rotationType) {
                case RotationType.ShortestPath:
                    this._distance = this._shortDistance;
                    if (this._shortestPathIsPositive) {
                        this._direction = 1;
                    }
                    else {
                        this._direction = -1;
                    }
                    break;
                case RotationType.LongestPath:
                    this._distance = this._longDistance;
                    if (this._shortestPathIsPositive) {
                        this._direction = -1;
                    }
                    else {
                        this._direction = 1;
                    }
                    break;
                case RotationType.Clockwise:
                    this._direction = 1;
                    if (this._shortestPathIsPositive) {
                        this._distance = this._shortDistance;
                    }
                    else {
                        this._distance = this._longDistance;
                    }
                    break;
                case RotationType.CounterClockwise:
                    this._direction = -1;
                    if (!this._shortestPathIsPositive) {
                        this._distance = this._shortDistance;
                    }
                    else {
                        this._distance = this._longDistance;
                    }
                    break;
            }
        }
        this._actor.rx = this._direction * this._speed;
        if (this.isComplete()) {
            this._actor.rotation = this._end;
            this._actor.rx = 0;
            this._stopped = true;
        }
    }
    isComplete() {
        const distanceTravelled = Math.abs(this._actor.rotation - this._start);
        return this._stopped || distanceTravelled >= Math.abs(this._distance);
    }
    stop() {
        this._actor.rx = 0;
        this._stopped = true;
    }
    reset() {
        this._started = false;
    }
}
export class RotateBy {
    constructor(actor, angleRadiansOffset, speed, rotationType) {
        this._started = false;
        this._stopped = false;
        this._actor = actor;
        this._speed = speed;
        this._offset = angleRadiansOffset;
        this._rotationType = rotationType || RotationType.ShortestPath;
    }
    update(_delta) {
        if (!this._started) {
            this._started = true;
            this._start = this._actor.rotation;
            this._end = this._start + this._offset;
            const distance1 = Math.abs(this._end - this._start);
            const distance2 = Util.TwoPI - distance1;
            if (distance1 > distance2) {
                this._shortDistance = distance2;
                this._longDistance = distance1;
            }
            else {
                this._shortDistance = distance1;
                this._longDistance = distance2;
            }
            this._shortestPathIsPositive = (this._start - this._end + Util.TwoPI) % Util.TwoPI >= Math.PI;
            switch (this._rotationType) {
                case RotationType.ShortestPath:
                    this._distance = this._shortDistance;
                    if (this._shortestPathIsPositive) {
                        this._direction = 1;
                    }
                    else {
                        this._direction = -1;
                    }
                    break;
                case RotationType.LongestPath:
                    this._distance = this._longDistance;
                    if (this._shortestPathIsPositive) {
                        this._direction = -1;
                    }
                    else {
                        this._direction = 1;
                    }
                    break;
                case RotationType.Clockwise:
                    this._direction = 1;
                    if (this._shortDistance >= 0) {
                        this._distance = this._shortDistance;
                    }
                    else {
                        this._distance = this._longDistance;
                    }
                    break;
                case RotationType.CounterClockwise:
                    this._direction = -1;
                    if (this._shortDistance <= 0) {
                        this._distance = this._shortDistance;
                    }
                    else {
                        this._distance = this._longDistance;
                    }
                    break;
            }
        }
        this._actor.rx = this._direction * this._speed;
        if (this.isComplete()) {
            this._actor.rotation = this._end;
            this._actor.rx = 0;
            this._stopped = true;
        }
    }
    isComplete() {
        const distanceTravelled = Math.abs(this._actor.rotation - this._start);
        return this._stopped || distanceTravelled >= Math.abs(this._distance);
    }
    stop() {
        this._actor.rx = 0;
        this._stopped = true;
    }
    reset() {
        this._started = false;
    }
}
let ScaleTo = class ScaleTo {
    constructor(actor, scaleX, scaleY, speedX, speedY) {
        this._started = false;
        this._stopped = false;
        this._actor = actor;
        this._endX = scaleX;
        this._endY = scaleY;
        this._speedX = speedX;
        this._speedY = speedY;
    }
    update(_delta) {
        if (!this._started) {
            this._started = true;
            this._startX = this._actor.scale.x;
            this._startY = this._actor.scale.y;
            this._distanceX = Math.abs(this._endX - this._startX);
            this._distanceY = Math.abs(this._endY - this._startY);
        }
        if (!(Math.abs(this._actor.scale.x - this._startX) >= this._distanceX)) {
            const directionX = this._endY < this._startY ? -1 : 1;
            this._actor.sx = this._speedX * directionX;
        }
        else {
            this._actor.sx = 0;
        }
        if (!(Math.abs(this._actor.scale.y - this._startY) >= this._distanceY)) {
            const directionY = this._endY < this._startY ? -1 : 1;
            this._actor.sy = this._speedY * directionY;
        }
        else {
            this._actor.sy = 0;
        }
        if (this.isComplete()) {
            this._actor.scale.x = this._endX;
            this._actor.scale.y = this._endY;
            this._actor.sx = 0;
            this._actor.sy = 0;
        }
    }
    isComplete() {
        return (this._stopped ||
            (Math.abs(this._actor.scale.y - this._startX) >= this._distanceX && Math.abs(this._actor.scale.y - this._startY) >= this._distanceY));
    }
    stop() {
        this._actor.sx = 0;
        this._actor.sy = 0;
        this._stopped = true;
    }
    reset() {
        this._started = false;
    }
};
ScaleTo = __decorate([
    obsolete({ message: 'ex.Action.ScaleTo will be removed in v0.25.0', alternateMethod: 'Set width and hight directly' })
], ScaleTo);
export { ScaleTo };
let ScaleBy = class ScaleBy {
    constructor(actor, scaleOffsetX, scaleOffsetY, speed) {
        this._started = false;
        this._stopped = false;
        this._actor = actor;
        this._offset = new Vector(scaleOffsetX, scaleOffsetY);
        this._speedX = this._speedY = speed;
    }
    update(_delta) {
        if (!this._started) {
            this._started = true;
            this._startScale = this._actor.scale.clone();
            this._endScale = this._startScale.add(this._offset);
            this._distanceX = Math.abs(this._endScale.x - this._startScale.x);
            this._distanceY = Math.abs(this._endScale.y - this._startScale.y);
            this._directionX = this._endScale.x < this._startScale.x ? -1 : 1;
            this._directionY = this._endScale.y < this._startScale.y ? -1 : 1;
        }
        this._actor.sx = this._speedX * this._directionX;
        this._actor.sy = this._speedY * this._directionY;
        if (this.isComplete()) {
            this._actor.scale = this._endScale;
            this._actor.sx = 0;
            this._actor.sy = 0;
        }
    }
    isComplete() {
        return (this._stopped ||
            (Math.abs(this._actor.scale.x - this._startScale.x) >= this._distanceX &&
                Math.abs(this._actor.scale.y - this._startScale.y) >= this._distanceY));
    }
    stop() {
        this._actor.sx = 0;
        this._actor.sy = 0;
        this._stopped = true;
    }
    reset() {
        this._started = false;
    }
};
ScaleBy = __decorate([
    obsolete({ message: 'ex.Action.ScaleBy will be removed in v0.25.0', alternateMethod: 'Set width and hight directly' })
], ScaleBy);
export { ScaleBy };
export class Delay {
    constructor(actor, delay) {
        this._elapsedTime = 0;
        this._started = false;
        this._stopped = false;
        this._actor = actor;
        this._delay = delay;
    }
    update(delta) {
        if (!this._started) {
            this._started = true;
        }
        this.x = this._actor.pos.x;
        this.y = this._actor.pos.y;
        this._elapsedTime += delta;
    }
    isComplete() {
        return this._stopped || this._elapsedTime >= this._delay;
    }
    stop() {
        this._stopped = true;
    }
    reset() {
        this._elapsedTime = 0;
        this._started = false;
    }
}
export class Blink {
    constructor(actor, timeVisible, timeNotVisible, numBlinks = 1) {
        this._timeVisible = 0;
        this._timeNotVisible = 0;
        this._elapsedTime = 0;
        this._totalTime = 0;
        this._stopped = false;
        this._started = false;
        this._actor = actor;
        this._timeVisible = timeVisible;
        this._timeNotVisible = timeNotVisible;
        this._duration = (timeVisible + timeNotVisible) * numBlinks;
    }
    update(delta) {
        if (!this._started) {
            this._started = true;
        }
        this._elapsedTime += delta;
        this._totalTime += delta;
        if (this._actor.visible && this._elapsedTime >= this._timeVisible) {
            this._actor.visible = false;
            this._elapsedTime = 0;
        }
        if (!this._actor.visible && this._elapsedTime >= this._timeNotVisible) {
            this._actor.visible = true;
            this._elapsedTime = 0;
        }
        if (this.isComplete()) {
            this._actor.visible = true;
        }
    }
    isComplete() {
        return this._stopped || this._totalTime >= this._duration;
    }
    stop() {
        this._actor.visible = true;
        this._stopped = true;
    }
    reset() {
        this._started = false;
        this._elapsedTime = 0;
        this._totalTime = 0;
    }
}
export class Fade {
    constructor(actor, endOpacity, speed) {
        this._multiplier = 1;
        this._started = false;
        this._stopped = false;
        this._actor = actor;
        this._endOpacity = endOpacity;
        this._speed = speed;
    }
    update(delta) {
        if (!this._started) {
            this._started = true;
            // determine direction when we start
            if (this._endOpacity < this._actor.opacity) {
                this._multiplier = -1;
            }
            else {
                this._multiplier = 1;
            }
        }
        if (this._speed > 0) {
            this._actor.opacity += (this._multiplier * (Math.abs(this._actor.opacity - this._endOpacity) * delta)) / this._speed;
        }
        this._speed -= delta;
        if (this.isComplete()) {
            this._actor.opacity = this._endOpacity;
        }
        Logger.getInstance().debug('[Action fade] Actor opacity:', this._actor.opacity);
    }
    isComplete() {
        return this._stopped || Math.abs(this._actor.opacity - this._endOpacity) < 0.05;
    }
    stop() {
        this._stopped = true;
    }
    reset() {
        this._started = false;
    }
}
export class Die {
    constructor(actor) {
        this._stopped = false;
        this._actor = actor;
    }
    update(_delta) {
        this._actor.actionQueue.clearActions();
        this._actor.kill();
        this._stopped = true;
    }
    isComplete() {
        return this._stopped;
    }
    stop() {
        return;
    }
    reset() {
        return;
    }
}
export class CallMethod {
    constructor(actor, method) {
        this._method = null;
        this._actor = null;
        this._hasBeenCalled = false;
        this._actor = actor;
        this._method = method;
    }
    update(_delta) {
        this._method.call(this._actor);
        this._hasBeenCalled = true;
    }
    isComplete() {
        return this._hasBeenCalled;
    }
    reset() {
        this._hasBeenCalled = false;
    }
    stop() {
        this._hasBeenCalled = true;
    }
}
export class Repeat {
    constructor(actor, repeat, actions) {
        this._stopped = false;
        this._actor = actor;
        this._actionQueue = new ActionQueue(actor);
        this._repeat = repeat;
        this._originalRepeat = repeat;
        const len = actions.length;
        for (let i = 0; i < len; i++) {
            actions[i].reset();
            this._actionQueue.add(actions[i]);
        }
    }
    update(delta) {
        this.x = this._actor.pos.x;
        this.y = this._actor.pos.y;
        if (!this._actionQueue.hasNext()) {
            this._actionQueue.reset();
            this._repeat--;
        }
        this._actionQueue.update(delta);
    }
    isComplete() {
        return this._stopped || this._repeat <= 0;
    }
    stop() {
        this._stopped = true;
    }
    reset() {
        this._repeat = this._originalRepeat;
    }
}
export class RepeatForever {
    constructor(actor, actions) {
        this._stopped = false;
        this._actor = actor;
        this._actionQueue = new ActionQueue(actor);
        const len = actions.length;
        for (let i = 0; i < len; i++) {
            actions[i].reset();
            this._actionQueue.add(actions[i]);
        }
    }
    update(delta) {
        this.x = this._actor.pos.x;
        this.y = this._actor.pos.y;
        if (this._stopped) {
            return;
        }
        if (!this._actionQueue.hasNext()) {
            this._actionQueue.reset();
        }
        this._actionQueue.update(delta);
    }
    isComplete() {
        return this._stopped;
    }
    stop() {
        this._stopped = true;
        this._actionQueue.clearActions();
    }
    reset() {
        return;
    }
}
/**
 * Action Queues
 *
 * Action queues are part of the [[ActionContext|Action API]] and
 * store the list of actions to be executed for an [[Actor]].
 *
 * Actors implement [[Actor.actions]] which can be manipulated by
 * advanced users to adjust the actions currently being executed in the
 * queue.
 */
export class ActionQueue {
    constructor(actor) {
        this._actions = [];
        this._completedActions = [];
        this._actor = actor;
    }
    add(action) {
        this._actions.push(action);
    }
    remove(action) {
        const index = this._actions.indexOf(action);
        this._actions.splice(index, 1);
    }
    clearActions() {
        this._actions.length = 0;
        this._completedActions.length = 0;
        if (this._currentAction) {
            this._currentAction.stop();
        }
    }
    getActions() {
        return this._actions.concat(this._completedActions);
    }
    hasNext() {
        return this._actions.length > 0;
    }
    reset() {
        this._actions = this.getActions();
        const len = this._actions.length;
        for (let i = 0; i < len; i++) {
            this._actions[i].reset();
        }
        this._completedActions = [];
    }
    update(delta) {
        if (this._actions.length > 0) {
            this._currentAction = this._actions[0];
            this._currentAction.update(delta);
            if (this._currentAction.isComplete(this._actor)) {
                this._completedActions.push(this._actions.shift());
            }
        }
    }
}
//# sourceMappingURL=Action.js.map