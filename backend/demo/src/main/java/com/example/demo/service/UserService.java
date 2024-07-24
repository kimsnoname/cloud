package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dto.AuthenticationRequest;
import com.example.demo.dto.AuthenticationResponse;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;


    public User create(String email, String username, String pw) {
        if (email == null || username == null || pw == null) {
            throw new IllegalArgumentException("입력 데이터가 올바르지 않습니다.");
        }

        User user = new User();
        user.setEmail(email);
        user.setUserName(username);
        user.setRole(Role.USER);
        user.setPw(passwordEncoder.encode(pw));
		user.setCreated_at(LocalDateTime.now());
		user.setUpdated_at(LocalDateTime.now());

        return userRepository.save(user);
    }

    public List<User> getAllTestEntities() {
        return userRepository.findAll();
    }


    public boolean isEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean isUsernameExists(String userName) {
        return userRepository.existsByUserName(userName);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // 인증 시도. 인증에 실패하면 AuthenticationError 반환됨
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 인증 성공 시
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .userName(user.getUserName())
                .build();
    }
}