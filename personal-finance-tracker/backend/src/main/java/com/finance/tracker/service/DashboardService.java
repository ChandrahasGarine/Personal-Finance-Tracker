package com.finance.tracker.service;

import com.finance.tracker.dto.*;
import com.finance.tracker.entity.*;
import com.finance.tracker.mapper.EntityMapper;
import com.finance.tracker.repository.BudgetRepository;
import com.finance.tracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(Integer month, Integer year) {
        User currentUser = authService.getCurrentUser();
        Long userId = currentUser.getId();

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());

        // 1. Fetch transactions for the month
        List<Transaction> monthlyTransactions = transactionRepository.findByUserIdAndTransactionDateBetween(userId, startDate, endDate);

        // 2. Calculate Total Income and Expense for the month
        BigDecimal totalIncome = monthlyTransactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = monthlyTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Lifetime Balance
        BigDecimal lifetimeIncome = transactionRepository.sumAmountByUserIdAndType(userId, TransactionType.INCOME);
        BigDecimal lifetimeExpense = transactionRepository.sumAmountByUserIdAndType(userId, TransactionType.EXPENSE);
        BigDecimal currentBalance = lifetimeIncome.subtract(lifetimeExpense);

        // 4. Recent transactions (last 5)
        List<TransactionResponse> recentTransactions = transactionRepository.findRecentTransactions(userId, PageRequest.of(0, 5))
                .stream()
                .map(EntityMapper::toTransactionResponse)
                .collect(Collectors.toList());

        // 5. Category expenses
        List<CategoryExpenseDTO> categoryExpenses = getCategoryExpensesList(monthlyTransactions, totalExpense);

        // 6. Monthly trends (for the specified year)
        List<MonthlyTrendDTO> monthlyTrends = getMonthlyTrendsList(userId, year);

        // 7. Budget calculations
        List<BudgetStatusDTO> budgetStatuses = getBudgetStatusesList(userId, month, year);

        BigDecimal totalBudgetLimit = budgetStatuses.stream()
                .map(BudgetStatusDTO::getLimit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpentInBudgetedCategories = budgetStatuses.stream()
                .map(BudgetStatusDTO::getSpent)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingBudget = totalBudgetLimit.subtract(totalSpentInBudgetedCategories);
        if (remainingBudget.compareTo(BigDecimal.ZERO) < 0) {
            remainingBudget = BigDecimal.ZERO;
        }

        BigDecimal budgetUsagePercentage = BigDecimal.ZERO;
        if (totalBudgetLimit.compareTo(BigDecimal.ZERO) > 0) {
            budgetUsagePercentage = totalSpentInBudgetedCategories
                    .multiply(new BigDecimal(100))
                    .divide(totalBudgetLimit, 2, RoundingMode.HALF_UP);
        }

        List<BudgetStatusDTO> overBudgetCategories = budgetStatuses.stream()
                .filter(BudgetStatusDTO::isOverBudget)
                .collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .currentBalance(currentBalance)
                .recentTransactions(recentTransactions)
                .categoryExpenses(categoryExpenses)
                .monthlyTrends(monthlyTrends)
                .budgetUsagePercentage(budgetUsagePercentage)
                .remainingBudget(remainingBudget)
                .overBudgetCategories(overBudgetCategories)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CategoryExpenseDTO> getCategoryExpenses(Integer month, Integer year) {
        User currentUser = authService.getCurrentUser();
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());

        List<Transaction> monthlyTransactions = transactionRepository.findByUserIdAndTransactionDateBetween(currentUser.getId(), startDate, endDate);
        BigDecimal totalExpense = monthlyTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return getCategoryExpensesList(monthlyTransactions, totalExpense);
    }

    @Transactional(readOnly = true)
    public List<MonthlyTrendDTO> getMonthlyTrends(Integer year) {
        User currentUser = authService.getCurrentUser();
        return getMonthlyTrendsList(currentUser.getId(), year);
    }

    @Transactional(readOnly = true)
    public List<BudgetStatusDTO> getBudgetStatus(Integer month, Integer year) {
        User currentUser = authService.getCurrentUser();
        return getBudgetStatusesList(currentUser.getId(), month, year);
    }

    // Helper Methods for calculations
    private List<CategoryExpenseDTO> getCategoryExpensesList(List<Transaction> transactions, BigDecimal totalExpense) {
        List<Transaction> expenseTransactions = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.toList());

        Map<Category, BigDecimal> categoryAmountMap = expenseTransactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        return categoryAmountMap.entrySet().stream()
                .map(entry -> {
                    Category cat = entry.getKey();
                    BigDecimal amount = entry.getValue();
                    BigDecimal percentage = BigDecimal.ZERO;
                    if (totalExpense.compareTo(BigDecimal.ZERO) > 0) {
                        percentage = amount.multiply(new BigDecimal(100)).divide(totalExpense, 2, RoundingMode.HALF_UP);
                    }

                    return CategoryExpenseDTO.builder()
                            .categoryName(cat.getName())
                            .amount(amount)
                            .color(cat.getColor())
                            .icon(cat.getIcon())
                            .percentage(percentage)
                            .build();
                })
                .sorted(Comparator.comparing(CategoryExpenseDTO::getAmount).reversed())
                .collect(Collectors.toList());
    }

    private List<MonthlyTrendDTO> getMonthlyTrendsList(Long userId, Integer year) {
        LocalDate startOfYear = LocalDate.of(year, 1, 1);
        LocalDate endOfYear = LocalDate.of(year, 12, 31);

        List<Transaction> yearlyTransactions = transactionRepository.findByUserIdAndTransactionDateBetween(userId, startOfYear, endOfYear);

        List<MonthlyTrendDTO> trends = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            final int monthVal = m;
            List<Transaction> monthTransactions = yearlyTransactions.stream()
                    .filter(t -> t.getTransactionDate().getMonthValue() == monthVal)
                    .collect(Collectors.toList());

            BigDecimal income = monthTransactions.stream()
                    .filter(t -> t.getType() == TransactionType.INCOME)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal expense = monthTransactions.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String monthName = LocalDate.of(year, m, 1).getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            trends.add(MonthlyTrendDTO.builder()
                    .monthName(monthName)
                    .income(income)
                    .expense(expense)
                    .build());
        }

        return trends;
    }

    private List<BudgetStatusDTO> getBudgetStatusesList(Long userId, Integer month, Integer year) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());

        List<Transaction> monthlyTransactions = transactionRepository.findByUserIdAndTransactionDateBetween(userId, startDate, endDate);

        List<Transaction> expenses = monthlyTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.toList());

        return budgets.stream()
                .map(budget -> {
                    Category category = budget.getCategory();
                    BigDecimal limit = budget.getMonthlyLimit();

                    BigDecimal spent = expenses.stream()
                            .filter(t -> t.getCategory().getId().equals(category.getId()))
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal remaining = limit.subtract(spent);
                    BigDecimal percentageUsed = BigDecimal.ZERO;
                    if (limit.compareTo(BigDecimal.ZERO) > 0) {
                        percentageUsed = spent.multiply(new BigDecimal(100)).divide(limit, 2, RoundingMode.HALF_UP);
                    }

                    boolean overBudget = spent.compareTo(limit) > 0;

                    return BudgetStatusDTO.builder()
                            .id(budget.getId())
                            .categoryName(category.getName())
                            .color(category.getColor())
                            .icon(category.getIcon())
                            .limit(limit)
                            .spent(spent)
                            .remaining(remaining.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remaining)
                            .percentageUsed(percentageUsed)
                            .overBudget(overBudget)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
