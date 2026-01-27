package com.danaku.danaku.model;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeResponseDto {
    private Long id;
     private String employeeId;
    private String nama;
    private String noTelp;
    private String alamat;
    private String role;
    private LocalDateTime tanggal;
}