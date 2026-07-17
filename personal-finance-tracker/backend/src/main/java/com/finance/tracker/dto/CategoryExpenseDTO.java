package com.finance.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryExpenseDTO {
    private String categoryName;
    private BigDecimal amount;
    private String color;
    private String icon;
    private BigDecimal percentage;
}
