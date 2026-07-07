const BASE_URL = 'http://localhost:8000';

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(path, { method = 'GET', body, token, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    onUnauthorized();
    throw new Error('Session expired, please login again');
  }

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    /* no body */
  }

  if (!res.ok) {
    const message = data?.detail || 'Something went wrong, please try again';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return data;
}

export const api = {
  get: (path, token) => request(path, { method: 'GET', token }),
  post: (path, body, token) => request(path, { method: 'POST', body, token }),
  put: (path, body, token) => request(path, { method: 'PUT', body, token }),
  patch: (path, body, token) => request(path, { method: 'PATCH', body, token }),
  postForm: (path, formData, token) => request(path, { method: 'POST', body: formData, token, isForm: true }),
};
