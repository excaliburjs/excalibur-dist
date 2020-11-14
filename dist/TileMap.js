import { BoundingBox } from './Collision/BoundingBox';
import { Color } from './Drawing/Color';
import { vec, Vector } from './Algebra';
import { Logger } from './Util/Log';
import * as Events from './Events';
import { Configurable } from './Configurable';
import { Entity } from './EntityComponentSystem/Entity';
import { CanvasDrawComponent } from './Drawing/CanvasDrawComponent';
import { TransformComponent } from './EntityComponentSystem/Components/TransformComponent';
/**
 * @hidden
 */
export class TileMapImpl extends Entity {
    /**
     * @param xOrConfig     The x coordinate to anchor the TileMap's upper left corner (should not be changed once set) or TileMap option bag
     * @param y             The y coordinate to anchor the TileMap's upper left corner (should not be changed once set)
     * @param cellWidth     The individual width of each cell (in pixels) (should not be changed once set)
     * @param cellHeight    The individual height of each cell (in pixels) (should not be changed once set)
     * @param rows          The number of rows in the TileMap (should not be changed once set)
     * @param cols          The number of cols in the TileMap (should not be changed once set)
     */
    constructor(xOrConfig, y, cellWidth, cellHeight, rows, cols) {
        super();
        this._collidingX = -1;
        this._collidingY = -1;
        this._onScreenXStart = 0;
        this._onScreenXEnd = 9999;
        this._onScreenYStart = 0;
        this._onScreenYEnd = 9999;
        this._spriteSheets = {};
        this.logger = Logger.getInstance();
        this.data = [];
        this.z = 0;
        this.visible = true;
        this.isOffscreen = false;
        this.rotation = 0;
        this.scale = Vector.One;
        if (xOrConfig && typeof xOrConfig === 'object') {
            const config = xOrConfig;
            xOrConfig = config.x;
            y = config.y;
            cellWidth = config.cellWidth;
            cellHeight = config.cellHeight;
            rows = config.rows;
            cols = config.cols;
        }
        this.x = xOrConfig;
        this.y = y;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.rows = rows;
        this.cols = cols;
        this.data = new Array(rows * cols);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                (() => {
                    const cd = new Cell(i * cellWidth + xOrConfig, j * cellHeight + y, cellWidth, cellHeight, i + j * cols);
                    this.data[i + j * cols] = cd;
                })();
            }
        }
        this.addComponent(new TransformComponent());
        this.addComponent(new CanvasDrawComponent((ctx, delta) => this.draw(ctx, delta)));
    }
    get pos() {
        return vec(this.x, this.y);
    }
    set pos(val) {
        this.x = val.x;
        this.y = val.y;
    }
    on(eventName, handler) {
        super.on(eventName, handler);
    }
    registerSpriteSheet(key, spriteSheet) {
        this._spriteSheets[key] = spriteSheet;
    }
    /**
     * Returns the intersection vector that can be used to resolve collisions with actors. If there
     * is no collision null is returned.
     */
    collides(actor) {
        const width = actor.pos.x + actor.width;
        const height = actor.pos.y + actor.height;
        const actorBounds = actor.body.collider.bounds;
        const overlaps = [];
        if (actor.width <= 0 || actor.height <= 0) {
            return null;
        }
        // trace points for overlap
        for (let x = actorBounds.left; x <= width; x += Math.min(actor.width / 2, this.cellWidth / 2)) {
            for (let y = actorBounds.top; y <= height; y += Math.min(actor.height / 2, this.cellHeight / 2)) {
                const cell = this.getCellByPoint(x, y);
                if (cell && cell.solid) {
                    const overlap = actorBounds.intersect(cell.bounds);
                    const dir = actor.center.sub(cell.center);
                    if (overlap && overlap.dot(dir) > 0) {
                        overlaps.push(overlap);
                    }
                }
            }
        }
        if (overlaps.length === 0) {
            return null;
        }
        // Return the smallest change other than zero
        const result = overlaps.reduce((accum, next) => {
            let x = accum.x;
            let y = accum.y;
            if (Math.abs(accum.x) < Math.abs(next.x)) {
                x = next.x;
            }
            if (Math.abs(accum.y) < Math.abs(next.y)) {
                y = next.y;
            }
            return new Vector(x, y);
        });
        return result;
    }
    /**
     * Returns the [[Cell]] by index (row major order)
     */
    getCellByIndex(index) {
        return this.data[index];
    }
    /**
     * Returns the [[Cell]] by its x and y coordinates
     */
    getCell(x, y) {
        if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) {
            return null;
        }
        return this.data[x + y * this.cols];
    }
    /**
     * Returns the [[Cell]] by testing a point in global coordinates,
     * returns `null` if no cell was found.
     */
    getCellByPoint(x, y) {
        x = Math.floor((x - this.x) / this.cellWidth);
        y = Math.floor((y - this.y) / this.cellHeight);
        const cell = this.getCell(x, y);
        if (x >= 0 && y >= 0 && x < this.cols && y < this.rows && cell) {
            return cell;
        }
        return null;
    }
    onPreUpdate(_engine, _delta) {
        // Override me
    }
    onPostUpdate(_engine, _delta) {
        // Override me
    }
    update(engine, delta) {
        this.onPreUpdate(engine, delta);
        this.emit('preupdate', new Events.PreUpdateEvent(engine, delta, this));
        const worldCoordsUpperLeft = engine.screenToWorldCoordinates(new Vector(0, 0));
        const worldCoordsLowerRight = engine.screenToWorldCoordinates(new Vector(engine.canvas.clientWidth, engine.canvas.clientHeight));
        this._onScreenXStart = Math.max(Math.floor((worldCoordsUpperLeft.x - this.x) / this.cellWidth) - 2, 0);
        this._onScreenYStart = Math.max(Math.floor((worldCoordsUpperLeft.y - this.y) / this.cellHeight) - 2, 0);
        this._onScreenXEnd = Math.max(Math.floor((worldCoordsLowerRight.x - this.x) / this.cellWidth) + 2, 0);
        this._onScreenYEnd = Math.max(Math.floor((worldCoordsLowerRight.y - this.y) / this.cellHeight) + 2, 0);
        this.onPostUpdate(engine, delta);
        this.emit('postupdate', new Events.PostUpdateEvent(engine, delta, this));
    }
    /**
     * Draws the tile map to the screen. Called by the [[Scene]].
     * @param ctx    The current rendering context
     * @param delta  The number of milliseconds since the last draw
     */
    draw(ctx, delta) {
        this.emit('predraw', new Events.PreDrawEvent(ctx, delta, this));
        let x = this._onScreenXStart;
        const xEnd = Math.min(this._onScreenXEnd, this.cols);
        let y = this._onScreenYStart;
        const yEnd = Math.min(this._onScreenYEnd, this.rows);
        let cs, csi, cslen;
        for (x; x < xEnd; x++) {
            for (y; y < yEnd; y++) {
                // get non-negative tile sprites
                cs = this.getCell(x, y).sprites.filter((s) => {
                    return s.spriteId > -1;
                });
                for (csi = 0, cslen = cs.length; csi < cslen; csi++) {
                    const ss = this._spriteSheets[cs[csi].spriteSheetKey];
                    // draw sprite, warning if sprite doesn't exist
                    if (ss) {
                        const sprite = ss.getSprite(cs[csi].spriteId);
                        if (sprite) {
                            sprite.draw(ctx, x * this.cellWidth, y * this.cellHeight);
                        }
                        else {
                            this.logger.warn('Sprite does not exist for id', cs[csi].spriteId, 'in sprite sheet', cs[csi].spriteSheetKey, sprite, ss);
                        }
                    }
                    else {
                        this.logger.warn('Sprite sheet', cs[csi].spriteSheetKey, 'does not exist', ss);
                    }
                }
            }
            y = this._onScreenYStart;
        }
        this.emit('postdraw', new Events.PostDrawEvent(ctx, delta, this));
    }
    /**
     * Draws all the tile map's debug info. Called by the [[Scene]].
     * @param ctx  The current rendering context
     */
    debugDraw(ctx) {
        const width = this.cols * this.cellWidth;
        const height = this.rows * this.cellHeight;
        ctx.save();
        ctx.strokeStyle = Color.Red.toString();
        for (let x = 0; x < this.cols + 1; x++) {
            ctx.beginPath();
            ctx.moveTo(this.x + x * this.cellWidth, this.y);
            ctx.lineTo(this.x + x * this.cellWidth, this.y + height);
            ctx.stroke();
        }
        for (let y = 0; y < this.rows + 1; y++) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + y * this.cellHeight);
            ctx.lineTo(this.x + width, this.y + y * this.cellHeight);
            ctx.stroke();
        }
        const solid = Color.Red;
        solid.a = 0.3;
        this.data
            .filter(function (cell) {
            return cell.solid;
        })
            .forEach(function (cell) {
            ctx.fillStyle = solid.toString();
            ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
        });
        if (this._collidingY > -1 && this._collidingX > -1) {
            ctx.fillStyle = Color.Cyan.toString();
            ctx.fillRect(this.x + this._collidingX * this.cellWidth, this.y + this._collidingY * this.cellHeight, this.cellWidth, this.cellHeight);
        }
        ctx.restore();
    }
}
/**
 * The [[TileMap]] class provides a lightweight way to do large complex scenes with collision
 * without the overhead of actors.
 */
