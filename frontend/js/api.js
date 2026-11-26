/**
 * API client for the ObserverTasker backend.
 * Every request goes through API.request, so every failed response
 * (network error, server error, validation error) is turned into
 * an ApiError with a message that can be shown to the user.
 */
export const API_URL = "http://127.0.0.1:8000";

const NETWORK_ERROR_MESSAGE = "Cannot reach the server. Please check that it is running and try again.";
const SERVER_ERROR_MESSAGE = "Something went wrong on the server. Please try again later.";

/** Error raised for any failed API request. status is 0 when there was no response. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    // true when the error was already shown to the user (expired session)
    this.handled = false;
  }
}

/**
 * Builds a readable message from an error response body.
 * FastAPI returns `detail` as a string (HTTPException) or as a list of
 * validation errors (422); custom handlers may return `error` instead.
 */
export function extractErrorMessage(data, status) {
  if (data && typeof data.detail === "string") {
    return data.detail;
  }
  if (data && Array.isArray(data.detail)) {
    return data.detail
      .map(item => {
        const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : null;
        return field && field !== "body" ? `${field}: ${item.msg}` : item.msg;
      })
      .join("\n");
  }
  if (data && typeof data.error === "string") {
    return data.error;
  }
  if (status >= 500) {
    return SERVER_ERROR_MESSAGE;
  }
  return `Request failed (status ${status}).`;
}

/** Parses a response body as JSON; returns null for an empty or non-JSON body. */
async function parseBody(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Key in sessionStorage that tells the next page load to explain why the user was logged out. */
export const SESSION_EXPIRED_KEY = "sessionExpired";

/** Clears the stored token and returns the user to the login screen. */
export function handleSessionExpired() {
  localStorage.removeItem("token");
  sessionStorage.setItem(SESSION_EXPIRED_KEY, "1");
  location.reload();
}

export const API = {
  /**
   * Sends a request to the API and returns the parsed response body.
   * Options:
   *   form: send `body` as form data instead of JSON (used by login).
   *   expectUnauthorized: treat 401 as a normal error instead of an
   *     expired session (used by login, where 401 means wrong credentials).
   * Throws ApiError for every failed request.
   */
  async request(endpoint, method = "GET", body = null, { form = false, expectUnauthorized = false } = {}) {
    const headers = {};
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body && form) {
      options.body = new URLSearchParams(body);
    } else if (body) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetch(API_URL + endpoint, options);
    } catch (error) {
      // No response at all: the API is down, or the browser blocked the
      // response (an unhandled 500 arrives without CORS headers).
      console.error(`[API ERROR] ${method} ${endpoint}:`, error);
      throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
    }

    const data = await parseBody(response);

    if (response.ok) {
      return data;
    }
    const message = extractErrorMessage(data, response.status);
    console.error(`[API ERROR] ${method} ${endpoint}: ${response.status} ${message}`);
    const error = new ApiError(message, response.status);

    if (response.status === 401 && !expectUnauthorized) {
      handleSessionExpired();
      error.handled = true;
    }
    throw error;
  },
};
