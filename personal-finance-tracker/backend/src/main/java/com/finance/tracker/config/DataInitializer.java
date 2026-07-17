package com.finance.tracker.config;

import com.finance.tracker.entity.*;
import com.finance.tracker.repository.BudgetRepository;
import com.finance.tracker.repository.CategoryRepository;
import com.finance.tracker.repository.TransactionRepository;
import com.finance.tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // 1. Create Demo User
            User user = User.builder()
                    .name("Jane Doe")
                    .email("jane.doe@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .build();
            user = userRepository.save(user);

            // 2. Create Default Categories
            Map<String, Category> categories = new HashMap<>();
            
            // Income categories
            categories.put("Salary", categoryRepository.save(Category.builder()
                    .user(user)
                    .name("Salary")
                    .type(TransactionType.INCOME)
                    .color("#10B981") // Green
                    .icon("Briefcase")
                    .build()));
                    
            categories.put("Freelance", categoryRepository.save(Category.builder()
                    .user(user)
                    .name("Freelance")
                    .type(TransactionType.INCOME)
                    .color("#06B6D4") // Cyan
                    .icon("Globe")
                    .build()));

            // Expense categories
            categories.put("Food", categoryRepository.save(Category.builder()
                    .user(user)
                    .name("Food")
                    .type(TransactionType.EXPENSE)
                    .color("#EF4444") // Red
                    .icon("Utensils")
                    .build()));
                    
            categories.put("Rent", categoryRepository.save(Category.builder()
                    .user(user)
                    .name("Rent")
                    .type(TransactionType.EXPENSE)
                    .color("#3B82F6") // Blue
                    .icon("Home")
                    .build()));
                    
            categories.put("Utilities", categoryRepository.save(Category.builder()
                    .user(user)
                    .name("Utilities")
                    .type(TransactionType.EXPENSE)
                    .color("#F59E0B") // Yellow/Amber
                    .icon("Zap")
                    .build()));
                    
            categories.put("Entertainment", categoryRepository.save(Category.builder()
                    .user(user)
                    .name("Entertainment")
                    .type(TransactionType.EXPENSE)
                    .color("#8B5CF6") // Purple
                    .icon("Film")
                    .build()));
                    
            categories.put("Transport", categoryRepository.save(Category.builder()
                    .user(user)
                    .name("Transport")
                    .type(TransactionType.EXPENSE)
                    .color("#EC4899") // Pink
                    .icon("Car")
                    .build()));

            // 3. Create Budgets for Current Month
            LocalDate today = LocalDate.now();
            int currentMonth = today.getMonthValue();
            int currentYear = today.getYear();

            budgetRepository.save(Budget.builder()
                    .user(user)
                    .category(categories.get("Food"))
                    .monthlyLimit(new BigDecimal("400.00"))
                    .month(currentMonth)
                    .year(currentYear)
                    .build());

            budgetRepository.save(Budget.builder()
                    .user(user)
                    .category(categories.get("Rent"))
                    .monthlyLimit(new BigDecimal("1500.00"))
                    .month(currentMonth)
                    .year(currentYear)
                    .build());

            budgetRepository.save(Budget.builder()
                    .user(user)
                    .category(categories.get("Utilities"))
                    .monthlyLimit(new BigDecimal("150.00"))
                    .month(currentMonth)
                    .year(currentYear)
                    .build());

            budgetRepository.save(Budget.builder()
                    .user(user)
                    .category(categories.get("Entertainment"))
                    .monthlyLimit(new BigDecimal("200.00"))
                    .month(currentMonth)
                    .year(currentYear)
                    .build());

            // 4. Create Seed Transactions
            List<Transaction> seedTransactions = new ArrayList<>();

            // Income
            seedTransactions.add(Transaction.builder()
                    .user(user)
                    .type(TransactionType.INCOME)
                    .category(categories.get("Salary"))
                    .amount(new BigDecimal("5000.00"))
                    .description("Monthly Salary")
                    .transactionDate(LocalDate.of(currentYear, currentMonth, 1))
                    .build());

            seedTransactions.add(Transaction.builder()
                    .user(user)
                    .type(TransactionType.INCOME)
                    .category(categories.get("Freelance"))
                    .amount(new BigDecimal("1200.00"))
                    .description("Web development project contract payment")
                    .transactionDate(LocalDate.of(currentYear, currentMonth, 8))
                    .build());

            // Expenses
            seedTransactions.add(Transaction.builder()
                    .user(user)
                    .type(TransactionType.EXPENSE)
                    .category(categories.get("Rent"))
                    .amount(new BigDecimal("1500.00"))
                    .description("Apartment rent")
                    .transactionDate(LocalDate.of(currentYear, currentMonth, 1))
                    .build());

            seedTransactions.add(Transaction.builder()
                    .user(user)
                    .type(TransactionType.EXPENSE)
                    .category(categories.get("Food"))
                    .amount(new BigDecimal("124.50"))
                    .description("Weekly grocery run at supermarket")
                    .transactionDate(LocalDate.of(currentYear, currentMonth, 3))
                    .build());

            seedTransactions.add(Transaction.builder()
                    .user(user)
                    .type(TransactionType.EXPENSE)
                    .category(categories.get("Utilities"))
                    .amount(new BigDecimal("85.20"))
                    .description("Electricity and Water bill")
                    .transactionDate(LocalDate.of(currentYear, currentMonth, 5))
                    .build());

            seedTransactions.add(Transaction.builder()
                    .user(user)
                    .type(TransactionType.EXPENSE)
                    .category(categories.get("Entertainment"))
                    .amount(new BigDecimal("45.00"))
                    .description("Movie night out and popcorn")
                    .transactionDate(LocalDate.of(currentYear, currentMonth, 7))
                    .build());

            seedTransactions.add(Transaction.builder()
                    .user(user)
                    .type(TransactionType.EXPENSE)
                    .category(categories.get("Food"))
                    .amount(new BigDecimal("68.00"))
                    .description("Dinner at Italian restaurant")
                    .transactionDate(LocalDate.of(currentYear, currentMonth, 10))
                    .build());

            seedTransactions.add(Transaction.builder()
                    .user(user)
                    .type(TransactionType.EXPENSE)
                    .category(categories.get("Transport"))
                    .amount(new BigDecimal("45.00"))
                    .description("Monthly transit pass")
                    .transactionDate(LocalDate.of(currentYear, currentMonth, 4))
                    .build());

            transactionRepository.saveAll(seedTransactions);
        }
    }
}
