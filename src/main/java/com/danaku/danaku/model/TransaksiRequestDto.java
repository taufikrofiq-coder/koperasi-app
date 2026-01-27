package com.danaku.danaku.model;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class TransaksiRequestDto {
     private String noRekening;
    private String nama;
    private String debet;
    private String credit;
    private String keterangan;
    private LocalDateTime tanggal;
}
