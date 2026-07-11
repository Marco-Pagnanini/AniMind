package marcopagnanini.backend.controller;

import marcopagnanini.backend.dto.AuthDtos.AuthResponse;
import marcopagnanini.backend.dto.AuthDtos.LoginRequest;
import marcopagnanini.backend.dto.AuthDtos.RegisterRequest;
import marcopagnanini.backend.model.User;
import marcopagnanini.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody RegisterRequest req) {
        User u = userService.register(req.username(), req.email(), req.password());
        return new AuthResponse(u.getId(), u.getUsername(), u.getEmail());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        User u = userService.login(req.username(), req.password());
        return new AuthResponse(u.getId(), u.getUsername(), u.getEmail());
    }
}
