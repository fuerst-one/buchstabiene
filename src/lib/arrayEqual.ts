import { getStringValue, StringKeyAccessor } from "./StringKeys";

/**
 * Checks if two string arrays are equal regardless of order.
 * @param arr1 - The first array of strings.
 * @param arr2 - The second array of strings.
 * @param options - The options for the comparison.
 * @param options.caseSensitive - Whether the comparison should be case-sensitive. Default is `true`.
 * @param options.orderSensitive - Whether the comparison should be order-sensitive. Default is `false`.
 * @returns `true` if arrays contain the same strings; otherwise, `false`.
 */
export const arrayEqual = <ItemType>(
  arr1: ItemType[],
  arr2: ItemType[],
  accessor: StringKeyAccessor<ItemType> = (item) =>
    JSON.stringify(item).toString(),
  options: {
    caseSensitive: boolean;
    orderSensitive: boolean;
  } = {
    caseSensitive: true,
    orderSensitive: false,
  },
): boolean => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const normalize = (item: ItemType) => {
    const stringValue = getStringValue(item, accessor);
    return options.caseSensitive ? stringValue : stringValue.toLowerCase();
  };

  if (options.orderSensitive) {
    const normalizedArr1 = arr1.map(normalize);
    const normalizedArr2 = arr2.map(normalize);

    for (let i = 0; i < normalizedArr1.length; i++) {
      const word1 = normalizedArr1[i];
      const word2 = normalizedArr2[i];

      if (word1 !== word2) {
        return false;
      }
    }
  } else {
    const sortedArr1 = [...arr1].map(normalize).sort();
    const sortedArr2 = [...arr2].map(normalize).sort();

    for (let i = 0; i < sortedArr1.length; i++) {
      if (sortedArr1[i] !== sortedArr2[i]) {
        return false;
      }
    }
  }

  return true;
};
