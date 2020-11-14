export const buildTypeKey = (types) => {
    const key = [...types].sort((a, b) => a.localeCompare(b)).join('+');
    return key;
};
//# sourceMappingURL=Util.js.map