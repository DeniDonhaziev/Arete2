import {
  EVENTS_API_BASE,
  isSharedClubEndpoint,
} from "../config/eventsApi";
import { USE_MOCK_API } from "./mockConfig";
import { mockApiCall } from "./mockApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api" : "http://91.107.123.186:8080/api");

const request = async (url, options = {}) => {
  const config = {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  };

  if (options.body && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `Ошибка ${response.status}`;
    let errorData = null;
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      if (response.status === 500 || response.status === 503) {
        errorMessage = "Сервер недоступен. Запустите сайт: npm run dev";
      }
    }

    if (
      (response.status === 500 || response.status === 503) &&
      errorMessage.startsWith("Ошибка ")
    ) {
      errorMessage = "Сервер недоступен. Запустите сайт: npm run dev";
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.url = url;
    error.method = config.method || "GET";
    error.data = errorData;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

/** Мероприятия и стихи — общий сервер для всех браузеров */
const clubApiCall = async (endpoint, options = {}) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${EVENTS_API_BASE}${path}`;
  return request(url, options);
};

const apiCall = async (endpoint, options = {}) => {
  if (isSharedClubEndpoint(endpoint)) {
    return clubApiCall(endpoint, options);
  }

  if (USE_MOCK_API) {
    return mockApiCall(endpoint, options);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  return request(url, options);
};

export default apiCall;
