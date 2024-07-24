package com.example.demo.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AuthenticationRequest;
import com.example.demo.dto.AuthenticationResponse;
import com.example.demo.model.User;
import com.example.demo.model.UserCreateForm;
import com.example.demo.model.UserPortfolio;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ImageService;
import com.example.demo.service.JwtService;
import com.example.demo.service.UserPortfolioService;
import com.example.demo.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:8080")
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private static final String CURRENT_VERSION = "1.0.0"; // 현재 버전
    private static final String APK_FILE_PATH = "src/main/resources/update/update.apk"; // APK 파일 경로
    
    private final UserService userService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final UserPortfolioService userPortfolioService;
    private final ImageService imageService;


    @PostMapping("/register")
    public ResponseEntity<Object> saveUser(@RequestBody @Valid UserCreateForm userCreateForm) {
        // UserCreateForm에서 필드에 직접 접근하여 데이터를 가져옵니다.
        userService.create(userCreateForm.getEmail(), userCreateForm.getUserName(), userCreateForm.getPw());
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/register")
    public ResponseEntity<List<User>> getAllTestEntities() {
        List<User> result = userService.getAllTestEntities();
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(userService.authenticate(request));
    }


    @GetMapping("/hello")
    public ResponseEntity<Object> testApi() {
        String result = "API 통신에 성공하였습니다.";
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/check-email")
    public ResponseEntity<Void> checkEmail(@RequestBody Map<String, String> email) {
        if (userService.isEmailExists(email.get("email"))) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/check-username")
    public ResponseEntity<Void> checkUserName(@RequestBody Map<String, String> userName) {
        if (userService.isUsernameExists(userName.get("userName"))) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/info")
    public ResponseEntity<User> getUserInfo(@RequestHeader("Authorization") String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        String userEmail = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/stock/{stockCode}")
    public ResponseEntity<?> getUserStockQuantity(
            @PathVariable String stockCode,
            @RequestHeader("Authorization") String token) {

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        String userEmail = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        Optional<UserPortfolio> userPortfolio = userPortfolioService.getUserPortfolio(user.getUser_id(), stockCode);

        if (userPortfolio.isPresent()) {
            return ResponseEntity.ok(userPortfolio.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/image")
    public String getImage(@RequestParam String imageUrl) {
        return imageService.getImageAsBase64(imageUrl);
    }

    @PostMapping("/updateCheck")
    public ResponseEntity<Map<String, Object>> updateCheck(@RequestBody Map<String, String> requestBody) {
        String receivedVersion = requestBody.get("version");

        if (CURRENT_VERSION.equals(receivedVersion)) {
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            // 버전이 다를 경우 단순히 success: false로 응답
            return ResponseEntity.ok(Map.of("success", false));
        }
    }

    @GetMapping("/updateApk")
    public ResponseEntity<Resource> updateApk() {
        File apkFile = new File(APK_FILE_PATH);
        System.out.println("APK File Path: " + apkFile.getAbsolutePath()); // 파일 경로 출력

        if (apkFile.exists()) {
            try {
                InputStreamResource resource = new InputStreamResource(new FileInputStream(apkFile));
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + apkFile.getName())
                        .header(HttpHeaders.CONTENT_TYPE, "application/vnd.android.package-archive")
                        .contentLength(apkFile.length())
                        .body(resource);
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
            }
        } else {
            System.out.println("APK File Not Found: " + apkFile.getAbsolutePath()); // 파일이 없다는 로그
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}