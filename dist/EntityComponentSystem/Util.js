var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
export var buildTypeKey = function (types) {
    var key = __spreadArrays(types).sort(function (a, b) { return a.localeCompare(b); }).join('+');
    return key;
};
//# sourceMappingURL=Util.js.map