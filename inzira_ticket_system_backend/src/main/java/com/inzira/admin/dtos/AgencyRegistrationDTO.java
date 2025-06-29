package com.inzira.admin.dtos;

import lombok.Data;

@Data
public class AgencyRegistrationDTO {
    private String agencyName;
    private String email;
    private String phoneNumber;
    private String address;
    private String status;
    private String password;
}
