package com.finance.tracker.service;

import com.finance.tracker.dto.AuthRequest;
import com.finance.tracker.dto.AuthResponse;
import com.finance.tracker.dto.SignUpRequest;
import com.finance.tracker.dto.UserDTO;
import com.finance.tracker.entity.User;
import com.finance.tracker.exception.BadRequestException;
import com.finance.tracker.repository.UserRepository;
import com.finance.tracker.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User user;
    private SignUpRequest signUpRequest;
    private AuthRequest authRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("Jane Doe")
                .email("jane.doe@example.com")
                .password("encoded_password")
                .createdAt(LocalDateTime.now())
                .build();

        signUpRequest = new SignUpRequest();
        signUpRequest.setName("Jane Doe");
        signUpRequest.setEmail("jane.doe@example.com");
        signUpRequest.setPassword("password123");

        authRequest = new AuthRequest();
        authRequest.setEmail("jane.doe@example.com");
        authRequest.setPassword("password123");
    }

    @Test
    void signUp_success() {
        when(userRepository.existsByEmail(signUpRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(signUpRequest.getPassword())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserDTO result = authService.signUp(signUpRequest);

        assertNotNull(result);
        assertEquals(user.getEmail(), result.getEmail());
        assertEquals(user.getName(), result.getName());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void signUp_duplicateEmail_throwsBadRequestException() {
        when(userRepository.existsByEmail(signUpRequest.getEmail())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.signUp(signUpRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_success() {
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked_jwt_token");
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(authRequest);

        assertNotNull(response);
        assertEquals("mocked_jwt_token", response.getToken());
        assertEquals(user.getEmail(), response.getUser().getEmail());
    }
}
