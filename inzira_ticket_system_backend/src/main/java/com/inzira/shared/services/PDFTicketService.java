package com.inzira.shared.services;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.shared.entities.Booking;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

@Service
public class PDFTicketService {

    @Autowired
    private QRCodeService qrCodeService;

    public String generateTicketPDF(Booking booking) {
        try {
            // Create PDF document with custom page size for thermal printing
            Rectangle pageSize = new Rectangle(226, 340); // 80mm x 120mm in points
            Document document = new Document(pageSize, 10, 10, 10, 10); // Small margins
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            
            document.open();

            // Define fonts for thermal printing
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLACK);
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 8, Font.BOLD, BaseColor.BLACK);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 7, Font.NORMAL, BaseColor.BLACK);
            Font smallFont = new Font(Font.FontFamily.HELVETICA, 6, Font.NORMAL, BaseColor.BLACK);

            // Add header with logo and title
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{1, 2});

            // Logo cell
            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setPadding(0);
            
            if (booking.getSchedule().getAgencyRoute().getAgency().getLogoPath() != null) {
                try {
                    String logoPath = "uploads/" + booking.getSchedule().getAgencyRoute().getAgency().getLogoPath();
                    if (Files.exists(Paths.get(logoPath))) {
                        Image logo = Image.getInstance(logoPath);
                        logo.scaleToFit(30, 30);
                        logoCell.addElement(logo);
                    }
                } catch (Exception e) {
                    // Logo loading failed, add placeholder
                    Paragraph logoPlaceholder = new Paragraph("LOGO", smallFont);
                    logoCell.addElement(logoPlaceholder);
                }
            } else {
                Paragraph logoPlaceholder = new Paragraph("LOGO", smallFont);
                logoCell.addElement(logoPlaceholder);
            }
            headerTable.addCell(logoCell);

            // Title cell
            PdfPCell titleCell = new PdfPCell();
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setPadding(0);
            Paragraph title = new Paragraph("INZIRA BUS TICKET", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            titleCell.addElement(title);
            Paragraph agencyName = new Paragraph(booking.getSchedule().getAgencyRoute().getAgency().getAgencyName(), normalFont);
            agencyName.setAlignment(Element.ALIGN_CENTER);
            titleCell.addElement(agencyName);
            headerTable.addCell(titleCell);
            
            document.add(headerTable);
            document.add(new Paragraph(" ", smallFont)); // Small space

            // Booking Reference (prominent)
            Paragraph refParagraph = new Paragraph("REF: " + booking.getBookingReference(), headerFont);
            refParagraph.setAlignment(Element.ALIGN_CENTER);
            document.add(refParagraph);
            document.add(new Paragraph(" ", smallFont));

            // Journey details in compact format
            PdfPTable journeyTable = new PdfPTable(2);
            journeyTable.setWidthPercentage(100);
            journeyTable.setWidths(new float[]{1, 1});

            // Route
            addTableRow(journeyTable, "ROUTE:", 
                booking.getSchedule().getAgencyRoute().getRoute().getOrigin().getName() + " → " + 
                booking.getSchedule().getAgencyRoute().getRoute().getDestination().getName(), 
                normalFont, smallFont);

            // Date and Time
            addTableRow(journeyTable, "DATE:", booking.getSchedule().getDepartureDate().toString(), normalFont, smallFont);
            addTableRow(journeyTable, "TIME:", booking.getSchedule().getDepartureTime() + " - " + booking.getSchedule().getArrivalTime(), normalFont, smallFont);

            // Pickup and Drop
            addTableRow(journeyTable, "PICKUP:", booking.getPickupPoint().getName(), normalFont, smallFont);
            addTableRow(journeyTable, "DROP:", booking.getDropPoint().getName(), normalFont, smallFont);

            // Bus and Seats
            addTableRow(journeyTable, "BUS:", booking.getSchedule().getBus().getPlateNumber() + " (" + booking.getSchedule().getBus().getBusType() + ")", normalFont, smallFont);
            addTableRow(journeyTable, "SEATS:", booking.getNumberOfSeats().toString(), normalFont, smallFont);

            document.add(journeyTable);
            document.add(new Paragraph(" ", smallFont));

            // Passenger details
            Paragraph passengerHeader = new Paragraph("PASSENGER:", headerFont);
            document.add(passengerHeader);
            Paragraph passengerName = new Paragraph(booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName(), normalFont);
            document.add(passengerName);
            if (booking.getCustomer().getPhoneNumber() != null) {
                Paragraph passengerPhone = new Paragraph("Tel: " + booking.getCustomer().getPhoneNumber(), smallFont);
                document.add(passengerPhone);
            }
            document.add(new Paragraph(" ", smallFont));

            // Total amount (prominent)
            Paragraph totalAmount = new Paragraph("TOTAL: " + booking.getTotalAmount() + " RWF", titleFont);
            totalAmount.setAlignment(Element.ALIGN_CENTER);
            document.add(totalAmount);
            document.add(new Paragraph(" ", smallFont));
            // Add QR Code
            if (booking.getQrCode() != null) {
                try {
                    byte[] qrCodeBytes = Base64.getDecoder().decode(booking.getQrCode());
                    Image qrImage = Image.getInstance(qrCodeBytes);
                    qrImage.scaleToFit(60, 60); // Smaller QR code for thermal printing
                    qrImage.setAlignment(Element.ALIGN_CENTER);
                    document.add(qrImage);
                } catch (Exception e) {
                    // QR code loading failed
                }
            }

            // Footer with instructions
            document.add(new Paragraph(" ", smallFont));
            Paragraph footer1 = new Paragraph("Thank you for choosing Inzira!", smallFont);
            footer1.setAlignment(Element.ALIGN_CENTER);
            document.add(footer1);
            
            Paragraph footer2 = new Paragraph("Arrive 15 min early", smallFont);
            footer2.setAlignment(Element.ALIGN_CENTER);
            document.add(footer2);
            
            Paragraph footer3 = new Paragraph("Show QR code to driver", smallFont);
            footer3.setAlignment(Element.ALIGN_CENTER);
            document.add(footer3);

            document.close();

            // Save PDF to file
            String fileName = "ticket_" + booking.getBookingReference() + ".pdf";
            String filePath = "uploads/tickets/" + fileName;
            
            // Create directory if it doesn't exist
            Path ticketsDir = Paths.get("uploads/tickets");
            if (!Files.exists(ticketsDir)) {
                Files.createDirectories(ticketsDir);
            }

            // Write PDF to file
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(baos.toByteArray());
            }

            return "tickets/" + fileName;

        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Failed to generate PDF ticket", e);
        }
    }

    private void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(1);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(1);
        table.addCell(valueCell);
    }
}