package com.danaku.danaku.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GeneralResponseDto<T> {
    private String responseCode;
    private String responseDesc;
    private T transactionDetail;
    private T data; // ✅ gunakan generic type, bukan Object

    public GeneralResponseDto() {}

    public GeneralResponseDto(String responseCode, String responseDesc, T data) {
        this.responseCode = responseCode;
        this.responseDesc = responseDesc;
        this.data = data;
    }
}


