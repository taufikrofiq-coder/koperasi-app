package com.danaku.danaku.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "pembiayaan_detail")
public class pembiayaanDetailEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String no;
    private String nama;
    private String noRekening;
    private String noPembiayaan;
    private LocalDate tanggalJatuhTempo;
    private String saldoAwal;
    private String cicilan;
    private String bunga;
    private String pokok;
    private String status;
    private LocalDateTime tanggal;
    private LocalDate tanggalBayar;
    
}
