package marcopagnanini.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Anime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer aniListMediaId;

    private String title;

    private Long nextAiringAt;   // epoch UTC — NON timeUntilAiring

    private Integer nextEpisode;

    @Column(length = 512)
    private String coverImage;   // URL poster AniList (coverImage.large)
}