export class TileMap extends Configurable(TileMapImpl) {
    constructor(xOrConfig, y, cellWidth, cellHeight, rows, cols) {
        super(xOrConfig, y, cellWidth, cellHeight, rows, cols);
    }
}
/**
 * Tile sprites are used to render a specific sprite from a [[TileMap]]'s spritesheet(s)
 */
export class TileSprite {
    /**
     * @param spriteSheetKey  The key of the spritesheet to use
     * @param spriteId        The index of the sprite in the [[SpriteSheet]]
     */
    constructor(spriteSheetKey, spriteId) {
        this.spriteSheetKey = spriteSheetKey;
        this.spriteId = spriteId;
    }
}
/**
 * @hidden
 */
export class CellImpl {
    /**
     * @param xOrConfig Gets or sets x coordinate of the cell in world coordinates or cell option bag
     * @param y       Gets or sets y coordinate of the cell in world coordinates
     * @param width   Gets or sets the width of the cell
     * @param height  Gets or sets the height of the cell
     * @param index   The index of the cell in row major order
     * @param solid   Gets or sets whether this cell is solid
     * @param sprites The list of tile sprites to use to draw in this cell (in order)
     */
    constructor(xOrConfig, y, width, height, index, solid = false, sprites = []) {
        this.solid = false;
        this.sprites = [];
        if (xOrConfig && typeof xOrConfig === 'object') {
            const config = xOrConfig;
            xOrConfig = config.x;
            y = config.y;
            width = config.width;
            height = config.height;
            index = config.index;
            solid = config.solid;
            sprites = config.sprites;
        }
        this.x = xOrConfig;
        this.y = y;
        this.width = width;
        this.height = height;
        this.index = index;
        this.solid = solid;
        this.sprites = sprites;
        this._bounds = new BoundingBox(this.x, this.y, this.x + this.width, this.y + this.height);
    }
    get bounds() {
        return this._bounds;
    }
    get center() {
        return new Vector(this.x + this.width / 2, this.y + this.height / 2);
    }
    /**
     * Add another [[TileSprite]] to this cell
     */
    pushSprite(tileSprite) {
        this.sprites.push(tileSprite);
    }
    /**
     * Remove an instance of [[TileSprite]] from this cell
     */
    removeSprite(tileSprite) {
        let index = -1;
        if ((index = this.sprites.indexOf(tileSprite)) > -1) {
            this.sprites.splice(index, 1);
        }
    }
    /**
     * Clear all sprites from this cell
     */
    clearSprites() {
        this.sprites.length = 0;
    }
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
export class Cell extends Configurable(CellImpl) {
    constructor(xOrConfig, y, width, height, index, solid, sprites) {
        super(xOrConfig, y, width, height, index, solid, sprites);
    }
}
//# sourceMappingURL=TileMap.js.map