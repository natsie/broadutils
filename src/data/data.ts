import type { DataUrlSource, ObjectUtils, StringUtils } from "./types.ts";

export const convertToDataUrl = async (
  source: DataUrlSource,
  mimeType?: string,
): Promise<string> => {
  let blob: Blob;

  if (source instanceof Blob) blob = mimeType ? new Blob([source], { type: mimeType }) : source;
  else
    blob = new Blob(
      Array.isArray(source) ? source : [source],
      mimeType ? { type: mimeType } : undefined,
    );

  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onloadend = () => {
      if (typeof fileReader.result === "string") resolve(fileReader.result);
      else reject(new Error("Failed to convert to data URL"));
    };
    fileReader.onerror = () => reject(fileReader.error);
    fileReader.readAsDataURL(blob);
  });
};

export const object: ObjectUtils = {
  omit: <T extends {}, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = {} as Omit<T, K>;
    const toOmit = new Set(keys);
    for (const [key, value] of Object.entries(obj)) {
      if (toOmit.has(key as K)) continue;
      result[key as Exclude<keyof T, K>] = value as T[Exclude<keyof T, K>];
    }
    return result;
  },
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    for (const key of keys) result[key] = obj[key];
    return result;
  },
  merge: (...sources: any[]) => Object.assign({}, ...sources),
  mergeInto: (...sources: any[]) => Object.assign(sources[0], ...sources),
};

export const string: StringUtils = {
  reverse: (inputStr) => inputStr.split("").reverse().join(""),
  substitute: (inputStr, substitionMap) => {
    const subPairs =
      substitionMap instanceof Map ? [...substitionMap] : Object.entries(substitionMap);
    return subPairs.reduce((acc, [key, value]) => acc.replaceAll(key, value), inputStr);
  },
};

export * from "./types.ts";
