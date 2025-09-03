import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const PaymentForm = ({ booking, onPaymentSuccess, onPaymentCancel, allowCash = false }) => {
    const [paymentMethod, setPaymentMethod] = useState('STRIPE');
    const [email, setEmail] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentResponse, setPaymentResponse] = useState(null);
    const [showInstructions, setShowInstructions] = useState(false);

    // Set default values from booking
    useEffect(() => {
        if (booking) {
            setEmail(booking.customer?.email || '');
            setCustomerName(`${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim());
        }
        
        // Set default payment method based on what's allowed
        if (!allowCash && paymentMethod === 'CASH') {
            setPaymentMethod('STRIPE');
        }
    }, [booking, allowCash, paymentMethod]);

    const handlePayment = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const paymentData = {
                bookingId: booking.id,
                amount: booking.totalAmount,
                paymentMethod: paymentMethod,
                currency: 'RWF',
                description: `Bus ticket from ${booking.pickupPoint?.district?.name} to ${booking.dropPoint?.district?.name}`,
                email: paymentMethod === 'STRIPE' ? email : null,
                customerName: customerName || null
            };

            const response = await api.post('/payments/initiate', paymentData);
            
            if (response.data.status === 'ERROR') {
                toast.error(response.data.message || 'Payment initiation failed');
                return;
            }

            setPaymentResponse(response.data);
            
            if (response.data.requiresRedirect && response.data.redirectUrl) {
                // Persist minimal booking info so guest can retrieve ticket after redirect-back
                try {
                    localStorage.setItem('lastBooking', JSON.stringify({
                        id: booking.id,
                        bookingReference: booking.bookingReference,
                        phoneNumber: booking.customer?.phoneNumber || null,
                        email: booking.customer?.email || null,
                        transactionReference: response.data.transactionReference || null
                    }))
                } catch (e) { /* ignore */ }
                // Redirect to payment page
                window.location.href = response.data.redirectUrl;
            } else if (response.data.status === 'SUCCESS') {
                // Immediate success (e.g., cash payment)
                toast.success('Payment successful!');
                onPaymentSuccess(response.data);
            } else {
                // Show instructions for manual payments
                setShowInstructions(true);
            }

        } catch (error) {
            console.error('Payment error:', error);
            const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (paymentMethod === 'STRIPE' && (!email || email.trim() === '')) {
            toast.error('Email is required for card payment');
            return false;
        }

        if (paymentMethod === 'CASH' && !allowCash) {
            toast.error('Cash payment is not allowed for online bookings');
            return false;
        }

        if (!customerName || customerName.trim() === '') {
            toast.error('Customer name is required');
            return false;
        }

        return true;
    };

    const handleCancel = () => {
        if (onPaymentCancel) {
            onPaymentCancel();
        }
    };

    const renderPaymentMethodFields = () => {
        switch (paymentMethod) {
            case 'STRIPE':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                We'll send payment confirmation to this email
                            </p>
                        </div>
                    </div>
                );

            case 'CASH':
                return (
                    <div className="bg-green-50 p-4 rounded-md">
                        <p className="text-sm text-green-800">
                            Cash payment will be processed immediately upon confirmation.
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderPaymentInstructions = () => {
        if (!paymentResponse || !showInstructions) return null;

        return (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Payment Instructions</h4>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                    {paymentResponse.instructions}
                </div>
                <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">
                        Transaction Reference: <span className="font-mono">{paymentResponse.transactionReference}</span>
                    </p>
                </div>
            </div>
        );
    };

    if (!booking) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">No booking information available.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                <div className="text-sm text-gray-500">
                    Amount: <span className="font-semibold">{booking.totalAmount} RWF</span>
                </div>
            </div>

            <div className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Payment Method *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: 'STRIPE', label: 'Credit/Debit Card', icon: '💳' },
                            ...(allowCash ? [{ value: 'CASH', label: 'Cash', icon: '💰' }] : [])
                        ].map((method) => (
                            <button
                                key={method.value}
                                type="button"
                                onClick={() => setPaymentMethod(method.value)}
                                className={`p-3 border rounded-md text-center transition-colors ${
                                    paymentMethod === method.value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className="text-2xl mb-1">{method.icon}</div>
                                <div className="text-sm font-medium">{method.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Customer Information */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name *
                    </label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Payment Method Specific Fields */}
                {renderPaymentMethodFields()}

                {/* Payment Instructions */}
                {renderPaymentInstructions()}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            `Pay ${booking.totalAmount} RWF`
                        )}
                    </button>

                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                {/* Security Notice */}
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600 text-center">
                        🔒 Your payment information is secure and encrypted. We never store your payment details.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentForm;
