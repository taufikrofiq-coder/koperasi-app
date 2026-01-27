package com.danaku.danaku.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.danaku.danaku.config.ApiConfig;

@RestController
@RequestMapping("/api/config")
public class ApiConfigController {

    private final ApiConfig apiConfig;

    public ApiConfigController(ApiConfig apiConfig) {
        this.apiConfig = apiConfig;
    }

    @GetMapping("/base-url")
    public Map<String, String> getBaseUrl() {
        return Map.of(
            "baseUrl", apiConfig.getApiBaseUrl()
        );
    }
}
