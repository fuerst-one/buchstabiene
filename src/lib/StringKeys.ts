export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

export type StringKeyAccessor<T> = ((item: T) => string) | StringKeys<T>;

export const getStringValue = <T>(
  item: T,
  accessor: StringKeyAccessor<T>,
): string => {
  if (typeof item === "string") {
    return item;
  }
  if (typeof accessor === "function") {
    return accessor(item);
  } else {
    // We know that the accessor returns a string, but we have to force TS here
    return item[accessor] as string;
  }
};
