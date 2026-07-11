package marcopagnanini.backend.repository;

import marcopagnanini.backend.model.Anime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AnimeRepository extends JpaRepository<Anime, Long> {
    Optional<Anime> findByAniListMediaId(Integer aniListMediaId);

    /** Tutti gli anime seguiti da un utente, via join su Subscription. */
    @Query("SELECT s.anime FROM Subscription s WHERE s.user.id = :userId")
    List<Anime> findByUserId(@Param("userId") Long userId);
}
