package com.finance.tracker.controller;

import com.finance.tracker.dto.BudgetRequest;
import com.finance.tracker.dto.BudgetResponse;
import com.finance.tracker.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@Tag(name = "Budgets", description = "Endpoints for managing monthly category budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Get budgets for a specific month and year")
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @RequestParam Integer month,
            @RequestParam Integer year
    ) {
        List<BudgetResponse> budgets = budgetService.getBudgets(month, year);
        return ResponseEntity.ok(budgets);
    }

    @PostMapping
    @Operation(summary = "Create a new monthly category budget")
    public ResponseEntity<BudgetResponse> createBudget(@Valid @RequestBody BudgetRequest request) {
        BudgetResponse budget = budgetService.createBudget(request);
        return new ResponseEntity<>(budget, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing monthly category budget")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request
    ) {
        BudgetResponse budget = budgetService.updateBudget(id, request);
        return ResponseEntity.ok(budget);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing monthly category budget")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
