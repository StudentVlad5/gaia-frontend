export const api = async (url, options = {}) => {
  const res = await fetch(`/api${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    // можна тригернути refresh або logout
  }

  return res;
};
