package marcopagnanini.backend.service;

import marcopagnanini.backend.model.Anime;
import marcopagnanini.backend.model.Subscription;
import marcopagnanini.backend.model.User;
import marcopagnanini.backend.repository.AnimeRepository;
import marcopagnanini.backend.repository.SubscriptionRepository;
import marcopagnanini.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subRepo;
    private final UserRepository userRepo;
    private final AnimeRepository animeRepo;

    public SubscriptionService(SubscriptionRepository subRepo,
                               UserRepository userRepo,
                               AnimeRepository animeRepo) {
        this.subRepo = subRepo;
        this.userRepo = userRepo;
        this.animeRepo = animeRepo;
    }

    // Idempotente: se gia' iscritto ritorna la sub esistente.
    @Transactional
    public Subscription subscribe(Long userId, Long animeId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utente non trovato"));
        Anime anime = animeRepo.findById(animeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anime non trovato"));

        return subRepo.findByUserAndAnime(user, anime).orElseGet(() -> {
            Subscription s = new Subscription();
            s.setUser(user);
            s.setAnime(anime);
            return subRepo.save(s);
        });
    }

    @Transactional
    public void unsubscribe(Long userId, Long animeId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utente non trovato"));
        Anime anime = animeRepo.findById(animeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anime non trovato"));
        subRepo.deleteByUserAndAnime(user, anime);
    }

    public List<Anime> animeByUser(Long userId) {
        return animeRepo.findByUserId(userId);
    }
}
