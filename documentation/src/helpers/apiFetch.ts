export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    window.location.href = "/login";
    throw new Error("No refresh token");
  }

  const refreshResponse = await fetch(
    "https://api.properform.app/auth/refresh",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
  );

  if (!refreshResponse.ok) {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  const data = await refreshResponse.json();

  localStorage.setItem("token", data.access_token);

  headers["Authorization"] = `Bearer ${data.access_token}`;

  return fetch(url, {
    ...options,
    headers,
  });
}
