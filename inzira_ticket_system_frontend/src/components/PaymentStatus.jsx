import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PaymentStatus = ({ transactionReference, onStatusChange }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (transactionReference) {
            checkPaymentStatus();
        }
    }, [transactionReference]);

    const checkPaymentStatus = async () => {
        if (!transactionReference) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/api/payments/status/${transactionReference}`);
            setStatus(response.data);
            
            if (onStatusChange) {
                onStatusChange(response.data);
            }

        } catch (error) {
            console.error('Error checking payment status:', error);
            const errorMessage = error.response?.data?.message || 'Failed to check payment status';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SUCCESS':
                return '✅';
            case 'PENDING':
                return '⏳';
            case 'FAILED':
                return '❌';
            case 'REFUNDED':
                return '↩️';
            case 'CANCELLED':
                return '🚫';
            default:
                return '❓';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'PENDING':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'FAILED':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'REFUNDED':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'CANCELLED':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'SUCCESS':
                return 'Payment completed successfully';
            case 'PENDING':
                return 'Payment is being processed';
            case 'FAILED':
                return 'Payment failed';
            case 'REFUNDED':
                return 'Payment has been refunded';
            case 'CANCELLED':
                return 'Payment was cancelled';
            default:
                return 'Unknown payment status';
        }
    };

    if (!transactionReference) {
        return (
            <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-gray-500 text-center">No transaction reference provided</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-4 bg-white rounded-lg shadow-sm border">
                <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600">Checking payment status...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-lg shadow-sm border border-red-200">
                <div className="flex items-center space-x-2">
                    <span className="text-red-600">❌</span>
                    <div>
                        <p className="text-red-800 font-medium">Error checking payment status</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
                <button
                    onClick={checkPaymentStatus}
                    className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!status) {
        return (
            <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-gray-500 text-center">No status information available</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
                <button
                    onClick={checkPaymentStatus}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Refresh status"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            <div className="space-y-4">
                {/* Status Display */}
                <div className={`p-4 rounded-lg border ${getStatusColor(status.status)}`}>
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getStatusIcon(status.status)}</span>
                        <div>
                            <p className="font-medium">{getStatusMessage(status.status)}</p>
                            <p className="text-sm opacity-75">Status: {status.status}</p>
                        </div>
                    </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Transaction Details</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Reference:</span>
                            <span className="font-mono font-medium">{status.transactionReference}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-medium">{status.amount} {status.currency}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Method:</span>
                            <span className="font-medium">{status.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-medium">
                                {status.createdAt ? new Date(status.createdAt).toLocaleString() : 'N/A'}
                            </span>
                        </div>
                        {status.updatedAt && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Updated:</span>
                                <span className="font-medium">
                                    {new Date(status.updatedAt).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Information */}
                {status.failureReason && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-medium text-red-800 mb-2">Failure Reason</h4>
                        <p className="text-red-700 text-sm">{status.failureReason}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                    <button
                        onClick={checkPaymentStatus}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Refresh Status
                    </button>
                    
                    {status.status === 'PENDING' && (
                        <button
                            onClick={() => window.open(`/api/payments/cancel/${status.transactionReference}`, '_blank')}
                            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                        >
                            Cancel Payment
                        </button>
                    )}
                </div>

                {/* Status Summary */}
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Payment status updates may take a few minutes to reflect. 
                        If you've completed payment but status hasn't updated, please wait a moment and refresh.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;
