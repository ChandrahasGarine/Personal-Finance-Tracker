package com.finance.tracker.dto;

import com.finance.tracker.entity.TransactionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private TransactionType type;
    private String color;
    private String icon;
}
