import { describe, it, expect } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
} from './jwt';

describe('JWT Utils', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'EMPLOYEE'
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateAccessToken(mockUser);
      const token2 = generateAccessToken({
        ...mockUser,
        id: 'different-user-id'
      });

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create a token with very short expiry and wait
      const jwt = require('jsonwebtoken');
      const secret = process.env.JWT_SECRET || 'default-secret';
      const token = jwt.sign(mockUser, secret, { expiresIn: '0s' });

      // Wait a bit to ensure token expires
      setTimeout(() => {
        expect(() => verifyToken(token)).toThrow();
      }, 100);
    });
  });
});
