package com.finance.tracker.controller;

import com.finance.tracker.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Endpoints for exporting financial statements (CSV and PDF)")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/monthly/csv")
    @Operation(summary = "Export a monthly financial statement in CSV format")
    public ResponseEntity<byte[]> exportMonthlyCSV(
            @RequestParam Integer month,
            @RequestParam Integer year
    ) {
        String csvContent = reportService.generateMonthlyCSV(month, year);
        byte[] csvData = csvContent.getBytes();
        
        String filename = String.format("finance_report_%d_%02d.csv", year, month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @GetMapping("/monthly/pdf")
    @Operation(summary = "Export a monthly financial statement in PDF format")
    public ResponseEntity<byte[]> exportMonthlyPDF(
            @RequestParam Integer month,
            @RequestParam Integer year
    ) {
        byte[] pdfData = reportService.generateMonthlyPDF(month, year);
        
        String filename = String.format("finance_report_%d_%02d.pdf", year, month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfData);
    }
}
