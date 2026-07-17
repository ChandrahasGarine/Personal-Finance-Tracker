package com.finance.tracker.mapper;

import com.finance.tracker.dto.BudgetResponse;
import com.finance.tracker.dto.CategoryResponse;
import com.finance.tracker.dto.TransactionResponse;
import com.finance.tracker.dto.UserDTO;
import com.finance.tracker.entity.Budget;
import com.finance.tracker.entity.Category;
import com.finance.tracker.entity.Transaction;
import com.finance.tracker.entity.User;

public class EntityMapper {

    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .color(category.getColor())
                .icon(category.getIcon())
                .build();
    }

    public static TransactionResponse toTransactionResponse(Transaction transaction) {
        if (transaction == null) return null;
        return TransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .category(toCategoryResponse(transaction.getCategory()))
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .transactionDate(transaction.getTransactionDate())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }

    public static BudgetResponse toBudgetResponse(Budget budget) {
        if (budget == null) return null;
        return BudgetResponse.builder()
                .id(budget.getId())
                .category(toCategoryResponse(budget.getCategory()))
                .monthlyLimit(budget.getMonthlyLimit())
                .month(budget.getMonth())
                .year(budget.getYear())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}
