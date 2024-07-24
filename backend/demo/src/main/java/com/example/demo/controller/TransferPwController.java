package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.JwtService;
import com.example.demo.service.TransferService;

@RestController
@RequestMapping("/api/transfer")
@CrossOrigin(origins = "http://localhost:8080")
public class TransferPwController {

    @Autowired
    private TransferService transferService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/verifypassword")
    public ResponseEntity<PasswordVerificationResponse> verifyPassword(
            @RequestHeader("Authorization") String token, 
            @RequestBody PasswordVerificationRequest request) {
        try {
            // 토큰에서 "Bearer " 접두사를 제거
            String jwt = token.substring(7);
            String userEmail = jwtService.extractUsername(jwt);
            UserDetails userDetails = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

            // 토큰이 유효한지 검증
            if (jwtService.isTokenValid(jwt, userDetails)) {
                // 이메일로 사용자 조회
                User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

                boolean passwordCorrect = transferService.verifyPassword(
                        user.getUser_id(),
                        request.getAccountPassword()
                );
                return ResponseEntity.ok(new PasswordVerificationResponse(passwordCorrect));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    static class PasswordVerificationRequest {
        private Long userId;
        private String accountPassword;

        // Getter and Setter methods
        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getAccountPassword() {
            return accountPassword;
        }

        public void setAccountPassword(String accountPassword) {
            this.accountPassword = accountPassword;
        }
    }

    static class PasswordVerificationResponse {
        private boolean success;

        public PasswordVerificationResponse(boolean success) {
            this.success = success;
        }

        // Getter method
        public boolean isSuccess() {
            return success;
        }

        // Setter method (not needed for this response)
    }
}
