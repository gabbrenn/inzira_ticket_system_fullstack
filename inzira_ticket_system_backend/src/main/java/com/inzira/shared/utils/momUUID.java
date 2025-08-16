package com.inzira.shared.utils;
import java.util.UUID;

public class momUUID {
    public static void main(String[] args) {
        String uuid = UUID.randomUUID().toString();
        System.out.println("Your Reference ID: " + uuid);
    }
}
