import axios from "axios";
import type { AnalyticsOverview, PredictionResult, User } from "../types";
import { getLocalReports } from "../utils/localReports";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  timeout: 30000,
});

const backendOrigin = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/api\/v1\/?$/, "");

function withBackendOrigin(url?: string) {
  if (!url || url.startsWith("http") || url.startsWith("data:")) return url;
  return `${backendOrigin}${url.startsWith("/") ? url : `/${url}`}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("leafsense-access-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function predictDisease(file: File, cropHint: string): Promise<PredictionResult> {
  const body = new FormData();
  body.append("file", file);
  body.append("cropHint", cropHint);
  const { data } = await api.post<PredictionResult>("/disease/predict", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return {
    ...data,
    imageUrl: withBackendOrigin(data.imageUrl) ?? data.imageUrl,
    heatmapUrl: withBackendOrigin(data.heatmapUrl),
    highlightedUrl: withBackendOrigin(data.highlightedUrl),
  };
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { data } = await api.get<AnalyticsOverview>("/analytics/overview");
  return data;
}

export async function sendChatMessage(message: string, context?: PredictionResult | null): Promise<{ message: string; response: string }> {
  const { data } = await api.post<{ message: string; response: string }>("/chatbot/message", {
    message,
    context: context
      ? {
          reportId: context.id,
          cropName: context.cropName,
          diseaseName: context.diseaseName,
          scientificName: context.scientificName,
          diseaseCategory: context.diseaseCategory,
          confidenceScore: context.confidenceScore,
          severity: context.severity,
          topPredictions: context.topPredictions,
          recommendation: context.recommendation,
        }
      : undefined,
  });
  return data;
}

function mapUser(data: { id: number | string; full_name: string; email: string; role: User["role"]; is_verified: boolean; profile_image?: string | null; created_at?: string | null; updated_at?: string | null }): User {
  return {
    id: String(data.id),
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    isVerified: data.is_verified,
    profileImage: data.profile_image,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getProfile(): Promise<User> {
  const { data } = await api.get("/users/profile");
  return mapUser(data);
}

export async function updateProfile(payload: { fullName?: string; email?: string; profileImage?: string }): Promise<User> {
  const { data } = await api.patch("/users/update-profile", {
    full_name: payload.fullName,
    email: payload.email,
    profile_image: payload.profileImage,
  });
  return mapUser(data);
}

export async function getUserDiagnoses() {
  const { data } = await api.get<Array<{ id: number; imageUrl: string; cropName: string; diseaseName: string; confidenceScore: number; severity: string; createdAt: string }>>("/users/history");
  return data.map((item) => ({ ...item, imageUrl: withBackendOrigin(item.imageUrl) ?? item.imageUrl }));
}

export async function getUserDiagnosis(id: number): Promise<PredictionResult> {
  const { data } = await api.get<PredictionResult>(`/users/history/${id}`);
  return {
    ...data,
    imageUrl: withBackendOrigin(data.imageUrl) ?? data.imageUrl,
    heatmapUrl: withBackendOrigin(data.heatmapUrl),
    highlightedUrl: withBackendOrigin(data.highlightedUrl),
  };
}

export async function getAssistantHistory() {
  const { data } = await api.get<Array<{ id: number; message: string; response: string; created_at: string }>>("/chatbot/history");
  return data;
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<{ access_token: string; refresh_token: string }>("/auth/login", { email, password });
  localStorage.setItem("leafsense-access-token", data.access_token);
  localStorage.setItem("leafsense-refresh-token", data.refresh_token);
  return getProfile();
}

export async function signup(fullName: string, email: string, password: string): Promise<User> {
  try {
    await api.post("/auth/signup", { full_name: fullName, email, password });
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 409) {
      throw error;
    }
  }
  return login(email, password);
}

export async function googleTokenLogin(token: string): Promise<User> {
  const { data } = await api.post<{ access_token: string; refresh_token: string; email: string; name: string; picture?: string; role: User["role"] }>("/auth/google", { token });
  localStorage.setItem("leafsense-access-token", data.access_token);
  localStorage.setItem("leafsense-refresh-token", data.refresh_token);
  return {
    id: data.email,
    fullName: data.name,
    email: data.email,
    role: data.role,
    isVerified: true,
    profileImage: data.picture,
  };
}

export async function googleLogin(email: string, fullName: string): Promise<User> {
  const { data } = await api.post<{ access_token: string; refresh_token: string }>("/auth/google-login", {
    email,
    full_name: fullName || email.split("@")[0],
    google_id: email,
  });
  localStorage.setItem("leafsense-access-token", data.access_token);
  localStorage.setItem("leafsense-refresh-token", data.refresh_token);
  return getProfile();
}

export async function getAdminOverview() {
  const [users, reports, settings, dataset] = await Promise.all([
    api.get("/admin/users"),
    api.get("/admin/reports"),
    api.get("/admin/settings"),
    api.get("/admin/dataset"),
  ]);
  return {
    users: users.data,
    reports: [...getLocalReports(), ...reports.data],
    settings: settings.data,
    dataset: dataset.data,
  };
}

export async function sendGmailContact(payload: { accessToken: string; name: string; email: string; subject: string; message: string }) {
  const { data } = await api.post<{ status: string; id?: string }>("/contact/send-gmail", {
    access_token: payload.accessToken,
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
  });
  return data;
}

export { api };
