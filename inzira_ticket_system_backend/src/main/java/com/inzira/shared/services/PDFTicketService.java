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
            // Create PDF document
            Document document = new Document(PageSize.A4);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            
            document.open();

            // Add title
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, BaseColor.BLUE);
            Paragraph title = new Paragraph("INZIRA BUS TICKET", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Add agency logo if available
            if (booking.getSchedule().getAgencyRoute().getAgency().getLogoPath() != null) {
                try {
                    String logoPath = "uploads/" + booking.getSchedule().getAgencyRoute().getAgency().getLogoPath();
                    if (Files.exists(Paths.get(logoPath))) {
                        Image logo = Image.getInstance(logoPath);
                        logo.scaleToFit(100, 100);
                        logo.setAlignment(Element.ALIGN_CENTER);
                        document.add(logo);
                        document.add(new Paragraph(" ")); // Space
                    }
                } catch (Exception e) {
                    // Logo loading failed, continue without it
                }
            }

            // Add booking details
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 12);

            // Booking Reference
            document.add(new Paragraph("Booking Reference: " + booking.getBookingReference(), headerFont));
            document.add(new Paragraph(" "));

            // Customer Details
            document.add(new Paragraph("Passenger Details:", headerFont));
            document.add(new Paragraph("Name: " + booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName(), normalFont));
            document.add(new Paragraph("Email: " + booking.getCustomer().getEmail(), normalFont));
            document.add(new Paragraph("Phone: " + booking.getCustomer().getPhoneNumber(), normalFont));
            document.add(new Paragraph(" "));

            // Journey Details
            document.add(new Paragraph("Journey Details:", headerFont));
            document.add(new Paragraph("Agency: " + booking.getSchedule().getAgencyRoute().getAgency().getAgencyName(), normalFont));
            document.add(new Paragraph("Route: " + booking.getSchedule().getAgencyRoute().getRoute().getOrigin().getName() + 
                    " → " + booking.getSchedule().getAgencyRoute().getRoute().getDestination().getName(), normalFont));
            document.add(new Paragraph("Pickup Point: " + booking.getPickupPoint().getName(), normalFont));
            document.add(new Paragraph("Drop Point: " + booking.getDropPoint().getName(), normalFont));
            document.add(new Paragraph("Date: " + booking.getSchedule().getDepartureDate(), normalFont));
            document.add(new Paragraph("Departure Time: " + booking.getSchedule().getDepartureTime(), normalFont));
            document.add(new Paragraph("Arrival Time: " + booking.getSchedule().getArrivalTime(), normalFont));
            document.add(new Paragraph("Bus: " + booking.getSchedule().getBus().getPlateNumber() + " (" + booking.getSchedule().getBus().getBusType() + ")", normalFont));
            document.add(new Paragraph("Number of Seats: " + booking.getNumberOfSeats(), normalFont));
            document.add(new Paragraph("Total Amount: " + booking.getTotalAmount() + " RWF", headerFont));
            document.add(new Paragraph(" "));

            // Add QR Code
            if (booking.getQrCode() != null) {
                try {
                    byte[] qrCodeBytes = Base64.getDecoder().decode(booking.getQrCode());
                    Image qrImage = Image.getInstance(qrCodeBytes);
                    qrImage.scaleToFit(150, 150);
                    qrImage.setAlignment(Element.ALIGN_CENTER);
                    document.add(new Paragraph("Scan QR Code for Verification:", headerFont));
                    document.add(qrImage);
                } catch (Exception e) {
                    // QR code loading failed
                }
            }

            // Add footer
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Thank you for choosing Inzira Bus Services!", normalFont));
            document.add(new Paragraph("Please arrive at the pickup point 15 minutes before departure.", normalFont));

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
}