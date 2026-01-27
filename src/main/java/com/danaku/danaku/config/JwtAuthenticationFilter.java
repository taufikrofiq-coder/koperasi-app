package com.danaku.danaku.config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtTokenProvider tokenProvider,
            UserDetailsService userDetailsService
    ) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
        log.info("[JWT-FILTER] ✅ JwtAuthenticationFilter initialized");
    }

    /**
     * ✅ LEWATI FILTER UNTUK ENDPOINT PUBLIC
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        return path.startsWith("/api/auth/")
            || path.startsWith("/api/local-drive/public/")
            || path.startsWith("/health");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String method = request.getMethod();
        final String uri = request.getRequestURI();

        // 🔥 LOG WAJIB – bukti filter dipanggil
        log.debug("[JWT-FILTER] 🔥 Processing request: {} {}", method, uri);

        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.debug("[JWT-FILTER] No Authorization header, continue without auth");
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(7);

            log.debug("[JWT-FILTER] Token found (length={})", token.length());

            if (!tokenProvider.validateToken(token)) {
                log.warn("[JWT-FILTER] ❌ Invalid or expired token");
                filterChain.doFilter(request, response);
                return;
            }

            String username = tokenProvider.getUsernameFromToken(token);
            log.info("[JWT-FILTER] ✅ Token valid for username={}", username);

            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(username);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                log.info("[JWT-FILTER] 🔐 SecurityContext set for user={}", username);
            }

        } catch (Exception ex) {
            log.error("[JWT-FILTER] 💥 Authentication error on {} {}", method, uri, ex);
        }

        filterChain.doFilter(request, response);
    }
}
