package com.danaku.danaku.model;

import java.util.List;

import com.danaku.danaku.entity.pembiayaanDetailEntity;
import com.danaku.danaku.entity.pembiayaanEntity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PembiayaanInquiryResponseDto {

    private pembiayaanEntity pembiayaan;
    private List<pembiayaanDetailEntity> jadwalCicilan;
}
