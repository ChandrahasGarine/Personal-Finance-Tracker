package com.finance.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal currentBalance;
    private List<TransactionResponse> recentTransactions;
    private List<CategoryExpenseDTO> categoryExpenses;
    private List<MonthlyTrendDTO> monthlyTrends;
    private BigDecimal budgetUsagePercentage;
    private BigDecimal remainingBudget;
    private List<BudgetStatusDTO> overBudgetCategories;
}
