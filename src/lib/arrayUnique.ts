import { arrayEqual } from "./arrayEqual";
import { getStringValue, StringKeyAccessor } from "./StringKeys";

export const arrayUnique = <T>(
  array: T[],
  accessor: StringKeyAccessor<T> = (item) => JSON.stringify(item),
): T[] => {
  if (array.length === 0) {
    return [];
  }
  if (array.every((item) => typeof item === "string")) {
    return [...new Set(array)];
  }
  const uniqueKeys = [
    ...new Set(array.map((item) => getStringValue(item, accessor))).values(),
  ];
  return uniqueKeys.map(
    (key) => array.find((item) => getStringValue(item, accessor) === key)!,
  );
};

export const arrayUniqueOfUnique = <T>(
  arrays: T[][],
  accessor: StringKeyAccessor<T> = (item) => JSON.stringify(item),
) => {
  const uniqueArrays: T[][] = [];
  for (const array of arrays) {
    if (
      !uniqueArrays.some((otherArray) =>
        arrayEqual(otherArray, array, accessor),
      )
    ) {
      uniqueArrays.push(array);
    }
  }
  return uniqueArrays;
};
