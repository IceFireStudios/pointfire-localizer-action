export const flattenObject = (obj, prefix = "") => {
    let flattenedObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
                const nestedObj = flattenObject(obj[key], prefix + key + ".");
                flattenedObj = Object.assign(Object.assign({}, flattenedObj), nestedObj);
            }
            else {
                flattenedObj[prefix + key] = obj[key];
            }
        }
    }
    return flattenedObj;
};
//# sourceMappingURL=flattenObject.js.map