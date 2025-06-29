package com.inzira.shared.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {
    @Value("${file.upload-dir}")
    private String uploadDir;

    // Allow storing in subfolders like "product-images", "user-profile"
    public String storeFile(MultipartFile file, String subfolder) throws IOException {
        // Generate unique filename
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        // Build target path
        Path path = Paths.get(uploadDir, subfolder).toAbsolutePath().normalize();
        Files.createDirectories(path); // Create the subfolder if not exists

        Path filePath = path.resolve(fileName);
        Files.write(filePath, file.getBytes());

        // Return relative path (can be stored in DB)
        return Paths.get(subfolder, fileName).toString().replace("\\", "/");
    }
}
