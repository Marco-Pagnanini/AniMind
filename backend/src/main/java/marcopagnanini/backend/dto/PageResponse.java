package marcopagnanini.backend.dto;

import org.springframework.data.domain.Page;

import java.util.List;

// Wrapper stabile per il frontend (evita il formato Page instabile di Spring).
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        boolean last) {

    public static <T> PageResponse<T> of(Page<T> p) {
        return new PageResponse<>(
                p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.isLast());
    }
}
