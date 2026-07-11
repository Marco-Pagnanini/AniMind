// Base URL del backend Spring Boot.
// - iOS simulator: http://localhost:8080 va bene
// - Device fisico: usa l'IP LAN del Mac, es. http://192.168.1.10:8080
// - Prod: https://anime.cigarclub.club
export const API_URL = "http://localhost:8080";

export type AuthUser = {
  id: number;
  username: string;
  email: string | null;
};

export type Anime = {
  id: number;
  aniListMediaId: number;
  title: string;
  nextAiringAt: number | null;
  nextEpisode: number | null;
};

export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  last: boolean;
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Errore ${res.status}`);
  return res.json() as Promise<T>;
}

// Home: pagina di anime (infinite scroll).
export function getAnimePage(page = 0, size = 20): Promise<Page<Anime>> {
  return get<Page<Anime>>(`/api/v1/anime?page=${page}&size=${size}`);
}

// Ricerca su AniList (salva i risultati nel DB lato backend).
export function searchAnime(q: string): Promise<Anime[]> {
  return get<Anime[]>(`/api/v1/anime/search?q=${encodeURIComponent(q)}`);
}

export function getUserAnime(userId: number): Promise<Anime[]> {
  return get<Anime[]>(`/api/v1/anime/user/${userId}`);
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = `Errore ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
      else if (data?.error) msg = data.error;
    } catch {
      // corpo non-JSON, tieni msg default
    }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

export function login(username: string, password: string): Promise<AuthUser> {
  return post<AuthUser>("/api/v1/auth/login", { username, password });
}

export function register(
  username: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  return post<AuthUser>("/api/v1/auth/register", { username, email, password });
}

// Iscrive l'utente all'anime (idempotente lato backend).
export async function subscribe(userId: number, animeId: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/subscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, animeId }),
  });
  if (!res.ok) throw new Error(`Errore ${res.status}`);
}

export async function unsubscribe(userId: number, animeId: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/subscriptions`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, animeId }),
  });
  if (!res.ok) throw new Error(`Errore ${res.status}`);
}
