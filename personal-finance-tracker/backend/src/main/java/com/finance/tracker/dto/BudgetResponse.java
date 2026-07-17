package com.finance.tracker.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BudgetResponse {
    private Long id;
    private CategoryResponse category;
    private BigDecimal monthlyLimit;
    private Integer month;
    private Integer year;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
