package com.finance.tracker.repository;

import com.finance.tracker.entity.Transaction;
import com.finance.tracker.entity.TransactionType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TransactionSpecification {

    public static Specification<Transaction> getSpecification(
            Long userId,
            TransactionType type,
            String category,
            LocalDate startDate,
            LocalDate endDate,
            String search
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // User filter - essential for safety
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            // Type filter
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            // Category filter (by name or ID)
            if (category != null && !category.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("category").get("name")), category.trim().toLowerCase()));
            }

            // Date Range
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), endDate));
            }

            // Keyword Search (in description or category name)
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate descriptionLike = cb.like(cb.lower(root.get("description")), searchPattern);
                Predicate categoryLike = cb.like(cb.lower(root.get("category").get("name")), searchPattern);
                predicates.add(cb.or(descriptionLike, categoryLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
