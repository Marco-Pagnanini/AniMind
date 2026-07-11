package marcopagnanini.backend.dto;

// Come AiringInfo ma con airing opzionale (anime conclusi da ricerca).
public record MediaInfo(int mediaId, String title, Long airingAt, Integer episode, String coverImage) {}
