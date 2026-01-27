package com.danaku.danaku.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class loginResponseDto {
    private Long userId;
    private String userName;
    private String nama;
    private String noRekening;
    private String role;
    private String token;
}

