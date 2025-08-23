# Payment Integration System - Inzira Ticket System

This document provides a comprehensive guide to the simplified payment integration system implemented in the Inzira Ticket System.

## 🚀 Overview

The payment system currently supports two payment methods:
- **Credit/Debit Cards** via Stripe - For online customer bookings
- **Cash Payments** - For agent bookings only (immediate confirmation)

*Note: Additional payment methods (Mobile Money, Bank Transfer) can be added later as needed.*

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Spring Boot    │    │  Payment       │
│   PaymentForm   │◄──►│   Payment       │◄──►│  Provider      │
│   PaymentStatus │    │   Service       │    │  (Stripe)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 File Structure

### Backend (Java)
```
src/main/java/com/inzira/shared/
├── entities/
│   └── Payment.java                    # Payment entity with essential fields
├── dtos/
│   ├── PaymentRequest.java             # Payment request DTO
│   ├── PaymentResponse.java            # Payment response DTO
│   └── PaymentStatus.java              # Payment status DTO
├── services/
│   ├── PaymentService.java             # Main payment service interface
│   ├── PaymentServiceImpl.java         # Main payment service implementation
│   └── StripePaymentService.java       # Stripe card payment service
├── controllers/
│   └── PaymentController.java          # Payment REST endpoints
└── repositories/
    └── PaymentRepository.java          # Payment data access
```

### Frontend (React)
```
src/components/
├── PaymentForm.jsx                     # Payment form component
└── PaymentStatus.jsx                   # Payment status display
```

## 🔧 Configuration

### Application Properties
```properties
# Stripe Configuration (Card Payments)
stripe.secret.key=your_stripe_secret_key_here
stripe.publishable.key=your_stripe_publishable_key_here
stripe.webhook.secret=your_webhook_secret_here

# Cash payments are processed immediately for agent bookings
# No additional configuration needed for cash payments
```

## 🚀 Getting Started

### 1. Backend Setup

1. **Add Dependencies** (already added to pom.xml):
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-webflux</artifactId>
   </dependency>
   ```

2. **Configure Stripe**:
   - Update `application.properties` with your Stripe API keys
   - Get credentials from Stripe Dashboard
   - Configure webhook endpoint for payment status updates

3. **Database Migration**:
   The Payment entity includes all necessary fields. Run your application to create the table.

### 2. Frontend Setup

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install axios react-hot-toast
   ```

2. **Import Components**:
   ```jsx
   import PaymentForm from './components/PaymentForm';
   import PaymentStatus from './components/PaymentStatus';
   ```

## 📱 Usage Examples

### 1. Payment Form Integration

```jsx
import PaymentForm from './components/PaymentForm';

function BookingPage() {
    const handlePaymentSuccess = (paymentResponse) => {
        console.log('Payment successful:', paymentResponse);
        // Redirect to success page or show confirmation
    };

    const handlePaymentCancel = () => {
        // Handle payment cancellation
    };

    return (
        <div>
            <h1>Book Your Ticket</h1>
            <PaymentForm 
                booking={bookingData}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentCancel={handlePaymentCancel}
            />
        </div>
    );
}
```

### 2. Payment Status Check

```jsx
import PaymentStatus from './components/PaymentStatus';

function PaymentStatusPage() {
    const handleStatusChange = (status) => {
        if (status.isSuccessful) {
            // Handle successful payment
        }
    };

    return (
        <PaymentStatus 
            transactionReference="TXN-123456789"
            onStatusChange={handleStatusChange}
        />
    );
}
```

