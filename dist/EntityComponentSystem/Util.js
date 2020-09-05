export var buildTypeKey = function (types) {
    var key = types.sort(function (a, b) { return a.localeCompare(b); }).join('+');
    return key;
};
//# sourceMappingURL=Util.js.map