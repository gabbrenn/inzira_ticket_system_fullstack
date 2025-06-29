package com.inzira.agency.mappers;

import com.inzira.agency.dtos.AgencyDTO;
import com.inzira.agency.dtos.AgencyRouteDTO;
import com.inzira.agency.entities.AgencyRoute;
import com.inzira.shared.dtos.DistrictDTO;
import com.inzira.shared.dtos.RouteDTO;
import com.inzira.shared.dtos.RoutePointDTO;

public class AgencyRouteMapper {
    public static AgencyRouteDTO toDTO(AgencyRoute agencyRoute) {
        AgencyRouteDTO dto = new AgencyRouteDTO();
        dto.setId(agencyRoute.getId());
        dto.setPrice(agencyRoute.getPrice());

         // Set minimal agency info
        AgencyDTO agencyDTO = new AgencyDTO();
        agencyDTO.setId(agencyRoute.getAgency().getId());
        agencyDTO.setAgencyName(agencyRoute.getAgency().getAgencyName());
        dto.setAgency(agencyDTO);

        // Set route
        RouteDTO routeDTO = new RouteDTO();
        routeDTO.setId(agencyRoute.getRoute().getId());

        DistrictDTO origin = new DistrictDTO();
        origin.setId(agencyRoute.getRoute().getOrigin().getId());
        origin.setName(agencyRoute.getRoute().getOrigin().getName());

        DistrictDTO dest = new DistrictDTO();
        dest.setId(agencyRoute.getRoute().getDestination().getId());
        dest.setName(agencyRoute.getRoute().getDestination().getName());

        routeDTO.setOrigin(origin);
        routeDTO.setDestination(dest);
        routeDTO.setDistanceKm(agencyRoute.getRoute().getDistanceKm());
        dto.setRoute(routeDTO);

    

    dto.setPickupPoints(agencyRoute.getPickupPoints().stream().map(p -> {
        RoutePointDTO pDTO = new RoutePointDTO();
        pDTO.setId(p.getId());
        pDTO.setName(p.getName());
        pDTO.setGpsLat(p.getGpsLat());
        pDTO.setGpsLong(p.getGpsLong());
        return pDTO;
    }).toList());

    dto.setDropPoints(agencyRoute.getDropPoints().stream().map(p -> {
        RoutePointDTO dDTO = new RoutePointDTO();
        dDTO.setId(p.getId());
        dDTO.setName(p.getName());
        dDTO.setGpsLat(p.getGpsLat());
        dDTO.setGpsLong(p.getGpsLong());
        return dDTO;
    }).toList());

    return dto;
}

}
