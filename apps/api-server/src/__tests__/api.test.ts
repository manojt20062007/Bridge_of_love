import { describe, it, expect } from 'vitest';
import { convertNumberToIndianWords } from '../utils/numberToWords.js';
import { RazorpayService } from '../services/razorpay.service.js';

describe('Bridge Of Love Utility & Service Tests', () => {
  it('should accurately convert Indian rupee numbers to words for 80G receipts', () => {
    expect(convertNumberToIndianWords(5000)).toBe('Rupees Five Thousand Only');
    expect(convertNumberToIndianWords(12500)).toBe('Rupees Twelve Thousand Five Hundred Only');
    expect(convertNumberToIndianWords(100000)).toBe('Rupees One Lakh Only');
    expect(convertNumberToIndianWords(2500000)).toBe('Rupees Twenty Five Lakh Only');
  });

  it('should verify simulation payment signatures correctly in development/test mode', () => {
    const isMockValid = RazorpayService.verifyPaymentSignature(
      'order_test_12345',
      'pay_test_67890',
      'sim_sig_test_valid'
    );
    expect(isMockValid).toBe(true);

    const isMockValidConstant = RazorpayService.verifyPaymentSignature(
      'order_test_12345',
      'pay_test_67890',
      'mock_signature_valid'
    );
    expect(isMockValidConstant).toBe(true);
  });
});
