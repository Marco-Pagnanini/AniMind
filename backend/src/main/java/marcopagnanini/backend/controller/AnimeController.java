package marcopagnanini.backend.controller;

import marcopagnanini.backend.model.Anime;
import marcopagnanini.backend.service.AnimeService;
import org.springframework.web.bind.annotation.GetMapping;
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

    /** Lista anime salvati (per l'app). */
    @GetMapping
    public List<Anime> all() {
        return animeService.findAll();
    }

    /** Popola la table con trending in onda da AniList. */
    @PostMapping("/seed")
    public List<Anime> seed(@RequestParam(defaultValue = "20") int perPage) {
        return animeService.seedTrending(perPage);
    }
}
