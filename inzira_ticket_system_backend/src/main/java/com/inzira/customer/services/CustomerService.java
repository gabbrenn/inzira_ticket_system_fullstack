package com.inzira.customer.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.inzira.shared.entities.Customer;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.CustomerRepository;
import com.inzira.shared.entities.User;
import com.inzira.shared.repositories.UserRepository;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    public Customer registerCustomer(Customer customer) {
        String originalPassword = customer.getPassword();
        
        // Check for duplicate email
        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new IllegalArgumentException("Customer with email " + customer.getEmail() + " already exists");
        }

        // Check for duplicate phone number
        if (customerRepository.existsByPhoneNumber(customer.getPhoneNumber())) {
            throw new IllegalArgumentException("Customer with phone number " + customer.getPhoneNumber() + " already exists");
        }

        // Encode password
        customer.setStatus("ACTIVE"); // Default status

        Customer savedCustomer = customerRepository.save(customer);

        // Create corresponding User entity for authentication
        User user = new User();
        user.setEmail(savedCustomer.getEmail());
        user.setPassword(passwordEncoder.encode(originalPassword));
        user.setFirstName(savedCustomer.getFirstName());
        user.setLastName(savedCustomer.getLastName());
        user.setPhoneNumber(savedCustomer.getPhoneNumber());
        user.setRole(User.UserRole.CUSTOMER);
        user.setStatus("ACTIVE");
        user.setRoleEntityId(savedCustomer.getId());
        userRepository.save(user);

        return savedCustomer;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
    }

    public Customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));
    }

    public Customer updateCustomer(Long id, Customer updatedCustomer) {
        Customer existingCustomer = customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        // Check for duplicate email (excluding current customer)
        if (!existingCustomer.getEmail().equals(updatedCustomer.getEmail()) &&
            customerRepository.existsByEmail(updatedCustomer.getEmail())) {
            throw new IllegalArgumentException("Customer with email " + updatedCustomer.getEmail() + " already exists");
        }

        // Check for duplicate phone number (excluding current customer)
        if (!existingCustomer.getPhoneNumber().equals(updatedCustomer.getPhoneNumber()) &&
            customerRepository.existsByPhoneNumber(updatedCustomer.getPhoneNumber())) {
            throw new IllegalArgumentException("Customer with phone number " + updatedCustomer.getPhoneNumber() + " already exists");
        }

        existingCustomer.setFirstName(updatedCustomer.getFirstName());
        existingCustomer.setLastName(updatedCustomer.getLastName());
        existingCustomer.setEmail(updatedCustomer.getEmail());
        existingCustomer.setPhoneNumber(updatedCustomer.getPhoneNumber());

        Customer savedCustomer = customerRepository.save(existingCustomer);

        // Update corresponding User entity
        userRepository.findByEmail(savedCustomer.getEmail()).ifPresent(user -> {
            user.setFirstName(savedCustomer.getFirstName());
            user.setLastName(savedCustomer.getLastName());
            user.setPhoneNumber(savedCustomer.getPhoneNumber());
            userRepository.save(user);
        });

        return savedCustomer;
    }

    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        // Delete corresponding User entity
        userRepository.findByEmail(customer.getEmail()).ifPresent(user -> {
            userRepository.delete(user);
        });

        customerRepository.deleteById(id);
    }
}