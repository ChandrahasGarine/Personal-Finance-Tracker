package com.finance.tracker.service;

import com.finance.tracker.dto.TransactionRequest;
import com.finance.tracker.dto.TransactionResponse;
import com.finance.tracker.entity.Category;
import com.finance.tracker.entity.Transaction;
import com.finance.tracker.entity.TransactionType;
import com.finance.tracker.entity.User;
import com.finance.tracker.exception.BadRequestException;
import com.finance.tracker.exception.ResourceNotFoundException;
import com.finance.tracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryService categoryService;

    @Mock
    private AuthService authService;

    @InjectMocks
    private TransactionService transactionService;

    private User user;
    private Category categoryFood;
    private Category categorySalary;
    private Transaction transaction;
    private TransactionRequest request;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("jane.doe@example.com").name("Jane").build();
        
        categoryFood = Category.builder()
                .id(10L)
                .name("Food")
                .type(TransactionType.EXPENSE)
                .user(user)
                .build();
                
        categorySalary = Category.builder()
                .id(11L)
                .name("Salary")
                .type(TransactionType.INCOME)
                .user(user)
                .build();

        transaction = Transaction.builder()
                .id(100L)
                .user(user)
                .type(TransactionType.EXPENSE)
                .category(categoryFood)
                .amount(new BigDecimal("15.50"))
                .transactionDate(LocalDate.now())
                .description("Grocery")
                .build();

        request = new TransactionRequest();
        request.setAmount(new BigDecimal("15.50"));
        request.setCategoryId(10L);
        request.setType(TransactionType.EXPENSE);
        request.setTransactionDate(LocalDate.now());
        request.setDescription("Grocery");
    }

    @Test
    void createTransaction_success() {
        when(authService.getCurrentUser()).thenReturn(user);
        when(categoryService.getCategoryEntity(request.getCategoryId())).thenReturn(categoryFood);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);

        TransactionResponse response = transactionService.createTransaction(request);

        assertNotNull(response);
        assertEquals(transaction.getAmount(), response.getAmount());
        assertEquals("Food", response.getCategory().getName());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void createTransaction_typeMismatch_throwsBadRequestException() {
        request.setType(TransactionType.INCOME); // Income transaction, but Category is EXPENSE (categoryFood)
        when(authService.getCurrentUser()).thenReturn(user);
        when(categoryService.getCategoryEntity(request.getCategoryId())).thenReturn(categoryFood);

        assertThrows(BadRequestException.class, () -> transactionService.createTransaction(request));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void getTransactionById_unauthorizedOrNotFound_throwsResourceNotFound() {
        // Mock that transaction doesn't belong to user, or doesn't exist
        when(authService.getCurrentUser()).thenReturn(user);
        when(transactionRepository.findByIdAndUserId(999L, user.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> transactionService.getTransactionById(999L));
    }
}
