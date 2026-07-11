package marcopagnanini.backend.repository;

import marcopagnanini.backend.model.Anime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnimeRepository extends JpaRepository<Anime, Long> {
    Optional<Anime> findByAniListMediaId(Integer aniListMediaId);
}
