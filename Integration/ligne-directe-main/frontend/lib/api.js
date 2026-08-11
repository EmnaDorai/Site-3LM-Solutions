const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("admin_token");
}

export function setToken(token) {
  window.localStorage.setItem("admin_token", token);
}

export function clearToken() {
  window.localStorage.removeItem("admin_token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Token ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.detail ||
      (typeof data === "object" ? Object.values(data).flat().join(" ") : "Erreur inconnue");
    throw new Error(message || `Erreur ${res.status}`);
  }
  return data;
}

// ---------- Public (visiteur) ----------
export const api = {
  // ---------- Public ----------
  creerRendezVous: (payload) =>
    request("/rendez-vous/", { method: "POST", body: payload }),

  creneauxPris: (date) =>
    request(`/creneaux-disponibles/?date=${date}`),

  // ---------- Admin ----------
  login: (username, password) =>
    request("/auth/token/", {
      method: "POST",
      body: { username, password },
    }),

  listerRendezVous: (params = "") =>
    request(`/rendez-vous/${params}`, { auth: true }),

  modifierRendezVous: (id, payload) =>
    request(`/rendez-vous/${id}/`, {
      method: "PATCH",
      body: payload,
      auth: true,
    }),

  supprimerRendezVous: (id) =>
    request(`/rendez-vous/${id}/`, {
      method: "DELETE",
      auth: true,
    }),

  confirmerRendezVous: (id) =>
    request(`/rendez-vous/${id}/confirmer/`, {
      method: "POST",
      auth:true,
    }),

  // ---------- Prospects ----------
  listerProspects: (params = "") =>
    request(`/prospects/${params}`, { auth: true }),

  modifierProspect: (id, payload) =>
    request(`/prospects/${id}/`, {
      method: "PATCH",
      body: payload,
      auth: true,
    }),

  supprimerProspect: (id) =>
    request(`/prospects/${id}/`, {
      method: "DELETE",
      auth: true,
    }),
};
