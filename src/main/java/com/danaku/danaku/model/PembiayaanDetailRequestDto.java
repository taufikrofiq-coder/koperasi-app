package com.danaku.danaku.model;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PembiayaanDetailRequestDto {

    private LocalDate tanggalJatuhTempo;
    private String saldoAwal;
    private String cicilan;
    private String bunga;
    private String pokok;
    private String status;
}
