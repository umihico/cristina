type Props = {
  url: string;
  options: object;
  n: number;
};

export const fetchRetry = async (
  url: string,
  options: object,
  n: number,
  wait: number = 0
): Promise<Response> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, wait));
    const response = await fetch(url, options);
    if (n === 1) return response;
    return response.ok
      ? response
      : await fetchRetry(url, options, n - 1, wait + 500);
  } catch (err) {
    if (n === 1) throw err;
    return await fetchRetry(url, options, n - 1, wait + 500);
  }
};
