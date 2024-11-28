export const unique = <T>(
  arr: T[],
  selector?: ((item: T, index?: number, array?: T[]) => string) | keyof T,
): T[] => {
  if (typeof selector === "function") {
    const uniqueKeys = [
      ...new Map(
        arr.map((item, index, array) => [selector(item, index, array), item]),
      ).values(),
    ];
    return uniqueKeys.map((key) => arr.find((item) => selector(item) === key)!);
  }
  if (typeof selector === "string") {
    const uniqueKeys = [...new Set(arr.map((item) => item[selector]))];
    return uniqueKeys.map((key) => arr.find((item) => item[selector] === key)!);
  }
  return [...new Set(arr)];
};

export const uniqueOfUnique = <T>(arrays: T[][]) => {
  const setsUnique: Set<T>[] = [];
  for (const array of arrays) {
    const arraySet = new Set(array);
    if (!setsUnique.some((set) => difference(set, arraySet).size === 0)) {
      setsUnique.push(arraySet);
    }
  }
  return setsUnique.map((set) => [...set.values()]);
};

export const difference = <T>(set1: Set<T>, set2: Set<T>) => {
  return new Set([...set1].filter((item) => !set2.has(item)));
};
