package marcopagnanini.backend.dto;

/** DTO per registrazione / login. */
public class AuthDtos {

    public record RegisterRequest(String username, String email, String password) {}

    public record LoginRequest(String username, String password) {}

    /** Risposta senza password. */
    public record AuthResponse(Long id, String username, String email) {}
}
