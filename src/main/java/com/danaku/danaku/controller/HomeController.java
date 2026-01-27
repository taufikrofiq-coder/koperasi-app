package com.danaku.danaku.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "index"; // tanpa .html
    }

    @GetMapping("/adminHome")
    public String home() {
        return "adminHome";
    }

     @GetMapping("/pembiayaan")
    public String pembiayaan() {
        return "pembiayaan";
    }

     @GetMapping("/pembayaran")
    public String pembayaran() {
        return "pembayaran";
    }
    
      @GetMapping("/history-transaksi")
    public String historyTransaksi() {
        return "historyTransaksi";
    }
}


