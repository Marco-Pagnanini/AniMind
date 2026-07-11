package marcopagnanini.backend.dto;

/** Risultato parsato di nextAiringEpisode da AniList. airingAt = epoch UTC. */
public record AiringInfo(int mediaId, String title, long airingAt, int episode) {}
