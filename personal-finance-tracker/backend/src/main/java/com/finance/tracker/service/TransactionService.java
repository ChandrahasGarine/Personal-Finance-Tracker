package com.finance.tracker.service;

import com.finance.tracker.dto.TransactionRequest;
import com.finance.tracker.dto.TransactionResponse;
import com.finance.tracker.entity.Category;
import com.finance.tracker.entity.Transaction;
import com.finance.tracker.entity.TransactionType;
import com.finance.tracker.entity.User;
import com.finance.tracker.exception.BadRequestException;
import com.finance.tracker.exception.ResourceNotFoundException;
import com.finance.tracker.mapper.EntityMapper;
import com.finance.tracker.repository.TransactionRepository;
import com.finance.tracker.repository.TransactionSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(
            TransactionType type,
            String category,
            LocalDate startDate,
            LocalDate endDate,
            String search,
            Pageable pageable
    ) {
        User currentUser = authService.getCurrentUser();
        Specification<Transaction> spec = TransactionSpecification.getSpecification(
                currentUser.getId(), type, category, startDate, endDate, search
        );

        return transactionRepository.findAll(spec, pageable)
                .map(EntityMapper::toTransactionResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id) {
        User currentUser = authService.getCurrentUser();
        Transaction transaction = transactionRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));
        return EntityMapper.toTransactionResponse(transaction);
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        User currentUser = authService.getCurrentUser();
        Category category = categoryService.getCategoryEntity(request.getCategoryId());

        // Validate that category type matches transaction type
        if (category.getType() != request.getType()) {
            throw new BadRequestException("Transaction type (" + request.getType() + 
                    ") must match category type (" + category.getType() + ").");
        }

        Transaction transaction = Transaction.builder()
                .user(currentUser)
                .type(request.getType())
                .category(category)
                .amount(request.getAmount())
                .description(request.getDescription())
                .transactionDate(request.getTransactionDate())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        return EntityMapper.toTransactionResponse(savedTransaction);
    }

    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        User currentUser = authService.getCurrentUser();
        Transaction transaction = transactionRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        Category category = categoryService.getCategoryEntity(request.getCategoryId());

        // Validate category type matches transaction type
        if (category.getType() != request.getType()) {
            throw new BadRequestException("Transaction type (" + request.getType() + 
                    ") must match category type (" + category.getType() + ").");
        }

        transaction.setType(request.getType());
        transaction.setCategory(category);
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(request.getTransactionDate());

        Transaction updatedTransaction = transactionRepository.save(transaction);
        return EntityMapper.toTransactionResponse(updatedTransaction);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        User currentUser = authService.getCurrentUser();
        Transaction transaction = transactionRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        transactionRepository.delete(transaction);
    }
}
