package com.inzira.shared.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordUtility {

    private final BCryptPasswordEncoder passwordEncoder;

    public PasswordUtility() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // Generate initial raw password: agencyName (no spaces) + last 3 digits of phone number
    public String generateInitialPassword(String agencyName, String phoneNumber) {
        String trimmedName = agencyName.replaceAll("\\s+", ""); // remove spaces
        String last3Digits = phoneNumber.length() >= 3
            ? phoneNumber.substring(phoneNumber.length() - 3)
            : phoneNumber;
        return trimmedName + last3Digits;
    }

    // Encode a raw password
    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}
