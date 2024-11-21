export const fetchJSON = async <ReturnValue>(
  input: RequestInfo,
  init?: RequestInit
): Promise<ReturnValue> => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Error ${response.statusText}, ${response.status}`);
  }
  const json: ReturnValue = await response.json();
  return json;
};
