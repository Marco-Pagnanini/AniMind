package marcopagnanini.backend.controller;

import marcopagnanini.backend.dto.AiringInfo;
import marcopagnanini.backend.service.AniListService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/anilist")
public class AniListController {
    private final AniListService aniListService;

    public AniListController(AniListService aniListService) {
        this.aniListService = aniListService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<AiringInfo> getAiringInfo(@PathVariable("id") String id) {
        AiringInfo result = aniListService.getNextAiring(Integer.parseInt(id)).orElse(null);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }
}
