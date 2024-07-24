package com.example.demo.service;

// import java.io.ByteArrayOutputStream;
// import java.io.InputStream;
import java.util.Base64;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class ImageService {

    private final RestTemplate restTemplate;

    public ImageService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getImageAsBase64(String imageUrl) {
        try {
            // ResponseEntity<byte[]>를 사용하여 이미지를 가져옴
            ResponseEntity<byte[]> responseEntity = restTemplate.exchange(
                imageUrl,
                HttpMethod.GET,
                null,
                byte[].class
            );

            if (HttpStatus.OK.equals(responseEntity.getStatusCode())) {
                // 바이트 배열을 Base64로 인코딩
                byte[] imageBytes = responseEntity.getBody();
                return Base64.getEncoder().encodeToString(imageBytes);
            } else {
                // 실패 시 적절히 처리
                return null;
            }
        } catch (RestClientException e) {
            e.printStackTrace();
            return null;
        }
    }
}