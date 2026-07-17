package com.finance.tracker.controller;

import com.finance.tracker.dto.BudgetStatusDTO;
import com.finance.tracker.dto.CategoryExpenseDTO;
import com.finance.tracker.dto.DashboardSummaryResponse;
import com.finance.tracker.dto.MonthlyTrendDTO;
import com.finance.tracker.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard Analytics", description = "Endpoints for retrieving aggregated dashboard data and trends")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    private int defaultMonth() {
        return LocalDate.now().getMonthValue();
    }

    private int defaultYear() {
        return LocalDate.now().getYear();
    }

    @GetMapping("/summary")
    @Operation(summary = "Get full dashboard summary details for a specific month and year")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        int m = month != null ? month : defaultMonth();
        int y = year != null ? year : defaultYear();
        return ResponseEntity.ok(dashboardService.getDashboardSummary(m, y));
    }

    @GetMapping("/category-expenses")
    @Operation(summary = "Get category-wise expense breakdown for a specific month and year")
    public ResponseEntity<List<CategoryExpenseDTO>> getCategoryExpenses(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        int m = month != null ? month : defaultMonth();
        int y = year != null ? year : defaultYear();
        return ResponseEntity.ok(dashboardService.getCategoryExpenses(m, y));
    }

    @GetMapping("/monthly-trends")
    @Operation(summary = "Get monthly income/expense trends for a specific year")
    public ResponseEntity<List<MonthlyTrendDTO>> getMonthlyTrends(
            @RequestParam(required = false) Integer year
    ) {
        int y = year != null ? year : defaultYear();
        return ResponseEntity.ok(dashboardService.getMonthlyTrends(y));
    }

    @GetMapping("/budget-status")
    @Operation(summary = "Get budget usage statuses for a specific month and year")
    public ResponseEntity<List<BudgetStatusDTO>> getBudgetStatus(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        int m = month != null ? month : defaultMonth();
        int y = year != null ? year : defaultYear();
        return ResponseEntity.ok(dashboardService.getBudgetStatus(m, y));
    }
}
