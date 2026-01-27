package com.danaku.danaku.model;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class UserResponseDto {
    private Long userId;
    private String userName;
    private String nama;
    private String noTelp;
    private String role;
    private String noRekening;
}