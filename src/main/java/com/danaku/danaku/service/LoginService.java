package com.danaku.danaku.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.danaku.danaku.config.JwtTokenProvider;
import com.danaku.danaku.entity.employeesEntity;
import com.danaku.danaku.entity.usersEntity;
import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.LoginRequestDto;
import com.danaku.danaku.model.loginResponseDto;
import com.danaku.danaku.repository.employeesRepository;
import com.danaku.danaku.repository.usersRepository;

@Service
public class LoginService {

    @Autowired
    private usersRepository userRepository;

    @Autowired
    private employeesRepository employeesRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // ================= LOGIN API =================
    public ResponseEntity<GeneralResponseDto> login(LoginRequestDto dto) {

        try {
            usersEntity user = userRepository.findByUserName(dto.getUsername())
                    .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

            if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
                throw new RuntimeException("Password salah");
            }

            employeesEntity employee = employeesRepository
                    .findByNoRekening(user.getNoRekening())
                    .orElseThrow(() -> new RuntimeException("Data karyawan tidak ditemukan"));

            // ✅ TOKEN DARI PROVIDER (SATU SUMBER)
            String token = jwtTokenProvider.generateToken(
                    user.getUserName(),
                    user.getUserId()
            );

            loginResponseDto loginResponse = new loginResponseDto();
            loginResponse.setUserId(user.getUserId());
            loginResponse.setUserName(user.getUserName());
            loginResponse.setNama(employee.getNama());
            loginResponse.setNoRekening(user.getNoRekening());
            loginResponse.setRole(employee.getRole());
            loginResponse.setToken(token);

            GeneralResponseDto response = new GeneralResponseDto();
            response.setResponseCode("200");
            response.setResponseDesc("Login berhasil");
            response.setTransactionDetail(loginResponse);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            GeneralResponseDto response = new GeneralResponseDto();
            response.setResponseCode("401");
            response.setResponseDesc("Login gagal: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // ================= TOKEN VALIDATION =================
    public ResponseEntity<GeneralResponseDto> validateTokenEndpoint(String token) {

        GeneralResponseDto response = new GeneralResponseDto();

        try {
            boolean valid = jwtTokenProvider.validateToken(token);

            if (!valid) {
                response.setResponseCode("401");
                response.setResponseDesc("Token tidak valid");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String username = jwtTokenProvider.getUsernameFromToken(token);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);

            loginResponseDto userInfo = new loginResponseDto();
            userInfo.setUserId(userId);
            userInfo.setUserName(username);

            response.setResponseCode("200");
            response.setResponseDesc("Token valid");
            response.setTransactionDetail(userInfo);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.setResponseCode("500");
            response.setResponseDesc("Error validasi token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Untuk login form (Thymeleaf / MVC)
    public GeneralResponseDto loginForm(LoginRequestDto dto) {
        return login(dto).getBody();
    }
}
