package com.inzira.shared.config;

import org.springframework.beans.factory.annotation.Autowired;
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

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

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
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/tickets/verify/**").permitAll()
                .requestMatchers("/error").permitAll()
                
                // Shared endpoints that multiple roles can access - MUST come before /api/admin/**
                .requestMatchers("/api/admin/districts").hasAnyRole("ADMIN", "CUSTOMER", "AGENCY","AGENT")
                .requestMatchers("/api/admin/districts/**").hasAnyRole("ADMIN", "CUSTOMER", "AGENCY","AGENT")
                .requestMatchers("/api/admin/routes").hasAnyRole("ADMIN", "AGENCY","AGENT")
                .requestMatchers("/api/admin/routes/**").hasAnyRole("ADMIN", "AGENCY")
                .requestMatchers("/api/agency/schedules/**").hasAnyRole("CUSTOMER", "AGENCY", "AGENT")
    
                
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Agency endpoints  
                .requestMatchers("/api/agency/**").hasAnyRole("AGENCY", "BRANCH_MANAGER")
                
                // Branch Manager endpoints
                .requestMatchers("/api/branch-manager/**").hasRole("BRANCH_MANAGER")
                
                // Agent endpoints
                .requestMatchers("/api/agent/**").hasRole("AGENT")
                
                // Customer endpoints
                .requestMatchers("/api/customers/**").hasAnyRole("CUSTOMER", "ADMIN")
                .requestMatchers("/api/bookings/**").hasAnyRole("CUSTOMER", "ADMIN", "AGENCY", "AGENT")
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
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}