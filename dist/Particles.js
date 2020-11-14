import { Actor } from './Actor';
import { Color } from './Drawing/Color';
import { Vector } from './Algebra';
import * as Util from './Util/Util';
import * as DrawUtil from './Util/DrawUtil';
import * as Traits from './Traits/Index';
import { Configurable } from './Configurable';
import { Random } from './Math/Random';
import { CollisionType } from './Collision/CollisionType';
/**
 * An enum that represents the types of emitter nozzles
 */
export var EmitterType;
(function (EmitterType) {
    /**
     * Constant for the circular emitter type
     */
    EmitterType[EmitterType["Circle"] = 0] = "Circle";
    /**
     * Constant for the rectangular emitter type
     */
    EmitterType[EmitterType["Rectangle"] = 1] = "Rectangle";
})(EmitterType || (EmitterType = {}));
/**
 * @hidden
 */
export class ParticleImpl {
    constructor(emitterOrConfig, life, opacity, beginColor, endColor, position, velocity, acceleration, startSize, endSize) {
        this.position = new Vector(0, 0);
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.particleRotationalVelocity = 0;
        this.currentRotation = 0;
        this.focus = null;
        this.focusAccel = 0;
        this.opacity = 1;
        this.beginColor = Color.White;
        this.endColor = Color.White;
        // Life is counted in ms
        this.life = 300;
        this.fadeFlag = false;
        // Color transitions
        this._rRate = 1;
        this._gRate = 1;
        this._bRate = 1;
        this._aRate = 0;
        this._currentColor = Color.White;
        this.emitter = null;
        this.particleSize = 5;
        this.particleSprite = null;
        this.sizeRate = 0;
        this.elapsedMultiplier = 0;
        let emitter = emitterOrConfig;
        if (emitter && !(emitterOrConfig instanceof ParticleEmitter)) {
            const config = emitterOrConfig;
            emitter = config.emitter;
            life = config.life;
            opacity = config.opacity;
            endColor = config.endColor;
            beginColor = config.beginColor;
            position = config.position;
            velocity = config.velocity;
            acceleration = config.acceleration;
            startSize = config.startSize;
            endSize = config.endSize;
        }
        this.emitter = emitter;
        this.life = life || this.life;
        this.opacity = opacity || this.opacity;
        this.endColor = endColor || this.endColor.clone();
        this.beginColor = beginColor || this.beginColor.clone();
        this._currentColor = this.beginColor.clone();
        this.position = position || this.position;
        this.velocity = velocity || this.velocity;
        this.acceleration = acceleration || this.acceleration;
        this._rRate = (this.endColor.r - this.beginColor.r) / this.life;
        this._gRate = (this.endColor.g - this.beginColor.g) / this.life;
        this._bRate = (this.endColor.b - this.beginColor.b) / this.life;
        this._aRate = this.opacity / this.life;
        this.startSize = startSize || 0;
        this.endSize = endSize || 0;
        if (this.endSize > 0 && this.startSize > 0) {
            this.sizeRate = (this.endSize - this.startSize) / this.life;
            this.particleSize = this.startSize;
        }
    }
    kill() {
        this.emitter.removeParticle(this);
    }
    update(delta) {
        this.life = this.life - delta;
        this.elapsedMultiplier = this.elapsedMultiplier + delta;
        if (this.life < 0) {
            this.kill();
        }
        if (this.fadeFlag) {
            this.opacity = Util.clamp(this._aRate * this.life, 0.0001, 1);
        }
        if (this.startSize > 0 && this.endSize > 0) {
            this.particleSize = Util.clamp(this.sizeRate * delta + this.particleSize, Math.min(this.startSize, this.endSize), Math.max(this.startSize, this.endSize));
        }
        this._currentColor.r = Util.clamp(this._currentColor.r + this._rRate * delta, 0, 255);
        this._currentColor.g = Util.clamp(this._currentColor.g + this._gRate * delta, 0, 255);
        this._currentColor.b = Util.clamp(this._currentColor.b + this._bRate * delta, 0, 255);
        this._currentColor.a = Util.clamp(this.opacity, 0.0001, 1);
        if (this.focus) {
            const accel = this.focus
                .sub(this.position)
                .normalize()
                .scale(this.focusAccel)
                .scale(delta / 1000);
            this.velocity = this.velocity.add(accel);
        }
        else {
            this.velocity = this.velocity.add(this.acceleration.scale(delta / 1000));
        }
        this.position = this.position.add(this.velocity.scale(delta / 1000));
        if (this.particleRotationalVelocity) {
            this.currentRotation = (this.currentRotation + (this.particleRotationalVelocity * delta) / 1000) % (2 * Math.PI);
        }
    }
    draw(ctx) {
        if (this.particleSprite) {
            this.particleSprite.rotation = this.currentRotation;
            this.particleSprite.scale.setTo(this.particleSize, this.particleSize);
            this.particleSprite.draw(ctx, this.position.x, this.position.y);
            return;
        }
        this._currentColor.a = Util.clamp(this.opacity, 0.0001, 1);
        ctx.fillStyle = this._currentColor.toString();
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.particleSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}
/**
 * Particle is used in a [[ParticleEmitter]]
 */
export class Particle extends Configurable(ParticleImpl) {
    constructor(emitterOrConfig, life, opacity, beginColor, endColor, position, velocity, acceleration, startSize, endSize) {
        super(emitterOrConfig, life, opacity, beginColor, endColor, position, velocity, acceleration, startSize, endSize);
    }
}
/**
 * @hidden
 */
export class ParticleEmitterImpl extends Actor {
    /**
     * @param xOrConfig The x position of the emitter, or the particle emitter options bag
     * @param y         The y position of the emitter
     * @param width     The width of the emitter
     * @param height    The height of the emitter
     */
    constructor(xOrConfig, y, width, height) {
        super(typeof xOrConfig === 'number' ? { pos: new Vector(xOrConfig, y), width: width, height: height } : xOrConfig);
        this.numParticles = 0;
        /**
         * Gets or sets the isEmitting flag
         */
        this.isEmitting = true;
        /**
         * Gets or sets the backing particle collection
         */
        this.particles = null;
        /**
         * Gets or sets the backing deadParticle collection
         */
        this.deadParticles = null;
        /**
         * Gets or sets the minimum particle velocity
         */
        this.minVel = 0;
        /**
         * Gets or sets the maximum particle velocity
         */
        this.maxVel = 0;
        /**
         * Gets or sets the acceleration vector for all particles
         */
        this.acceleration = new Vector(0, 0);
        /**
         * Gets or sets the minimum angle in radians
         */
        this.minAngle = 0;
        /**
         * Gets or sets the maximum angle in radians
         */
        this.maxAngle = 0;
        /**
         * Gets or sets the emission rate for particles (particles/sec)
         */
        this.emitRate = 1; //particles/sec
        /**
         * Gets or sets the life of each particle in milliseconds
         */
        this.particleLife = 2000;
        /**
         * Gets or sets the opacity of each particle from 0 to 1.0
         */
        this.opacity = 1;
        /**
         * Gets or sets the fade flag which causes particles to gradually fade out over the course of their life.
         */
        this.fadeFlag = false;
        /**
         * Gets or sets the optional focus where all particles should accelerate towards
         */
        this.focus = null;
        /**
         * Gets or sets the acceleration for focusing particles if a focus has been specified
         */
        this.focusAccel = 1;
        /*
         * Gets or sets the optional starting size for the particles
         */
        this.startSize = null;
        /*
         * Gets or sets the optional ending size for the particles
         */
        this.endSize = null;
        /**
         * Gets or sets the minimum size of all particles
         */
        this.minSize = 5;
        /**
         * Gets or sets the maximum size of all particles
         */
        this.maxSize = 5;
        /**
         * Gets or sets the beginning color of all particles
         */
        this.beginColor = Color.White;
        /**
         * Gets or sets the ending color of all particles
         */
        this.endColor = Color.White;
        /**
         * Gets or sets the sprite that a particle should use
         * @warning Performance intensive
         */
        this.particleSprite = null;
        /**
         * Gets or sets the emitter type for the particle emitter
         */
        this.emitterType = EmitterType.Rectangle;
        /**
         * Gets or sets the emitter radius, only takes effect when the [[emitterType]] is [[EmitterType.Circle]]
         */
        this.radius = 0;
        /**
         * Gets or sets the particle rotational speed velocity
         */
        this.particleRotationalVelocity = 0;
        /**
         * Indicates whether particles should start with a random rotation
         */
        this.randomRotation = false;
        this._particlesToEmit = 0;
        this.body.collider.type = CollisionType.PreventCollision;
        this.particles = new Util.Collection();
        this.deadParticles = new Util.Collection();
        this.random = new Random();
        // Remove offscreen culling from particle emitters
        for (let i = 0; i < this.traits.length; i++) {
            if (this.traits[i] instanceof Traits.OffscreenCulling) {
                this.traits.splice(i, 1);
            }
        }
    }
    removeParticle(particle) {
        this.deadParticles.push(particle);
    }
    /**
     * Causes the emitter to emit particles
     * @param particleCount  Number of particles to emit right now
     */
    emitParticles(particleCount) {
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this._createParticle());
        }
    }
    clearParticles() {
        this.particles.clear();
    }
    // Creates a new particle given the constraints of the emitter
    _createParticle() {
        // todo implement emitter constraints;
        let ranX = 0;
        let ranY = 0;
        const angle = Util.randomInRange(this.minAngle, this.maxAngle, this.random);
        const vel = Util.randomInRange(this.minVel, this.maxVel, this.random);
        const size = this.startSize || Util.randomInRange(this.minSize, this.maxSize, this.random);
        const dx = vel * Math.cos(angle);
        const dy = vel * Math.sin(angle);
        if (this.emitterType === EmitterType.Rectangle) {
            ranX = Util.randomInRange(0, this.width, this.random);
            ranY = Util.randomInRange(0, this.height, this.random);
        }
        else if (this.emitterType === EmitterType.Circle) {
            const radius = Util.randomInRange(0, this.radius, this.random);
            ranX = radius * Math.cos(angle);
            ranY = radius * Math.sin(angle);
        }
        const p = new Particle(this, this.particleLife, this.opacity, this.beginColor, this.endColor, new Vector(ranX, ranY), new Vector(dx, dy), this.acceleration, this.startSize, this.endSize);
        p.fadeFlag = this.fadeFlag;
        p.particleSize = size;
        if (this.particleSprite) {
            p.particleSprite = this.particleSprite;
        }
        p.particleRotationalVelocity = this.particleRotationalVelocity;
        if (this.randomRotation) {
            p.currentRotation = Util.randomInRange(0, Math.PI * 2, this.random);
        }
        if (this.focus) {
            p.focus = this.focus.add(new Vector(this.pos.x, this.pos.y));
            p.focusAccel = this.focusAccel;
        }
        return p;
    }
    update(engine, delta) {
        super.update(engine, delta);
        if (this.isEmitting) {
            this._particlesToEmit += this.emitRate * (delta / 1000);
            //var numParticles = Math.ceil(this.emitRate * delta / 1000);
            if (this._particlesToEmit > 1.0) {
                this.emitParticles(Math.floor(this._particlesToEmit));
                this._particlesToEmit = this._particlesToEmit - Math.floor(this._particlesToEmit);
            }
        }
        this.particles.forEach((p) => p.update(delta));
        this.deadParticles.forEach((p) => this.particles.removeElement(p));
        this.deadParticles.clear();
    }
    draw(ctx) {
        // todo is there a more efficient to draw
        // possibly use a webgl offscreen canvas and shaders to do particles?
        this.particles.forEach((p) => p.draw(ctx));
    }
    debugDraw(ctx) {
        super.debugDraw(ctx);
        ctx.fillStyle = Color.Black.toString();
        ctx.fillText('Particles: ' + this.particles.count(), this.pos.x, this.pos.y + 20);
        if (this.focus) {
            ctx.fillRect(this.focus.x + this.pos.x, this.focus.y + this.pos.y, 3, 3);
            DrawUtil.line(ctx, Color.Yellow, this.focus.x + this.pos.x, this.focus.y + this.pos.y, this.center.x, this.center.y);
            ctx.fillText('Focus', this.focus.x + this.pos.x, this.focus.y + this.pos.y);
        }
    }
}
/**
 * Using a particle emitter is a great way to create interesting effects
 * in your game, like smoke, fire, water, explosions, etc. `ParticleEmitter`
 * extend [[Actor]] allowing you to use all of the features that come with.
 */
export class ParticleEmitter extends Configurable(ParticleEmitterImpl) {
    constructor(xOrConfig, y, width, height) {
        super(xOrConfig, y, width, height);
    }
}
//# sourceMappingURL=Particles.js.map