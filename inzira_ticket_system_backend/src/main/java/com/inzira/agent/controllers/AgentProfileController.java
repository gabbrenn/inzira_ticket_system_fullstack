package com.inzira.agent.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.agency.entities.Agent;
import com.inzira.agency.services.AgentService;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/agent")
public class AgentProfileController {

    @Autowired
    private AgentService agentService;

    @GetMapping("/profile/{agentId}")
    public ResponseEntity<ApiResponse<Agent>> getAgentProfile(@PathVariable Long agentId) {
        Agent agent = agentService.getAgentById(agentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agent profile retrieved", agent));
    }

    @PutMapping("/profile/{agentId}")
    public ResponseEntity<ApiResponse<Agent>> updateAgentProfile(@PathVariable Long agentId, @RequestBody Agent agent) {
        Agent updatedAgent = agentService.updateAgent(agentId, agent);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agent profile updated successfully", updatedAgent));
    }
}