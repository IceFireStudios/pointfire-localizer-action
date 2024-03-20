export const flattenObject = (obj: any, prefix: string = "") => {
  let flattenedObj = {};

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        const nestedObj = flattenObject(obj[key], prefix + key + ".");
        flattenedObj = { ...flattenedObj, ...nestedObj };
      } else {
        flattenedObj[prefix + key] = obj[key];
      }
    }
  }

  return flattenedObj;
};
