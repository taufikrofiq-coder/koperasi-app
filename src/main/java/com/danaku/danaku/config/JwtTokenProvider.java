package com.danaku.danaku.config;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtTokenProvider {

    private static final Logger log =
            LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String base64Secret;

    @Value("${jwt.expiration.in.ms}")
    private long jwtExpirationInMs;

    private Key signingKey;

    // ================= INIT =================
    @PostConstruct
    public void init() {
        log.info("[JWT-PROVIDER] Initializing JwtTokenProvider");

        byte[] keyBytes;

        try {
            keyBytes = Base64.getDecoder().decode(base64Secret);
            log.debug("[JWT-PROVIDER] Using Base64 decoded secret");
        } catch (Exception e) {
            log.warn("[JWT-PROVIDER] Secret is not Base64, using raw bytes");
            keyBytes = base64Secret.getBytes();
        }

        if (keyBytes.length < 32) {
            log.error("[JWT-PROVIDER] Invalid JWT secret length={} bytes (min 32)",
                    keyBytes.length);
            throw new IllegalArgumentException(
                "JWT secret key minimal 256 bit (32 karakter)"
            );
        }

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        log.info("[JWT-PROVIDER] JwtTokenProvider initialized successfully");
    }

    // ================= GENERATE TOKEN =================
    public String generateToken(String username, Long userId) {

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        log.info("[JWT-PROVIDER] Generating token for username={}, userId={}",
                username, userId);
        log.debug("[JWT-PROVIDER] Token issuedAt={}, expiresAt={}",
                now, expiryDate);

        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // ================= VALIDATE TOKEN =================
    public boolean validateToken(String token) {
        try {
            log.debug("[JWT-PROVIDER] Validating token (length={})",
                    token != null ? token.length() : 0);

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            log.info("[JWT-PROVIDER] Token valid for subject={}, expiresAt={}",
                    claims.getSubject(),
                    claims.getExpiration());

            return true;

        } catch (ExpiredJwtException e) {
            log.warn("[JWT-PROVIDER] Token expired at {}", e.getClaims().getExpiration());
        } catch (UnsupportedJwtException e) {
            log.error("[JWT-PROVIDER] Unsupported JWT token");
        } catch (MalformedJwtException e) {
            log.error("[JWT-PROVIDER] Malformed JWT token");
        } catch (SecurityException e) {
            log.error("[JWT-PROVIDER] Invalid JWT signature");
        } catch (IllegalArgumentException e) {
            log.error("[JWT-PROVIDER] JWT token is null or empty");
        } catch (JwtException e) {
            log.error("[JWT-PROVIDER] JWT error: {}", e.getMessage());
        }

        return false;
    }

    // ================= GET USERNAME =================
    public String getUsernameFromToken(String token) {
        try {
            Claims claims = getClaims(token);
            String username = claims.getSubject();

            log.debug("[JWT-PROVIDER] Username extracted={}", username);
            return username;

        } catch (Exception e) {
            log.error("[JWT-PROVIDER] Failed to extract username from token", e);
            return null;
        }
    }

    // ================= GET USER ID =================
    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = getClaims(token);
            Long userId = claims.get("userId", Long.class);

            log.debug("[JWT-PROVIDER] UserId extracted={}", userId);
            return userId;

        } catch (Exception e) {
            log.error("[JWT-PROVIDER] Failed to extract userId from token", e);
            return null;
        }
    }

    // ================= PRIVATE =================
    private Claims getClaims(String token) {
        log.debug("[JWT-PROVIDER] Parsing JWT claims");

        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
