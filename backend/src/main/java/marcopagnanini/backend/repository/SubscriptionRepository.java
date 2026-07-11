package marcopagnanini.backend.repository;

import marcopagnanini.backend.model.Anime;
import marcopagnanini.backend.model.Subscription;
import marcopagnanini.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription,Long> {
    // sweeper: due = da notificare ora, join su anime
    @Query("""
    SELECT s FROM Subscription s
    WHERE s.notified = false AND s.anime.nextAiringAt IS NOT NULL
      AND s.anime.nextAiringAt - (s.notifyMinutesBefore * 60) <= :now
      AND s.anime.nextAiringAt + 3600 >= :now
""")
    List<Subscription> findDue(@Param("now") long now);

    // slittamento: reset notified su tutte le sub di un anime
    @Modifying
    @Query("UPDATE Subscription s SET s.notified = false WHERE s.anime = :anime")
    void resetNotifiedForAnime(@Param("anime") Anime anime);

    List<Subscription> findByUser(User user);            // GET /subscriptions
    boolean existsByUserAndAnime(User user, Anime anime); // anti-doppione
}
