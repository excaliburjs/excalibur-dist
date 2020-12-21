var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Resource } from './Resource';
import { Texture } from './Texture';
import { Color } from '../Drawing/Color';
import { SpriteSheet } from '../Drawing/SpriteSheet';
/**
 * The [[Texture]] object allows games built in Excalibur to load image resources.
 * [[Texture]] is an [[Loadable]] which means it can be passed to a [[Loader]]
 * to pre-load before starting a level or game.
 */
export class Gif {
    /**
     * @param path       Path to the image resource
     * @param color      Optionally set the color to treat as transparent the gif, by default [[Color.Magenta]]
     * @param bustCache  Optionally load texture with cache busting
     */
    constructor(path, color = Color.Magenta, bustCache = true) {
        this.path = path;
        this.color = color;
        this.bustCache = bustCache;
        this._stream = null;
        this._gif = null;
        this._textures = [];
        this._animation = null;
        this._transparentColor = null;
        this._resource = new Resource(path, 'arraybuffer', bustCache);
        this._transparentColor = color;
    }
    /**
     * Begins loading the texture and returns a promise to be resolved on completion
     */
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const arraybuffer = yield this._resource.load();
            this._stream = new Stream(arraybuffer);
            this._gif = new ParseGif(this._stream, this._transparentColor);
            const textures = this._gif.images.map(i => new Texture(i.src, false));
            // Load all textures
            yield Promise.all(textures.map(t => t.load()));
            return this.data = this._textures = textures;
        });
    }
    isLoaded() {
        return !!this.data;
    }
    asSprite(id = 0) {
        const sprite = this._textures[id].asSprite();
        return sprite;
    }
    asSpriteSheet() {
        const spriteArray = this._textures.map((texture) => {
            return texture.asSprite();
        });
        return new SpriteSheet(spriteArray);
    }
    asAnimation(engine, speed) {
        const spriteSheet = this.asSpriteSheet();
        this._animation = spriteSheet.getAnimationForAll(engine, speed);
        return this._animation;
    }
    get readCheckBytes() {
        return this._gif.checkBytes;
    }
}
const bitsToNum = (ba) => {
    return ba.reduce(function (s, n) {
        return s * 2 + n;
    }, 0);
};
const byteToBitArr = (bite) => {
    const a = [];
    for (let i = 7; i >= 0; i--) {
        a.push(!!(bite & (1 << i)));
    }
    return a;
};
export class Stream {
    constructor(dataArray) {
        this.data = null;
        this.len = 0;
        this.position = 0;
        this.readByte = () => {
            if (this.position >= this.data.byteLength) {
                throw new Error('Attempted to read past end of stream.');
            }
            return this.data[this.position++];
        };
        this.readBytes = (n) => {
            const bytes = [];
            for (let i = 0; i < n; i++) {
                bytes.push(this.readByte());
            }
            return bytes;
        };
        this.read = (n) => {
            let s = '';
            for (let i = 0; i < n; i++) {
                s += String.fromCharCode(this.readByte());
            }
            return s;
        };
        this.readUnsigned = () => {
            // Little-endian.
            const a = this.readBytes(2);
            return (a[1] << 8) + a[0];
        };
        this.data = new Uint8Array(dataArray);
        this.len = this.data.byteLength;
        if (this.len === 0) {
            throw new Error('No data loaded from file');
        }
    }
}
const lzwDecode = function (minCodeSize, data) {
    // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
    let pos = 0; // Maybe this streaming thing should be merged with the Stream?
    const readCode = function (size) {
        let code = 0;
        for (let i = 0; i < size; i++) {
            if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
                code |= 1 << i;
            }
            pos++;
        }
        return code;
    };
    const output = [];
    const clearCode = 1 << minCodeSize;
    const eoiCode = clearCode + 1;
    let codeSize = minCodeSize + 1;
    let dict = [];
    const clear = function () {
        dict = [];
        codeSize = minCodeSize + 1;
        for (let i = 0; i < clearCode; i++) {
            dict[i] = [i];
        }
        dict[clearCode] = [];
        dict[eoiCode] = null;
    };
    let code;
    let last;
    while (true) {
        last = code;
        code = readCode(codeSize);
        if (code === clearCode) {
            clear();
            continue;
        }
        if (code === eoiCode) {
            break;
        }
        if (code < dict.length) {
            if (last !== clearCode) {
                dict.push(dict[last].concat(dict[code][0]));
            }
        }
        else {
            if (code !== dict.length) {
                throw new Error('Invalid LZW code.');
            }
            dict.push(dict[last].concat(dict[last][0]));
        }
        output.push.apply(output, dict[code]);
        if (dict.length === 1 << codeSize && codeSize < 12) {
            // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
            codeSize++;
        }
    }
    // I don't know if this is technically an error, but some GIFs do it.
    //if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
    return output;
};
// The actual parsing; returns an object with properties.
export class ParseGif {
    constructor(stream, color = Color.Magenta) {
        this._st = null;
        this._handler = {};
        this._transparentColor = null;
        this.frames = [];
        this.images = [];
        this.globalColorTable = [];
        this.checkBytes = [];
        // LZW (GIF-specific)
        this.parseColorTable = (entries) => {
            // Each entry is 3 bytes, for RGB.
            const ct = [];
            for (let i = 0; i < entries; i++) {
                const rgb = this._st.readBytes(3);
                const rgba = '#' +
                    rgb
                        .map((x) => {
                        const hex = x.toString(16);
                        return hex.length === 1 ? '0' + hex : hex;
                    })
                        .join('');
                ct.push(rgba);
            }
            return ct;
        };
        this.readSubBlocks = () => {
            let size, data;
            data = '';
            do {
                size = this._st.readByte();
                data += this._st.read(size);
            } while (size !== 0);
            return data;
        };
        this.parseHeader = () => {
            const hdr = {
                sig: null,
                ver: null,
                width: null,
                height: null,
                colorRes: null,
                globalColorTableSize: null,
                gctFlag: null,
                sorted: null,
                globalColorTable: [],
                bgColor: null,
                pixelAspectRatio: null // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
            };
            hdr.sig = this._st.read(3);
            hdr.ver = this._st.read(3);
            if (hdr.sig !== 'GIF') {
                throw new Error('Not a GIF file.'); // XXX: This should probably be handled more nicely.
            }
            hdr.width = this._st.readUnsigned();
            hdr.height = this._st.readUnsigned();
            const bits = byteToBitArr(this._st.readByte());
            hdr.gctFlag = bits.shift();
            hdr.colorRes = bitsToNum(bits.splice(0, 3));
            hdr.sorted = bits.shift();
            hdr.globalColorTableSize = bitsToNum(bits.splice(0, 3));
            hdr.bgColor = this._st.readByte();
            hdr.pixelAspectRatio = this._st.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
            if (hdr.gctFlag) {
                hdr.globalColorTable = this.parseColorTable(1 << (hdr.globalColorTableSize + 1));
                this.globalColorTable = hdr.globalColorTable;
            }
            if (this._handler.hdr && this._handler.hdr(hdr)) {
                this.checkBytes.push(this._handler.hdr);
            }
        };
        this.parseExt = (block) => {
            const parseGCExt = (block) => {
                this.checkBytes.push(this._st.readByte()); // Always 4
                const bits = byteToBitArr(this._st.readByte());
                block.reserved = bits.splice(0, 3); // Reserved; should be 000.
                block.disposalMethod = bitsToNum(bits.splice(0, 3));
                block.userInput = bits.shift();
                block.transparencyGiven = bits.shift();
                block.delayTime = this._st.readUnsigned();
                block.transparencyIndex = this._st.readByte();
                block.terminator = this._st.readByte();
                if (this._handler.gce && this._handler.gce(block)) {
                    this.checkBytes.push(this._handler.gce);
                }
            };
            const parseComExt = (block) => {
                block.comment = this.readSubBlocks();
                if (this._handler.com && this._handler.com(block)) {
                    this.checkBytes.push(this._handler.com);
                }
            };
            const parsePTExt = (block) => {
                this.checkBytes.push(this._st.readByte()); // Always 12
                block.ptHeader = this._st.readBytes(12);
                block.ptData = this.readSubBlocks();
                if (this._handler.pte && this._handler.pte(block)) {
                    this.checkBytes.push(this._handler.pte);
                }
            };
            const parseAppExt = (block) => {
                const parseNetscapeExt = (block) => {
                    this.checkBytes.push(this._st.readByte()); // Always 3
                    block.unknown = this._st.readByte(); // ??? Always 1? What is this?
                    block.iterations = this._st.readUnsigned();
                    block.terminator = this._st.readByte();
                    if (this._handler.app && this._handler.app.NETSCAPE && this._handler.app.NETSCAPE(block)) {
                        this.checkBytes.push(this._handler.app);
                    }
                };
                const parseUnknownAppExt = (block) => {
                    block.appData = this.readSubBlocks();
                    // FIXME: This won't work if a handler wants to match on any identifier.
                    if (this._handler.app && this._handler.app[block.identifier] && this._handler.app[block.identifier](block)) {
                        this.checkBytes.push(this._handler.app[block.identifier]);
                    }
                };
                this.checkBytes.push(this._st.readByte()); // Always 11
                block.identifier = this._st.read(8);
                block.authCode = this._st.read(3);
                switch (block.identifier) {
                    case 'NETSCAPE':
                        parseNetscapeExt(block);
                        break;
                    default:
                        parseUnknownAppExt(block);
                        break;
                }
            };
            const parseUnknownExt = (block) => {
                block.data = this.readSubBlocks();
                if (this._handler.unknown && this._handler.unknown(block)) {
                    this.checkBytes.push(this._handler.unknown);
                }
            };
            block.label = this._st.readByte();
            switch (block.label) {
                case 0xf9:
                    block.extType = 'gce';
                    parseGCExt(block);
                    break;
                case 0xfe:
                    block.extType = 'com';
                    parseComExt(block);
                    break;
                case 0x01:
                    block.extType = 'pte';
                    parsePTExt(block);
                    break;
                case 0xff:
                    block.extType = 'app';
                    parseAppExt(block);
                    break;
                default:
                    block.extType = 'unknown';
                    parseUnknownExt(block);
                    break;
            }
        };
        this.parseImg = (img) => {
            const deinterlace = (pixels, width) => {
                // Of course this defeats the purpose of interlacing. And it's *probably*
                // the least efficient way it's ever been implemented. But nevertheless...
                const newPixels = new Array(pixels.length);
                const rows = pixels.length / width;
                const cpRow = (toRow, fromRow) => {
                    const fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
                    newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
                };
                const offsets = [0, 4, 2, 1];
                const steps = [8, 8, 4, 2];
                let fromRow = 0;
                for (let pass = 0; pass < 4; pass++) {
                    for (let toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
                        cpRow(toRow, fromRow);
                        fromRow++;
                    }
                }
                return newPixels;
            };
            img.leftPos = this._st.readUnsigned();
            img.topPos = this._st.readUnsigned();
            img.width = this._st.readUnsigned();
            img.height = this._st.readUnsigned();
            const bits = byteToBitArr(this._st.readByte());
            img.lctFlag = bits.shift();
            img.interlaced = bits.shift();
            img.sorted = bits.shift();
            img.reserved = bits.splice(0, 2);
            img.lctSize = bitsToNum(bits.splice(0, 3));
            if (img.lctFlag) {
                img.lct = this.parseColorTable(1 << (img.lctSize + 1));
            }
            img.lzwMinCodeSize = this._st.readByte();
            const lzwData = this.readSubBlocks();
            img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData);
            if (img.interlaced) {
                // Move
                img.pixels = deinterlace(img.pixels, img.width);
            }
            this.frames.push(img);
            this.arrayToImage(img);
            if (this._handler.img && this._handler.img(img)) {
                this.checkBytes.push(this._handler);
            }
        };
        this.parseBlock = () => {
            const block = {
                sentinel: this._st.readByte(),
                type: ''
            };
            const blockChar = String.fromCharCode(block.sentinel);
            switch (blockChar) {
                case '!':
                    block.type = 'ext';
                    this.parseExt(block);
                    break;
                case ',':
                    block.type = 'img';
                    this.parseImg(block);
                    break;
                case ';':
                    block.type = 'eof';
                    if (this._handler.eof && this._handler.eof(block)) {
                        this.checkBytes.push(this._handler.eof);
                    }
                    break;
                default:
                    throw new Error('Unknown block: 0x' + block.sentinel.toString(16));
            }
            if (block.type !== 'eof') {
                this.parseBlock();
            }
        };
        this.arrayToImage = (frame) => {
            let count = 0;
            const c = document.createElement('canvas');
            c.id = count.toString();
            c.width = frame.width;
            c.height = frame.height;
            count++;
            const context = c.getContext('2d');
            const pixSize = 1;
            let y = 0;
            let x = 0;
            for (let i = 0; i < frame.pixels.length; i++) {
                if (x % frame.width === 0) {
                    y++;
                    x = 0;
                }
                if (this.globalColorTable[frame.pixels[i]] === this._transparentColor.toHex()) {
                    context.fillStyle = `rgba(0, 0, 0, 0)`;
                }
                else {
                    context.fillStyle = this.globalColorTable[frame.pixels[i]];
                }
                context.fillRect(x, y, pixSize, pixSize);
                x++;
            }
            const img = new Image();
            img.src = c.toDataURL();
            this.images.push(img);
        };
        this._st = stream;
        this._handler = {};
        this._transparentColor = color;
        this.parseHeader();
        this.parseBlock();
    }
}
//# sourceMappingURL=Gif.js.map