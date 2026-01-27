package com.danaku.danaku.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.LoginRequestDto;
import com.danaku.danaku.service.LoginService;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final LoginService loginService;

    @Autowired
    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping("/login")
    public ResponseEntity<GeneralResponseDto> login(@RequestBody LoginRequestDto loginRequestDto) {
        return loginService.login(loginRequestDto);
    }
    
    @PostMapping("/validate")
    public ResponseEntity<GeneralResponseDto> validateToken(@RequestHeader("Authorization") String authHeader) {
        System.out.println("\n=== VALIDATE TOKEN ENDPOINT ===");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("❌ No Bearer token in header");
            
            GeneralResponseDto response = new GeneralResponseDto();
            response.setResponseCode("400");
            response.setResponseDesc("Authorization header harus diawali dengan 'Bearer '");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        String token = authHeader.substring(7);
        System.out.println("Token received: " + (token.length() > 30 ? token.substring(0, 30) + "..." : token));
        
        return loginService.validateTokenEndpoint(token);
    }
    
    @PostMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("✅ JWT Auth Server is running! Time: " + new java.util.Date());
    }

    
}