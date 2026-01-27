package com.danaku.danaku.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        System.out.println("✅ [PASSWORD-CONFIG] Creating BCryptPasswordEncoder");
        return new BCryptPasswordEncoder();
    }
}