## 🔌 API Endpoints

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/initiate` | Initiate a payment |
| `GET` | `/api/payments/status/{reference}` | Check payment status |
| `POST` | `/api/payments/callback/{provider}` | Payment provider callback |
| `POST` | `/api/payments/cancel/{reference}` | Cancel pending payment |
| `POST` | `/api/payments/refund/{reference}` | Process refund |
| `GET` | `/api/payments/health` | Health check |

### Request/Response Examples

#### Initiate Payment
```json
POST /api/payments/initiate
{
    "bookingId": 123,
    "amount": 5000.00,
    "paymentMethod": "MOBILE_MONEY",
    "currency": "RWF",
    "description": "Bus ticket from Kigali to Huye",
    "phoneNumber": "0781234567",
    "customerName": "John Doe"
}
```

#### Payment Response
```json
{
    "paymentId": 456,
    "transactionReference": "TXN-123456789",
    "status": "PENDING",
    "message": "MoMo payment initiated. Please complete payment on your phone.",
    "amount": 5000.00,
    "currency": "RWF",
    "paymentMethod": "MOBILE_MONEY",
    "requiresRedirect": true,
    "redirectUrl": "https://momo.payment.url",
    "instructions": "1. You will receive a prompt on your phone\n2. Enter your MoMo PIN to confirm payment\n3. Wait for confirmation SMS"
}
```

## 🔒 Security Features

1. **Input Validation**: All payment requests are validated using Bean Validation
2. **Error Handling**: Comprehensive error handling with meaningful messages
3. **Logging**: Detailed logging for debugging and monitoring
4. **Transaction Management**: Database transactions ensure data consistency
5. **API Key Management**: Sensitive keys stored in environment variables

## 🧪 Testing

### 1. Test Payment Flow

1. **Create a test booking** in your system
2. **Initiate payment** using the PaymentForm component
3. **Test different payment methods**:
   - Mobile Money: Use test phone number
   - Stripe: Use test card numbers
   - Bank Transfer: Check instructions generation
   - Cash: Verify immediate confirmation

### 2. Test Callbacks

1. **Simulate MoMo callback**:
   ```bash
   curl -X POST http://localhost:8080/api/payments/callback/momo \
     -H "Content-Type: application/json" \
     -d '{"reference":"TXN-123","status":"SUCCESSFUL"}'
   ```

2. **Check payment status**:
   ```bash
   curl http://localhost:8080/api/payments/status/TXN-123
   ```

## 🚨 Error Handling

### Common Errors and Solutions

1. **"Payment already exists for this booking"**
   - Check if payment record already exists
   - Use different booking ID for testing

2. **"Phone number is required for mobile money payment"**
   - Ensure phoneNumber field is provided for MOBILE_MONEY method

3. **"Email is required for card payment"**
   - Ensure email field is provided for STRIPE/BANK_CARD methods

4. **"Payment initiation failed"**
   - Check backend logs for detailed error
   - Verify payment provider configuration

## 🔄 Payment Flow

### 1. Mobile Money (MoMo)
```
1. User selects MOBILE_MONEY
2. Enters phone number
3. System generates MoMo payment request
4. User receives prompt on phone
5. User enters PIN to confirm
6. MoMo sends callback to system
7. System updates payment status
8. User sees confirmation
```

### 2. Stripe (Card Payments)
```
1. User selects BANK_CARD
2. Enters email address
3. System creates Stripe payment intent
4. User redirected to Stripe checkout
5. User enters card details
6. Stripe processes payment
7. Stripe sends webhook to system
8. System updates payment status
9. User redirected back with confirmation
```

### 3. Bank Transfer
```
1. User selects BANK_TRANSFER
2. System generates transfer instructions
3. User follows instructions to transfer money
4. Bank confirms transfer (manual process)
5. Admin updates payment status
6. User sees confirmation
```

### 4. Cash Payment
```
1. User selects CASH
2. System immediately confirms payment
3. User sees success message
4. No external processing required
```

## 📊 Monitoring and Logging

### Log Levels
- **INFO**: Payment initiation, success, status changes
- **WARN**: Payment failures, validation issues
- **ERROR**: System errors, callback failures
- **DEBUG**: Detailed payment processing steps

### Key Metrics to Monitor
1. Payment success rate by method
2. Average payment processing time
3. Failed payment reasons
4. Callback processing success rate

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment variables
export MOMO_API_KEY=your_production_key
export STRIPE_SECRET_KEY=your_production_key
export BANK_API_KEY=your_production_key
```

### 2. SSL/HTTPS
- Ensure all payment endpoints use HTTPS
- Configure SSL certificates properly
- Use secure webhook URLs

### 3. Database Backup
- Regular backup of payment records
- Transaction log monitoring
- Data retention policies

## 🔧 Customization

### Adding New Payment Methods

1. **Create Payment Service**:
   ```java
   @Service
   public class NewPaymentService {
       public PaymentResponse processPayment(PaymentRequest request, Payment payment) {
           // Implementation
       }
   }
   ```

2. **Update PaymentServiceImpl**:
   ```java
   case "NEW_METHOD":
       return newPaymentService.processPayment(request, payment);
   ```

3. **Update Frontend**:
   ```jsx
   { value: 'NEW_METHOD', label: 'New Method', icon: '🆕' }
   ```

### Modifying Payment Flows

1. **Update DTOs** for new fields
2. **Modify services** for new logic
3. **Update frontend** for new UI elements
4. **Test thoroughly** before deployment

## 📞 Support

### Common Issues
1. **Payment not processing**: Check payment provider configuration
2. **Callback failures**: Verify webhook URLs and signatures
3. **Status not updating**: Check callback processing logic
4. **Frontend errors**: Verify API endpoint accessibility

### Debugging Tips
1. Check backend logs for detailed error messages
2. Verify payment provider API status
3. Test with different payment methods
4. Use Postman to test API endpoints directly

## 📚 Additional Resources

- [MTN MoMo Developer Documentation](https://momodeveloper.mtn.com/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Spring Boot Validation](https://spring.io/guides/gs/validating-form-input/)
- [React Hook Form](https://react-hook-form.com/)

## 🎯 Roadmap

### Future Enhancements
1. **Real-time Payment Updates** via WebSocket
2. **Payment Analytics Dashboard**
3. **Multi-currency Support**
4. **Payment Plan/Installments**
5. **Automated Refund Processing**
6. **Payment Method Preferences**
7. **Fraud Detection System**

---

**Note**: This payment system is designed to be production-ready but includes simulation logic for development purposes. Replace simulation code with actual payment provider API calls before deploying to production.
