package com.finance.tracker.service;

import com.finance.tracker.dto.BudgetRequest;
import com.finance.tracker.dto.BudgetResponse;
import com.finance.tracker.entity.Budget;
import com.finance.tracker.entity.Category;
import com.finance.tracker.entity.TransactionType;
import com.finance.tracker.entity.User;
import com.finance.tracker.exception.BadRequestException;
import com.finance.tracker.repository.BudgetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private CategoryService categoryService;

    @Mock
    private AuthService authService;

    @InjectMocks
    private BudgetService budgetService;

    private User user;
    private Category categoryFood;
    private Category categorySalary;
    private Budget budget;
    private BudgetRequest request;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("jane@example.com").name("Jane").build();
        
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

        budget = Budget.builder()
                .id(100L)
                .user(user)
                .category(categoryFood)
                .monthlyLimit(new BigDecimal("500.00"))
                .month(7)
                .year(2026)
                .createdAt(LocalDateTime.now())
                .build();

        request = new BudgetRequest();
        request.setCategoryId(10L);
        request.setMonthlyLimit(new BigDecimal("500.00"));
        request.setMonth(7);
        request.setYear(2026);
    }

    @Test
    void createBudget_success() {
        when(authService.getCurrentUser()).thenReturn(user);
        when(categoryService.getCategoryEntity(request.getCategoryId())).thenReturn(categoryFood);
        when(budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(user.getId(), 10L, 7, 2026)).thenReturn(Optional.empty());
        when(budgetRepository.save(any(Budget.class))).thenReturn(budget);

        BudgetResponse response = budgetService.createBudget(request);

        assertNotNull(response);
        assertEquals(budget.getMonthlyLimit(), response.getMonthlyLimit());
        assertEquals("Food", response.getCategory().getName());
        verify(budgetRepository, times(1)).save(any(Budget.class));
    }

    @Test
    void createBudget_forIncomeCategory_throwsBadRequestException() {
        when(authService.getCurrentUser()).thenReturn(user);
        when(categoryService.getCategoryEntity(request.getCategoryId())).thenReturn(categorySalary);

        assertThrows(BadRequestException.class, () -> budgetService.createBudget(request));
        verify(budgetRepository, never()).save(any(Budget.class));
    }

    @Test
    void createBudget_duplicateBudget_throwsBadRequestException() {
        when(authService.getCurrentUser()).thenReturn(user);
        when(categoryService.getCategoryEntity(request.getCategoryId())).thenReturn(categoryFood);
        when(budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(user.getId(), 10L, 7, 2026)).thenReturn(Optional.of(budget));

        assertThrows(BadRequestException.class, () -> budgetService.createBudget(request));
        verify(budgetRepository, never()).save(any(Budget.class));
    }
}
