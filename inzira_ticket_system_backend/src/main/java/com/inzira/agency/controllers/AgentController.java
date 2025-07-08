package com.inzira.agency.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.agency.entities.Agent;
import com.inzira.agency.services.AgentService;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/agency/agents")
public class AgentController {

    @Autowired
    private AgentService agentService;

    @PostMapping
    public ResponseEntity<ApiResponse<Agent>> createAgent(@RequestBody Agent agent) {
        Agent createdAgent = agentService.createAgent(agent);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Agent created successfully", createdAgent));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Agent>>> getAllAgents() {
        List<Agent> agents = agentService.getAllAgents();
        String message = agents.isEmpty() ? "No agents found" : "Agents retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, agents));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Agent>> getAgentById(@PathVariable Long id) {
        Agent agent = agentService.getAgentById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agent found", agent));
    }

    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<ApiResponse<List<Agent>>> getAgentsByAgency(@PathVariable Long agencyId) {
        List<Agent> agents = agentService.getAgentsByAgency(agencyId);
        String message = agents.isEmpty() ? "No agents found for this agency" : "Agency agents retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, agents));
    }

    @GetMapping("/branch-office/{branchOfficeId}")
    public ResponseEntity<ApiResponse<List<Agent>>> getAgentsByBranchOffice(@PathVariable Long branchOfficeId) {
        List<Agent> agents = agentService.getAgentsByBranchOffice(branchOfficeId);
        String message = agents.isEmpty() ? "No agents found for this branch office" : "Branch office agents retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, agents));
    }

    @GetMapping("/agency/{agencyId}/active")
    public ResponseEntity<ApiResponse<List<Agent>>> getActiveAgentsByAgency(@PathVariable Long agencyId) {
        List<Agent> agents = agentService.getActiveAgentsByAgency(agencyId);
        String message = agents.isEmpty() ? "No active agents found for this agency" : "Active agency agents retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, agents));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Agent>> updateAgent(@PathVariable Long id, @RequestBody Agent agent) {
        Agent updatedAgent = agentService.updateAgent(id, agent);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agent updated successfully", updatedAgent));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@PathVariable Long id) {
        String newPassword = agentService.resetPassword(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully", newPassword));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agent deleted successfully"));
    }
}