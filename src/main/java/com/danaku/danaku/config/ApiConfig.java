package com.danaku.danaku.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiConfig {

    /* ================= BASE URL ================= */
    @Value("${api.base-url:http://localhost:2121}")
    private String apiBaseUrl;

    /* ================= TRANSAKSI ================= */
    @Value("${api.endpoint.transaksi.saldo:/api/transaksi/saldo}")
    private String transaksiSaldo;

    @Value("${api.endpoint.transaksi.saldo-by-rekening:/api/transaksi/saldo}")
    private String transaksiSaldoByRekening;

    @Value("${api.endpoint.transaksi.create:/api/transaksi/create}")
    private String transaksiCreate;

    /* ================= USERS ================= */
    @Value("${api.endpoint.users.create:/api/users/create}")
    private String usersCreate;

    @Value("${api.endpoint.users.by-username:/api/users/username}")
    private String usersByUsername;

    @Value("${api.endpoint.users.by-rekening:/api/users/rekening}")
    private String usersByRekening;

    /* ================= PEMBIAYAAN ================= */
    @Value("${api.endpoint.pembiayaan.total-pokok:/api/pembiayaan-detail/total-pokok-belum-bayar}")
    private String pembiayaanTotalPokok;

    /* ================= PENDAPATAN ================= */
    @Value("${api.endpoint.pendapatan.total:/api/pendapatan/total}")
    private String pendapatanTotal;


    /* ================= GETTERS ================= */
    public String getApiBaseUrl() { return apiBaseUrl; }

    public String getTransaksiSaldo() { return transaksiSaldo; }

    public String getTransaksiSaldoByRekening() { return transaksiSaldoByRekening; }

    public String getTransaksiCreate() { return transaksiCreate; }

    public String getUsersCreate() { return usersCreate; }

    public String getUsersByUsername() { return usersByUsername; }

    public String getUsersByRekening() { return usersByRekening; }

    public String getPembiayaanTotalPokok() { return pembiayaanTotalPokok; }

    public String getPendapatanTotal() { return pendapatanTotal; }
}
