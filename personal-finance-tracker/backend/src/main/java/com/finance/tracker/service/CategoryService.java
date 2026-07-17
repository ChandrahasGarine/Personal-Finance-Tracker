package com.finance.tracker.service;

import com.finance.tracker.dto.CategoryRequest;
import com.finance.tracker.dto.CategoryResponse;
import com.finance.tracker.entity.Category;
import com.finance.tracker.entity.User;
import com.finance.tracker.exception.BadRequestException;
import com.finance.tracker.exception.ResourceNotFoundException;
import com.finance.tracker.mapper.EntityMapper;
import com.finance.tracker.repository.BudgetRepository;
import com.finance.tracker.repository.CategoryRepository;
import com.finance.tracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        User currentUser = authService.getCurrentUser();
        return categoryRepository.findByUserId(currentUser.getId())
                .stream()
                .map(EntityMapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Category getCategoryEntity(Long id) {
        User currentUser = authService.getCurrentUser();
        return categoryRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        User currentUser = authService.getCurrentUser();

        if (categoryRepository.existsByUserIdAndNameAndType(currentUser.getId(), request.getName(), request.getType())) {
            throw new BadRequestException("Category with name '" + request.getName() + "' and type '" + request.getType() + "' already exists.");
        }

        Category category = Category.builder()
                .user(currentUser)
                .name(request.getName())
                .type(request.getType())
                .color(request.getColor() != null ? request.getColor() : "#9CA3AF")
                .icon(request.getIcon() != null ? request.getIcon() : "Folder")
                .build();

        Category savedCategory = categoryRepository.save(category);
        return EntityMapper.toCategoryResponse(savedCategory);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        User currentUser = authService.getCurrentUser();
        Category category = categoryRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        if (categoryRepository.existsByUserIdAndNameAndTypeAndIdNot(currentUser.getId(), request.getName(), request.getType(), id)) {
            throw new BadRequestException("Another category with name '" + request.getName() + "' and type '" + request.getType() + "' already exists.");
        }

        // If category type is changing, check if there are transactions of the old type
        if (category.getType() != request.getType()) {
            if (transactionRepository.existsByCategoryId(id)) {
                throw new BadRequestException("Cannot change category type because it is already used in transactions.");
            }
        }

        category.setName(request.getName());
        category.setType(request.getType());
        category.setColor(request.getColor() != null ? request.getColor() : "#9CA3AF");
        category.setIcon(request.getIcon() != null ? request.getIcon() : "Folder");

        Category updatedCategory = categoryRepository.save(category);
        return EntityMapper.toCategoryResponse(updatedCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        User currentUser = authService.getCurrentUser();
        Category category = categoryRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        // Prevent deletion if used in transactions
        if (transactionRepository.existsByCategoryId(id)) {
            throw new BadRequestException("Cannot delete category as it is currently associated with transactions. Please delete the transactions first.");
        }

        // Prevent deletion if used in budgets
        if (budgetRepository.existsByCategoryId(id)) {
            throw new BadRequestException("Cannot delete category as it is currently associated with budgets. Please delete the budgets first.");
        }

        categoryRepository.delete(category);
    }
}
