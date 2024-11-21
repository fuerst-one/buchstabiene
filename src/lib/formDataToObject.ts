// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formDataToObject = <TType extends Record<string, any>>(
  formData: FormData,
) => {
  const data = Object.fromEntries(formData.entries());
  return data as TType;
};
