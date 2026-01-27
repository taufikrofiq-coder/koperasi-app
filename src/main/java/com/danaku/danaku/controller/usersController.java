package com.danaku.danaku.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.UserResponseDto;
import com.danaku.danaku.model.userRequestDto;
import com.danaku.danaku.service.usersService;

import jakarta.validation.Valid;




@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class usersController {

    @Autowired
    private usersService usersService;

    // ✅ CREATE USER - DENGAN VALIDATION
    @PostMapping("/create")
    public ResponseEntity<GeneralResponseDto<String>> createUser(@Valid @RequestBody userRequestDto requestDto) {
        GeneralResponseDto<String> response = usersService.createUser(requestDto);
        return mapResponse(response);
    }

    // ✅ GET USER BY ID
    // @GetMapping("/{userId}")
    // public ResponseEntity<GeneralResponseDto<UserResponseDto>> getUserById(@PathVariable Long userId) {
    //     if (userId == null || userId <= 0) {
    //         return ResponseEntity.badRequest().body(createErrorResponse("User ID tidak valid"));
    //     }
        
    //     GeneralResponseDto<UserResponseDto> response = usersService.getUserById(userId);
    //     return mapResponse(response);
    // }

    // ✅ UPDATE USER
    @PutMapping("/{noRekening}")
    public ResponseEntity<GeneralResponseDto<String>> updateUser(
            @PathVariable String norekening,
            @Valid @RequestBody userRequestDto requestDto) {
        
        if (norekening == null || norekening.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(createErrorResponse("Employee ID tidak boleh kosong"));
        }
        
        GeneralResponseDto<String> response = usersService.updateUser(norekening, requestDto);
        return mapResponse(response);
    }

    // ✅ DELETE USER
    // @DeleteMapping("/{userId}")
    // public ResponseEntity<GeneralResponseDto<String>> deleteUser(@PathVariable Long userId) {
    //     if (userId == null || userId <= 0) {
    //         return ResponseEntity.badRequest().body(createErrorResponse("User ID tidak valid"));
    //     }
        
    //     GeneralResponseDto<String> response = usersService.deleteUser(userId);
    //     return mapResponse(response);
    // }

    // ✅ GET ALL USERS
  @GetMapping("/users")
public ResponseEntity<GeneralResponseDto<List<UserResponseDto>>> getAllUsers() {
    GeneralResponseDto<List<UserResponseDto>> response = usersService.getAllUsers();
    return ResponseEntity.ok(response);
}


    // ✅ GET USER BY EMPLOYEE ID
   @GetMapping("/rekening/{noRekening}")
public ResponseEntity<GeneralResponseDto<UserResponseDto>> getUserByNorekening(
        @PathVariable("noRekening") String norekening) {

    if (norekening == null || norekening.trim().isEmpty()) {
        return ResponseEntity.badRequest()
                .body(createErrorResponse("Nomor Rekening tidak boleh kosong"));
    }

    GeneralResponseDto<UserResponseDto> response =
            usersService.getUserByNoRekening(norekening);
    return mapResponse(response);
}


    // ✅ CEK USERNAME AVAILABILITY
    @GetMapping("/check-username/{username}")
    public ResponseEntity<GeneralResponseDto<Boolean>> checkUsername(@PathVariable String username) {
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(createErrorResponse("Username tidak boleh kosong"));
        }
        
        GeneralResponseDto<Boolean> response = usersService.checkUsernameAvailability(username);
        return mapResponse(response);
    }

    // ============ HELPER METHODS ============
    
    private <T> ResponseEntity<GeneralResponseDto<T>> mapResponse(GeneralResponseDto<T> response) {
        if (response == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Response tidak valid"));
        }
        
        String responseCode = response.getResponseCode();
        if (responseCode == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Response code tidak valid"));
        }
        
        return switch (responseCode) {
            case "200" -> ResponseEntity.ok(response);
            case "400" -> ResponseEntity.badRequest().body(response);
            case "404" -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            case "409" -> ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            default -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        };
    }
    
    private <T> GeneralResponseDto<T> createErrorResponse(String message) {
        GeneralResponseDto<T> response = new GeneralResponseDto<>();
        response.setResponseCode("400");
        response.setResponseDesc(message);
        return response;
    }
}