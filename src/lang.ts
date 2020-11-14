/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export function isObject(value: any): boolean {
  if (!value) {
    return false;
  }

  if (typeof value === "object") {
    return !Array.isArray(value);
  }

  return false;
}

export function isEmptyObject(value: any): boolean {
  if (!value || !isObject(value)) {
    return false;
  }

  // because Object.keys(new Date()).length === 0 we need check
  return Object.keys(value).length === 0 && value.constructor === Object;
}

// isPOJO
export function isObjectLiteral(value: any): boolean {
  if (!value || !isObject(value)) {
    return false;
  }

  // if (isObject(value)) {
  //   return !(value instanceof Date);
  // }

  const proto = Object.getPrototypeOf(value);
  // Prototype may be null if you used `Object.create(null)`
  // Checking `proto`'s constructor is safe because `getPrototypeOf()`
  // explicitly crosses the boundary from object data to object metadata
  return !proto || proto.constructor === Object;
}

export function isDataObject(value: any): boolean {
  if (!value || !isObjectLiteral(value)) {
    return false;
  }

  return Object.keys(value).filter((k) => typeof value[k] === "function").length === 0;
}

export function isNumericString(value: any): boolean {
  if (!value) {
    return false;
  }

  return typeof value === "string" && !isNaN(+value) && !isNaN(parseFloat(value));
}

export function looksLikeNumber(value: any): boolean {
  if (!value) {
    return false;
  }

  return typeof value === "number" || isNumericString(value);
}

export function looksLikeBoolean(value: any, acceptedBooleanStrings: string[] = ["true", "false"]): boolean {
  if (value === undefined) {
    return false;
  }

  if (typeof value === "boolean") {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  return acceptedBooleanStrings.includes(value.trim().toLocaleLowerCase());
}

export function isPrimitive(value: any): boolean {
  if (value === undefined) {
    return false;
  }

  return typeof value === "string" || typeof value === "boolean" || typeof value === "number";
}

export function shuffleArray(array: any[]): any[] {
  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  let currentIndex = array.length;
  let randomIndex = undefined;
  let tmpVal = undefined;

  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    tmpVal = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = tmpVal;
  }

  return array;
}

export function integerRange(start: number, end: number): number[] {
  return Array(end - start + 1)
    .fill(0)
    .map((_, idx) => start + idx);
}

export function randomIntegerRange(start: number, end: number): number[] {
  return shuffleArray(integerRange(start, end));
}

export function uniqueObjectArray(arr: any[], uniquePropertyName: string): any[] {
  return arr.reduce((accumulator, element) => {
    if (!accumulator.find((el) => el[uniquePropertyName] === element[uniquePropertyName])) {
      accumulator.push(element);
    }
    return accumulator;
  }, []);
}

export function parseBooleanToken(value: any, silent = false): boolean {
  if (!value) {
    return false;
  }

  const v = typeof value === "string" ? value.toLocaleLowerCase() : value;

  switch (v) {
    case true:
    case "true":
    case "1":
    case 1:
      return true;
    case false:
    case "false":
    case "0":
    case 0:
      return false;
    default:
      if (silent) {
        return false;
      } else {
        throw "Invalid boolean token";
      }
  }
}

export interface JsonParseOptions {
  strict?: boolean;
  silent?: boolean;
}

export function parseJson(jsonString: string, options: JsonParseOptions = {}): any | any[] {
  if (options.strict === undefined) {
    options.strict = true;
  }

  try {
    const o = JSON.parse(jsonString);

    if (!options.strict) {
      return o;
    }

    // Neither JSON.parse(false) or JSON.parse(1234) throw errors,
    // hence the type-checking, but... JSON.parse(null) returns null,
    // and typeof null === "object", so we must check for that, too.
    if (o && typeof o === "object") {
      return o;
    }

    return undefined;
  } catch (e) {
    if (options.silent) {
      return undefined;
    }

    throw e;
  }
}

export function toLookupMap(data: any, objectIdentifier = "id"): any {
  const map = {};
  if (this.isArray(data)) {
    for (const item of data) {
      if (item[objectIdentifier]) {
        map[item[objectIdentifier]] = item;
      }
    }
  } else if (isObjectLiteral(data)) {
    if (data[objectIdentifier]) {
      map[data[objectIdentifier]] = data;
    }
  }
  return {
    data: map,
    keys: function () {
      return Object.keys(map);
    },
    getItem: function (id) {
      return map[id];
    },
    hasItem: function (id) {
      return map[id] ? true : false;
    },
    hasItemWithProperty: function (id, property) {
      return this.hasProperty(id, property);
    },
    hasItemWithNotNullProperty: function (id, property) {
      const value = this.getProperty(id, property);
      if (value === undefined || value === null) {
        return false;
      }
      return true;
      //if ((value) || (value === false)) {
      //    return true;
      //}
      //return false;
    },
    hasProperty: function (id, property) {
      if (!this.hasItem(id)) {
        return false;
      }
      return map[id].hasOwnProperty(property) ? true : false;
    },
    getProperty: function (id, property) {
      if (this.hasProperty(id, property)) {
        return map[id][property];
      } else {
        return undefined;
      }
    },
  };
}
