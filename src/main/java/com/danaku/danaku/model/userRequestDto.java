package com.danaku.danaku.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class userRequestDto {
    private Long userId;
    private String userName;
    private String password;
    private String employeeId;

    private String nama;
    private String noTelp;
    private String alamat;
    private String role;
}
