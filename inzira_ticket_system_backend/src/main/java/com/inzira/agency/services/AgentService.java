package com.inzira.agency.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.inzira.agency.entities.Agency;
import com.inzira.agency.entities.Agent;
import com.inzira.agency.entities.BranchOffice;
import com.inzira.agency.repositories.AgencyRepository;
import com.inzira.agency.repositories.AgentRepository;
import com.inzira.agency.repositories.BranchOfficeRepository;
import com.inzira.shared.entities.User;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.UserRepository;
import com.inzira.shared.utils.PasswordUtility;

@Service
public class AgentService {

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private BranchOfficeRepository branchOfficeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordUtility passwordUtility;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public Agent createAgent(Agent agent) {
        // Validate agency exists
        Agency agency = agencyRepository.findById(agent.getAgency().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Agency not found"));

        // Validate branch office exists and belongs to the agency
        BranchOffice branchOffice = branchOfficeRepository.findById(agent.getBranchOffice().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Branch office not found"));

        if (!branchOffice.getAgency().getId().equals(agency.getId())) {
            throw new IllegalArgumentException("Branch office does not belong to the specified agency");
        }

        // Check for duplicate email
        if (agentRepository.existsByEmail(agent.getEmail())) {
            throw new IllegalArgumentException("Agent with email " + agent.getEmail() + " already exists");
        }

        if (userRepository.existsByEmail(agent.getEmail())) {
            throw new IllegalArgumentException("User with email " + agent.getEmail() + " already exists");
        }

        // Generate initial password
        String rawPassword = passwordUtility.generateInitialPassword(agent.getFirstName(), agent.getPhoneNumber());
        agent.setPassword(passwordEncoder.encode(rawPassword));

        agent.setAgency(agency);
        agent.setBranchOffice(branchOffice);
        agent.setStatus("ACTIVE"); // Default status
        
        Agent savedAgent = agentRepository.save(agent);

        // Create corresponding User entity for authentication
        User user = new User();
        user.setEmail(savedAgent.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setFirstName(savedAgent.getFirstName());
        user.setLastName(savedAgent.getLastName());
        user.setPhoneNumber(savedAgent.getPhoneNumber());
        user.setRole(User.UserRole.AGENCY); // Agents use AGENCY role but with limited permissions
        user.setStatus("ACTIVE");
        user.setRoleEntityId(savedAgent.getId());
        userRepository.save(user);

        return savedAgent;
    }

    public List<Agent> getAllAgents() {
        return agentRepository.findAll();
    }

    public Agent getAgentById(Long id) {
        return agentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + id));
    }

    public List<Agent> getAgentsByAgency(Long agencyId) {
        return agentRepository.findByAgencyId(agencyId);
    }

    public List<Agent> getAgentsByBranchOffice(Long branchOfficeId) {
        return agentRepository.findByBranchOfficeId(branchOfficeId);
    }

    public List<Agent> getActiveAgentsByAgency(Long agencyId) {
        return agentRepository.findByAgencyIdAndStatus(agencyId, "ACTIVE");
    }

    public Agent updateAgent(Long id, Agent updatedAgent) {
        Agent existingAgent = agentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + id));

        // Check for duplicate email (excluding current agent)
        if (!existingAgent.getEmail().equals(updatedAgent.getEmail()) &&
            agentRepository.existsByEmail(updatedAgent.getEmail())) {
            throw new IllegalArgumentException("Agent with email " + updatedAgent.getEmail() + " already exists");
        }

        existingAgent.setFirstName(updatedAgent.getFirstName());
        existingAgent.setLastName(updatedAgent.getLastName());
        existingAgent.setEmail(updatedAgent.getEmail());
        existingAgent.setPhoneNumber(updatedAgent.getPhoneNumber());
        existingAgent.setStatus(updatedAgent.getStatus());

        // Update branch office if provided
        if (updatedAgent.getBranchOffice() != null) {
            BranchOffice branchOffice = branchOfficeRepository.findById(updatedAgent.getBranchOffice().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch office not found"));
            
            if (!branchOffice.getAgency().getId().equals(existingAgent.getAgency().getId())) {
                throw new IllegalArgumentException("Branch office does not belong to the agent's agency");
            }
            
            existingAgent.setBranchOffice(branchOffice);
        }

        Agent savedAgent = agentRepository.save(existingAgent);

        // Update corresponding User entity
        userRepository.findByEmail(savedAgent.getEmail()).ifPresent(user -> {
            user.setFirstName(savedAgent.getFirstName());
            user.setLastName(savedAgent.getLastName());
            user.setPhoneNumber(savedAgent.getPhoneNumber());
            user.setStatus(savedAgent.getStatus());
            userRepository.save(user);
        });

        return savedAgent;
    }

    public String resetPassword(Long agentId) {
        Agent agent = agentRepository.findById(agentId)
            .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        String newPassword = passwordUtility.generateInitialPassword(agent.getFirstName(), agent.getPhoneNumber());
        agent.setPassword(passwordEncoder.encode(newPassword));

        agentRepository.save(agent);

        // Also update the User entity
        userRepository.findByEmail(agent.getEmail()).ifPresent(user -> {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        });

        return newPassword;
    }

    public void deleteAgent(Long id) {
        Agent agent = agentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + id));

        // Delete corresponding User entity
        userRepository.findByEmail(agent.getEmail()).ifPresent(user -> {
            userRepository.delete(user);
        });

        agentRepository.deleteById(id);
    }
}