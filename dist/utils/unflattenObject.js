export function unflattenObject(obj) {
    const result = {};
    for (const key in obj) {
        const value = obj[key];
        const keys = key.split(".");
        let currentObj = result;
        for (let i = 0; i < keys.length - 1; i++) {
            const nestedKey = keys[i];
            if (!currentObj[nestedKey]) {
                currentObj[nestedKey] = {};
            }
            currentObj = currentObj[nestedKey];
        }
        currentObj[keys[keys.length - 1]] = value;
    }
    return result;
}
//# sourceMappingURL=unflattenObject.js.map