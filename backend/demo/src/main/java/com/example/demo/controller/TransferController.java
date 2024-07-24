package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Transfer;
import com.example.demo.model.User;
import com.example.demo.model.UserAccount;
import com.example.demo.repository.UserAccountRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.JwtService;
import com.example.demo.service.TransferService;

@RestController
@RequestMapping("/api/account")
@CrossOrigin(origins = "http://localhost:8080")
public class TransferController {
    
    @Autowired
    private TransferService transferService;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/info")
    public ResponseEntity<UserAccount> getUserAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername(); // username을 userId로 간주

        // username으로 User 엔티티에서 userId를 찾기
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with emial: " + email));
        
        Long userId = user.getUser_id();

        // userId로 UserAccount 정보를 찾기
        UserAccount userAccount = userAccountRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("UserAccount not found with userId: " + userId));

        return ResponseEntity.ok(userAccount);
    }

    @PostMapping("/transfer")
    public ResponseEntity<Transfer> transferMoney(@RequestHeader("Authorization") String token, @RequestBody TransferRequest transferRequest) {
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

                Transfer transfer = transferService.transferMoney(
                        user.getUser_id(),
                        transferRequest.getAccountNumber(),
                        transferRequest.getAmount(),
                        transferRequest.getPassword()
                );
                return new ResponseEntity<>(transfer, HttpStatus.CREATED);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}

class TransferRequest {
    private Long userId;
    private String accountNumber;
    private Long amount;
    private String password;

    // Getter and Setter methods
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}