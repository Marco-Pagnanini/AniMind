package marcopagnanini.backend.controller;

import marcopagnanini.backend.dto.PageResponse;
import marcopagnanini.backend.model.Anime;
import marcopagnanini.backend.service.AnimeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/anime")
public class AnimeController {

    private final AnimeService animeService;

    public AnimeController(AnimeService animeService) {
        this.animeService = animeService;
    }

    /** Pagina di anime salvati (per la home, infinite scroll). */
    @GetMapping
    public PageResponse<Anime> all(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return animeService.findPage(page, size);
    }

    /** Ricerca anime su AniList; salva/aggiorna i risultati e li ritorna. */
    @GetMapping("/search")
    public List<Anime> search(@RequestParam String q) {
        return animeService.search(q);
    }

    /** Anime seguiti da un utente. */
    @GetMapping("/user/{userId}")
    public List<Anime> byUser(@PathVariable Long userId) {
        return animeService.allAnimeByUser(userId);
    }

    /** Popola la table con trending in onda da AniList. */
    @PostMapping("/seed")
    public List<Anime> seed(@RequestParam(defaultValue = "200") int perPage) {
        return animeService.seedTrending(perPage);
    }
}
