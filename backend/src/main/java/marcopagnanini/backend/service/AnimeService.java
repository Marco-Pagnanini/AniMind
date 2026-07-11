package marcopagnanini.backend.service;

import marcopagnanini.backend.dto.MediaInfo;
import marcopagnanini.backend.dto.PageResponse;
import marcopagnanini.backend.model.Anime;
import marcopagnanini.backend.repository.AnimeRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AnimeService {

    private static final int ANILIST_PER_PAGE = 50; // max consentito da AniList

    private final AnimeRepository animeRepo;
    private final AniListService aniList;

    public AnimeService(AnimeRepository animeRepo, AniListService aniList) {
        this.animeRepo = animeRepo;
        this.aniList = aniList;
    }

    public List<Anime> findAll() {
        return animeRepo.findAll();
    }

    /** Pagina di anime salvati, ordinata per prossimo airing (nulls last). */
    public PageResponse<Anime> findPage(int page, int size) {
        Sort sort = Sort.by(Sort.Order.asc("id"));
        return PageResponse.of(animeRepo.findAll(PageRequest.of(page, size, sort)));
    }

    /**
     * Popola la table con trending in onda. Cicla le pagine AniList (50/pag)
     * fino a raggiungere {@code target} o esaurire i risultati.
     */
    @Transactional
    public List<Anime> seedTrending(int target) {
        List<Anime> saved = new ArrayList<>();
        for (int page = 1; page <= 20 && saved.size() < target; page++) {
            List<MediaInfo> batch = aniList.getPopular(page, ANILIST_PER_PAGE);
            if (batch.isEmpty()) break;
            for (MediaInfo m : batch) {
                saved.add(upsert(m.mediaId(), m.title(), m.airingAt(), m.episode(), m.coverImage()));
                if (saved.size() >= target) break;
            }
        }
        return saved;
    }

    /** Ricerca su AniList e salva/aggiorna i risultati nel DB. */
    @Transactional
    public List<Anime> search(String query) {
        List<Anime> out = new ArrayList<>();
        for (MediaInfo m : aniList.searchMedia(query, 25)) {
            out.add(upsert(m.mediaId(), m.title(), m.airingAt(), m.episode()));
        }
        return out;
    }

    private Anime upsert(int mediaId, String title, Long airingAt, Integer episode) {
        Anime anime = animeRepo.findByAniListMediaId(mediaId).orElseGet(Anime::new);
        anime.setAniListMediaId(mediaId);
        anime.setTitle(title);
        anime.setNextAiringAt(airingAt);
        anime.setNextEpisode(episode);
        return animeRepo.save(anime);
    }

    /** Tutti gli anime seguiti dall'utente. */
    public List<Anime> allAnimeByUser(Long idUser) {
        return animeRepo.findByUserId(idUser);
    }
}
