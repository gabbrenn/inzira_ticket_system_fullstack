package com.inzira.admin.dtos;

import lombok.Data;

@Data
public class AgencyUpdateDTO {
    private String agencyName;
    private String phoneNumber;
    private String address;
    private String status;
    private String logoPath;
}
