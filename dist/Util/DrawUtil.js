import { Color } from '../Drawing/Color';
/* istanbul ignore next */
/**
 * Draw a line on canvas context
 *
 * @param ctx The canvas context
 * @param color The color of the line
 * @param x1 The start x coordinate
 * @param y1 The start y coordinate
 * @param x2 The ending x coordinate
 * @param y2 The ending y coordinate
 * @param thickness The line thickness
 * @param cap The [[LineCapStyle]] (butt, round, or square)
 */
export function line(ctx, color = Color.Red, x1, y1, x2, y2, thickness = 1, cap = 'butt') {
    ctx.beginPath();
    ctx.lineWidth = thickness;
    ctx.lineCap = cap;
    ctx.strokeStyle = color.toString();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}
/* istanbul ignore next */
/**
 * Draw the vector as a point onto the canvas.
 */
export function point(ctx, color = Color.Red, point) {
    ctx.beginPath();
    ctx.strokeStyle = color.toString();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
}
/**
 * Draw the vector as a line onto the canvas starting a origin point.
 */
/* istanbul ignore next */
/**
 *
 */
export function vector(ctx, color, origin, vector, scale = 1.0) {
    const c = color ? color.toString() : 'blue';
    const v = vector.scale(scale);
    ctx.beginPath();
    ctx.strokeStyle = c;
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + v.x, origin.y + v.y);
    ctx.closePath();
    ctx.stroke();
}
/**
 * Draw a round rectangle on a canvas context
 *
 * @param ctx The canvas context
 * @param x The top-left x coordinate
 * @param y The top-left y coordinate
 * @param width The width of the rectangle
 * @param height The height of the rectangle
 * @param radius The border radius of the rectangle
 * @param stroke The [[Color]] to stroke rectangle with
 * @param fill The [[Color]] to fill rectangle with
 */
export function roundRect(ctx, x, y, width, height, radius = 5, stroke = Color.White, fill = null) {
    let br;
    if (typeof radius === 'number') {
        br = { tl: radius, tr: radius, br: radius, bl: radius };
    }
    else {
        const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
        for (const prop in defaultRadius) {
            if (defaultRadius.hasOwnProperty(prop)) {
                const side = prop;
                br[side] = radius[side] || defaultRadius[side];
            }
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + br.tl, y);
    ctx.lineTo(x + width - br.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + br.tr);
    ctx.lineTo(x + width, y + height - br.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - br.br, y + height);
    ctx.lineTo(x + br.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - br.bl);
    ctx.lineTo(x, y + br.tl);
    ctx.quadraticCurveTo(x, y, x + br.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill.toString();
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke.toString();
        ctx.stroke();
    }
}
/**
 *
 */
export function circle(ctx, x, y, radius, stroke = Color.White, fill = null) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill.toString();
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke.toString();
        ctx.stroke();
    }
}
//# sourceMappingURL=DrawUtil.js.map