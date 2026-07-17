package com.finance.tracker.service;

import com.finance.tracker.dto.BudgetRequest;
import com.finance.tracker.dto.BudgetResponse;
import com.finance.tracker.entity.Budget;
import com.finance.tracker.entity.Category;
import com.finance.tracker.entity.TransactionType;
import com.finance.tracker.entity.User;
import com.finance.tracker.exception.BadRequestException;
import com.finance.tracker.exception.ResourceNotFoundException;
import com.finance.tracker.mapper.EntityMapper;
import com.finance.tracker.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(Integer month, Integer year) {
        User currentUser = authService.getCurrentUser();
        return budgetRepository.findByUserIdAndMonthAndYear(currentUser.getId(), month, year)
                .stream()
                .map(EntityMapper::toBudgetResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse createBudget(BudgetRequest request) {
        User currentUser = authService.getCurrentUser();
        Category category = categoryService.getCategoryEntity(request.getCategoryId());

        // Enforce budgets can only be for EXPENSE categories
        if (category.getType() != TransactionType.EXPENSE) {
            throw new BadRequestException("Budgets can only be set for EXPENSE categories.");
        }

        // Check for existing budget for category, month, and year
        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                currentUser.getId(), request.getCategoryId(), request.getMonth(), request.getYear()
        );
        if (existingBudget.isPresent()) {
            throw new BadRequestException("A budget for category '" + category.getName() + 
                    "' already exists for " + request.getMonth() + "/" + request.getYear() + 
                    ". Please update the existing budget instead.");
        }

        Budget budget = Budget.builder()
                .user(currentUser)
                .category(category)
                .monthlyLimit(request.getMonthlyLimit())
                .month(request.getMonth())
                .year(request.getYear())
                .build();

        Budget savedBudget = budgetRepository.save(budget);
        return EntityMapper.toBudgetResponse(savedBudget);
    }

    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        User currentUser = authService.getCurrentUser();
        Budget budget = budgetRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with ID: " + id));

        Category category = categoryService.getCategoryEntity(request.getCategoryId());

        // Enforce budgets can only be for EXPENSE categories
        if (category.getType() != TransactionType.EXPENSE) {
            throw new BadRequestException("Budgets can only be set for EXPENSE categories.");
        }

        // Check for duplicates if category, month, or year changed
        if (!budget.getCategory().getId().equals(request.getCategoryId()) || 
                !budget.getMonth().equals(request.getMonth()) || 
                !budget.getYear().equals(request.getYear())) {
            
            Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                    currentUser.getId(), request.getCategoryId(), request.getMonth(), request.getYear()
            );
            if (existingBudget.isPresent()) {
                throw new BadRequestException("A budget for category '" + category.getName() + 
                        "' already exists for " + request.getMonth() + "/" + request.getYear() + ".");
            }
        }

        budget.setCategory(category);
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());

        Budget updatedBudget = budgetRepository.save(budget);
        return EntityMapper.toBudgetResponse(updatedBudget);
    }

    @Transactional
    public void deleteBudget(Long id) {
        User currentUser = authService.getCurrentUser();
        Budget budget = budgetRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with ID: " + id));

        budgetRepository.delete(budget);
    }
}
