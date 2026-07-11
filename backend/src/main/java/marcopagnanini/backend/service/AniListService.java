package marcopagnanini.backend.service;

import tools.jackson.databind.JsonNode;
import marcopagnanini.backend.dto.AiringInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AniListService {

    private static final Logger log = LoggerFactory.getLogger(AniListService.class);

    private final RestClient http = RestClient.create("https://graphql.anilist.co");

    private static final String NEXT_AIRING_QUERY = """
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title { romaji english }
            nextAiringEpisode { airingAt episode }
          }
        }
        """;

    /**
     * Prossimo episodio per un mediaId AniList.
     * @return AiringInfo, o empty se nessun episodio futuro / errore / rate-limit.
     */
    public Optional<AiringInfo> getNextAiring(int mediaId) {
        Map<String, Object> reqBody = Map.of(
                "query", NEXT_AIRING_QUERY,
                "variables", Map.of("id", mediaId));

        JsonNode resp;
        try {
            resp = http.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(reqBody)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException e) {
            // 429 rate-limit / 4xx / 5xx
            log.warn("AniList HTTP {} per mediaId {}", e.getStatusCode(), mediaId);
            return Optional.empty();
        } catch (RestClientException e) {
            // rete / timeout
            log.warn("AniList chiamata fallita per mediaId {}: {}", mediaId, e.getMessage());
            return Optional.empty();
        }

        if (resp == null) return Optional.empty();


        if (resp.has("errors")) {
            log.warn("AniList errori GraphQL per mediaId {}: {}", mediaId, resp.get("errors"));
            return Optional.empty();
        }

        JsonNode media = resp.path("data").path("Media");
        JsonNode airing = media.path("nextAiringEpisode");
        // null = anime concluso o non ancora programmato
        if (airing.isMissingNode() || airing.isNull()) return Optional.empty();

        String romaji = media.path("title").path("romaji").asText(null);
        String english = media.path("title").path("english").asText(null);
        String title = romaji != null ? romaji : english;

        return Optional.of(new AiringInfo(
                media.path("id").asInt(mediaId),
                title,
                airing.path("airingAt").asLong(),
                airing.path("episode").asInt()));
    }

    private static final String TRENDING_QUERY = """
        query ($perPage: Int) {
          Page(perPage: $perPage) {
            media(type: ANIME, status: RELEASING, sort: TRENDING_DESC) {
              id
              title { romaji english }
              nextAiringEpisode { airingAt episode }
            }
          }
        }
        """;

    /**
     * Anime trending attualmente in onda (RELEASING) con prossimo episodio.
     * @return lista (vuota su errore/rate-limit); salta quelli senza nextAiringEpisode.
     */
    public List<AiringInfo> getTrendingAiring(int perPage) {
        Map<String, Object> reqBody = Map.of(
                "query", TRENDING_QUERY,
                "variables", Map.of("perPage", perPage));

        JsonNode resp;
        try {
            resp = http.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(reqBody)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException e) {
            log.warn("AniList HTTP {} su trending", e.getStatusCode());
            return List.of();
        } catch (RestClientException e) {
            log.warn("AniList trending fallita: {}", e.getMessage());
            return List.of();
        }

        if (resp == null || resp.has("errors")) {
            if (resp != null) log.warn("AniList errori GraphQL trending: {}", resp.get("errors"));
            return List.of();
        }

        List<AiringInfo> out = new ArrayList<>();
        for (JsonNode m : resp.path("data").path("Page").path("media")) {
            JsonNode airing = m.path("nextAiringEpisode");
            if (airing.isMissingNode() || airing.isNull()) continue;

            String romaji = m.path("title").path("romaji").asText(null);
            String english = m.path("title").path("english").asText(null);
            String title = romaji != null ? romaji : english;

            out.add(new AiringInfo(
                    m.path("id").asInt(),
                    title,
                    airing.path("airingAt").asLong(),
                    airing.path("episode").asInt()));
        }
        return out;
    }
}
