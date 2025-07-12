package com.inzira.branch_manager.entities;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.inzira.agency.entities.Agency;
import com.inzira.agency.entities.BranchOffice;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class BranchManager {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE, SUSPENDED

    @ManyToOne(optional = false)
    @JoinColumn(name = "agency_id")
    private Agency agency;

    @OneToOne(optional = false)
    @JoinColumn(name = "branch_office_id")
    private BranchOffice branchOffice;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public BranchManager() {}
}