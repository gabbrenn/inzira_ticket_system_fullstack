package com.inzira.shared.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.inzira.shared.security.JwtAuthenticationFilter;

import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private Environment env;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - allow all
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/guest/**").permitAll()
                .requestMatchers("/api/sse/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/tickets/verify/**").permitAll()
                .requestMatchers("/api/tickets/download/**").permitAll()
                .requestMatchers("/api/momo/**").permitAll()
                .requestMatchers("/api/payments/**").permitAll()
                .requestMatchers("/error").permitAll()
                
                // Shared endpoints that multiple roles can access - MUST come before /api/admin/**
                .requestMatchers("/api/admin/districts").permitAll()
                .requestMatchers("/api/admin/districts/**").permitAll()
                .requestMatchers("/api/admin/provinces").permitAll()
                .requestMatchers("/api/admin/provinces/**").permitAll()
                .requestMatchers("/api/admin/routes").hasAnyRole("ADMIN", "AGENCY","AGENT")
                .requestMatchers("/api/admin/routes/**").hasAnyRole("ADMIN", "AGENCY")
                .requestMatchers("/api/agency/schedules/**").permitAll()
                
                // Password change - accessible by all authenticated users
                .requestMatchers("/api/auth/change-password").authenticated()
    
                
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Agency endpoints  
                .requestMatchers("/api/agency/**").hasAnyRole("AGENCY", "BRANCH_MANAGER")
                
                // Branch Manager endpoints
                .requestMatchers("/api/branch-manager/**").hasRole("BRANCH_MANAGER")
                
                // Agent endpoints
                .requestMatchers("/api/agent/**").hasRole("AGENT")
                
                // Driver endpoints
                .requestMatchers("/api/driver/**").hasRole("DRIVER")
                
                // Customer endpoints
                .requestMatchers("/api/customers/**").permitAll()
                .requestMatchers("/api/bookings/**").permitAll()
                .requestMatchers("/api/tickets/**").hasAnyRole("CUSTOMER", "ADMIN", "AGENCY", "AGENT")
                
                // All other requests need authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Read allowed origins from property or env (comma-separated)
        String raw = env.getProperty("app.cors.allowed-origins");
        if (raw == null || raw.isBlank()) {
            raw = env.getProperty("CORS_ALLOWED_ORIGINS");
        }
        if (raw == null || raw.isBlank()) {
            raw = "http://localhost:5173"; // default for dev
        }

        List<String> entries = Arrays.stream(raw.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();

        List<String> exactOrigins = new ArrayList<>();
        List<String> originPatterns = new ArrayList<>();
        for (String o : entries) {
            if (o.contains("*")) originPatterns.add(o); else exactOrigins.add(o);
        }

        if (!exactOrigins.isEmpty()) configuration.setAllowedOrigins(exactOrigins);
        if (!originPatterns.isEmpty()) configuration.setAllowedOriginPatterns(originPatterns);

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Content-Disposition"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}