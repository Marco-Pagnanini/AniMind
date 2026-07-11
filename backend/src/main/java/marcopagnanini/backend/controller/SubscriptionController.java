package marcopagnanini.backend.controller;

import marcopagnanini.backend.dto.SubscribeRequest;
import marcopagnanini.backend.service.SubscriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void subscribe(@RequestBody SubscribeRequest req) {
        subscriptionService.subscribe(req.userId(), req.animeId());
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unsubscribe(@RequestBody SubscribeRequest req) {
        subscriptionService.unsubscribe(req.userId(), req.animeId());
    }
}
