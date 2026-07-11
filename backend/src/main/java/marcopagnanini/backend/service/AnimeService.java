package marcopagnanini.backend.service;

import marcopagnanini.backend.dto.AiringInfo;
import marcopagnanini.backend.model.Anime;
import marcopagnanini.backend.repository.AnimeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AnimeService {

    private final AnimeRepository animeRepo;
    private final AniListService aniList;

    public AnimeService(AnimeRepository animeRepo, AniListService aniList) {
        this.animeRepo = animeRepo;
        this.aniList = aniList;
    }

    public List<Anime> findAll() {
        return animeRepo.findAll();
    }

    /** Popola la table Anime con trending in onda. Upsert per aniListMediaId. */
    @Transactional
    public List<Anime> seedTrending(int perPage) {
        List<Anime> saved = new ArrayList<>();
        for (AiringInfo info : aniList.getTrendingAiring(perPage)) {
            saved.add(upsert(info));
        }
        return saved;
    }

    private Anime upsert(AiringInfo info) {
        Anime anime = animeRepo.findByAniListMediaId(info.mediaId()).orElseGet(Anime::new);
        anime.setAniListMediaId(info.mediaId());
        anime.setTitle(info.title());
        anime.setNextAiringAt(info.airingAt());
        anime.setNextEpisode(info.episode());
        return animeRepo.save(anime);
    }
}
