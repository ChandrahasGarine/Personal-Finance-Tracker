package com.finance.tracker.service;

import com.finance.tracker.entity.Category;
import com.finance.tracker.entity.Transaction;
import com.finance.tracker.entity.TransactionType;
import com.finance.tracker.entity.User;
import com.finance.tracker.repository.TransactionRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public String generateMonthlyCSV(Integer month, Integer year) {
        User currentUser = authService.getCurrentUser();
        Long userId = currentUser.getId();

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());

        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetween(userId, startDate, endDate);
        transactions.sort(Comparator.comparing(Transaction::getTransactionDate).reversed());

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal closingBalance = totalIncome.subtract(totalExpense);

        StringBuilder csv = new StringBuilder();

        // 1. Report Metadata
        csv.append("Personal Finance Report\n");
        csv.append("User Name,").append(escapeCSV(currentUser.getName())).append("\n");
        csv.append("Period,").append(LocalDate.of(year, month, 1).getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH)).append(" ").append(year).append("\n");
        csv.append("Generated On,").append(LocalDate.now().toString()).append("\n\n");

        // 2. Financial Summary
        csv.append("FINANCIAL SUMMARY\n");
        csv.append("Total Income,").append(totalIncome.toString()).append("\n");
        csv.append("Total Expenses,").append(totalExpense.toString()).append("\n");
        csv.append("Closing Balance,").append(closingBalance.toString()).append("\n\n");

        // 3. Category Breakdown
        csv.append("CATEGORY BREAKDOWN (EXPENSES)\n");
        csv.append("Category,Spent,Percentage\n");
        Map<Category, BigDecimal> categoryExpenses = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        categoryExpenses.entrySet().stream()
                .sorted(Map.Entry.<Category, BigDecimal>comparingByValue().reversed())
                .forEach(entry -> {
                    BigDecimal amt = entry.getValue();
                    BigDecimal pct = totalExpense.compareTo(BigDecimal.ZERO) > 0 
                            ? amt.multiply(new BigDecimal(100)).divide(totalExpense, 2, RoundingMode.HALF_UP) 
                            : BigDecimal.ZERO;
                    csv.append(escapeCSV(entry.getKey().getName())).append(",")
                       .append(amt.toString()).append(",")
                       .append(pct.toString()).append("%\n");
                });
        csv.append("\n");

        // 4. Transaction List
        csv.append("TRANSACTIONS LIST\n");
        csv.append("Date,Type,Category,Amount,Description\n");
        for (Transaction t : transactions) {
            csv.append(t.getTransactionDate().toString()).append(",")
               .append(t.getType().toString()).append(",")
               .append(escapeCSV(t.getCategory().getName())).append(",")
               .append(t.getAmount().toString()).append(",")
               .append(escapeCSV(t.getDescription())).append("\n");
        }

        return csv.toString();
    }

    @Transactional(readOnly = true)
    public byte[] generateMonthlyPDF(Integer month, Integer year) {
        User currentUser = authService.getCurrentUser();
        Long userId = currentUser.getId();

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());

        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetween(userId, startDate, endDate);
        transactions.sort(Comparator.comparing(Transaction::getTransactionDate).reversed());

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal closingBalance = totalIncome.subtract(totalExpense);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Colors
            Color primaryColor = new Color(59, 130, 246); // Blue
            Color darkColor = new Color(31, 41, 55); // Slate
            Color lightGray = new Color(243, 244, 246);
            Color textRed = new Color(239, 68, 68);
            Color textGreen = new Color(16, 185, 129);

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, primaryColor);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12, darkColor);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, primaryColor);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkColor);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkColor);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);

            // 1. Header
            Paragraph title = new Paragraph("Personal Finance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(4);
            document.add(title);

            String monthStr = LocalDate.of(year, month, 1).getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            Paragraph period = new Paragraph("Statement Period: " + monthStr + " " + year, subtitleFont);
            period.setAlignment(Element.ALIGN_CENTER);
            period.setSpacingAfter(15);
            document.add(period);

            // Metadata Box
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(20);
            
            PdfPCell cell = new PdfPCell(new Phrase("User Details", boldFont));
            cell.setBackgroundColor(lightGray);
            cell.setPadding(8);
            metaTable.addCell(cell);
            
            cell = new PdfPCell(new Phrase("Report Metadata", boldFont));
            cell.setBackgroundColor(lightGray);
            cell.setPadding(8);
            metaTable.addCell(cell);

            // Details
            cell = new PdfPCell(new Phrase("Name: " + currentUser.getName() + "\nEmail: " + currentUser.getEmail(), regularFont));
            cell.setPadding(8);
            metaTable.addCell(cell);

            cell = new PdfPCell(new Phrase("Generated On: " + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + "\nCurrency: USD ($)", regularFont));
            cell.setPadding(8);
            metaTable.addCell(cell);
            
            document.add(metaTable);

            // 2. Financial Summary Cards (using table)
            Paragraph summaryTitle = new Paragraph("Financial Summary", sectionTitleFont);
            summaryTitle.setSpacingAfter(10);
            document.add(summaryTitle);

            PdfPTable summaryTable = new PdfPTable(3);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingAfter(20);

            // Total Income Card
            PdfPCell incCell = new PdfPCell();
            incCell.setBackgroundColor(new Color(240, 253, 244)); // Light Green
            incCell.setPadding(10);
            incCell.addElement(new Paragraph("TOTAL INCOME", smallFont));
            Paragraph incAmt = new Paragraph("$" + totalIncome, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, textGreen));
            incCell.addElement(incAmt);
            summaryTable.addCell(incCell);

            // Total Expense Card
            PdfPCell expCell = new PdfPCell();
            expCell.setBackgroundColor(new Color(254, 242, 242)); // Light Red
            expCell.setPadding(10);
            expCell.addElement(new Paragraph("TOTAL EXPENSES", smallFont));
            Paragraph expAmt = new Paragraph("$" + totalExpense, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, textRed));
            expCell.addElement(expAmt);
            summaryTable.addCell(expCell);

            // Closing Balance Card
            PdfPCell balCell = new PdfPCell();
            Color balColor = closingBalance.compareTo(BigDecimal.ZERO) >= 0 ? textGreen : textRed;
            balCell.setBackgroundColor(closingBalance.compareTo(BigDecimal.ZERO) >= 0 ? new Color(240, 253, 244) : new Color(254, 242, 242));
            balCell.setPadding(10);
            balCell.addElement(new Paragraph("NET BALANCE", smallFont));
            Paragraph balAmt = new Paragraph("$" + closingBalance, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, balColor));
            balCell.addElement(balAmt);
            summaryTable.addCell(balCell);

            document.add(summaryTable);

            // 3. Category Expenses Breakdown
            Paragraph categoryTitle = new Paragraph("Category Expenses Breakdown", sectionTitleFont);
            categoryTitle.setSpacingAfter(10);
            document.add(categoryTitle);

            PdfPTable catTable = new PdfPTable(3);
            catTable.setWidthPercentage(100);
            catTable.setSpacingAfter(20);
            catTable.setWidths(new float[]{4f, 3f, 3f});

            // Headers
            PdfPCell h1 = new PdfPCell(new Phrase("Category", boldFont));
            h1.setBackgroundColor(lightGray);
            h1.setPadding(8);
            catTable.addCell(h1);
            
            PdfPCell h2 = new PdfPCell(new Phrase("Spent", boldFont));
            h2.setBackgroundColor(lightGray);
            h2.setPadding(8);
            catTable.addCell(h2);
            
            PdfPCell h3 = new PdfPCell(new Phrase("Percentage", boldFont));
            h3.setBackgroundColor(lightGray);
            h3.setPadding(8);
            catTable.addCell(h3);

            Map<Category, BigDecimal> categoryExpenses = transactions.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .collect(Collectors.groupingBy(
                            Transaction::getCategory,
                            Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                    ));

            if (categoryExpenses.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No expense records found for this period.", regularFont));
                emptyCell.setColspan(3);
                emptyCell.setPadding(8);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                catTable.addCell(emptyCell);
            } else {
                categoryExpenses.entrySet().stream()
                        .sorted(Map.Entry.<Category, BigDecimal>comparingByValue().reversed())
                        .forEach(entry -> {
                            BigDecimal amt = entry.getValue();
                            BigDecimal pct = totalExpense.compareTo(BigDecimal.ZERO) > 0 
                                    ? amt.multiply(new BigDecimal(100)).divide(totalExpense, 2, RoundingMode.HALF_UP) 
                                    : BigDecimal.ZERO;
                            
                            catTable.addCell(new PdfPCell(new Phrase(entry.getKey().getName(), regularFont)));
                            catTable.addCell(new PdfPCell(new Phrase("$" + amt, regularFont)));
                            catTable.addCell(new PdfPCell(new Phrase(pct + "%", regularFont)));
                        });
            }
            document.add(catTable);

            // 4. Detailed Transaction List
            Paragraph transactionsTitle = new Paragraph("Detailed Transactions List", sectionTitleFont);
            transactionsTitle.setSpacingAfter(10);
            document.add(transactionsTitle);

            PdfPTable tTable = new PdfPTable(5);
            tTable.setWidthPercentage(100);
            tTable.setWidths(new float[]{2f, 1.5f, 2.5f, 2f, 4f});

            // Headers
            String[] headers = {"Date", "Type", "Category", "Amount", "Description"};
            for (String header : headers) {
                PdfPCell th = new PdfPCell(new Phrase(header, boldFont));
                th.setBackgroundColor(lightGray);
                th.setPadding(8);
                tTable.addCell(th);
            }

            if (transactions.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No transactions found for this period.", regularFont));
                emptyCell.setColspan(5);
                emptyCell.setPadding(8);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                tTable.addCell(emptyCell);
            } else {
                for (Transaction t : transactions) {
                    tTable.addCell(new PdfPCell(new Phrase(t.getTransactionDate().toString(), regularFont)));
                    
                    PdfPCell typeCell = new PdfPCell(new Phrase(t.getType().toString(), 
                            t.getType() == TransactionType.INCOME ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, textGreen) : FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, textRed)));
                    tTable.addCell(typeCell);
                    
                    tTable.addCell(new PdfPCell(new Phrase(t.getCategory().getName(), regularFont)));
                    
                    tTable.addCell(new PdfPCell(new Phrase("$" + t.getAmount(), regularFont)));
                    
                    tTable.addCell(new PdfPCell(new Phrase(t.getDescription() != null ? t.getDescription() : "", regularFont)));
                }
            }
            document.add(tTable);

            document.close();
        } catch (DocumentException e) {
            // Log error
        }

        return out.toByteArray();
    }

    private String escapeCSV(String value) {
        if (value == null) return "";
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }
}
