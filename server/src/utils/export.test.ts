import { describe, it, expect } from 'vitest';
import { generateExcel, generateCSV, generatePDF } from './export';

describe('Export Utils', () => {
  const mockData = {
    headers: ['Nama', 'Email', 'Status'],
    rows: [
      ['User 1', 'user1@test.com', 'Hadir'],
      ['User 2', 'user2@test.com', 'Terlambat']
    ],
    summary: {
      'Total Hadir': 1,
      'Total Terlambat': 1
    }
  };

  describe('generateExcel', () => {
    it('should generate an Excel buffer', async () => {
      const buffer = await generateExcel(mockData, 'Test Report');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate Excel without summary', async () => {
      const dataWithoutSummary = {
        headers: ['Name'],
        rows: [['Test']]
      };

      const buffer = await generateExcel(dataWithoutSummary, 'Test');

      expect(buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('generateCSV', () => {
    it('should generate CSV string', () => {
      const csv = generateCSV(mockData);

      expect(csv).toContain('Nama,Email,Status');
      expect(csv).toContain('User 1,user1@test.com,Hadir');
      expect(csv).toContain('Ringkasan');
      expect(csv).toContain('Total Hadir,1');
    });

    it('should handle commas in values', () => {
      const dataWithCommas = {
        headers: ['Name'],
        rows: [['Value, with comma']]
      };

      const csv = generateCSV(dataWithCommas);

      expect(csv).toContain('"Value, with comma"');
    });

    it('should generate CSV without summary', () => {
      const dataWithoutSummary = {
        headers: ['Name'],
        rows: [['Test']]
      };

      const csv = generateCSV(dataWithoutSummary);

      expect(csv).toContain('Name');
      expect(csv).toContain('Test');
      expect(csv).not.toContain('Ringkasan');
    });
  });

  describe('generatePDF', () => {
    it('should generate a PDF buffer', async () => {
      const buffer = await generatePDF(mockData, 'Test Report');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate PDF without summary', async () => {
      const dataWithoutSummary = {
        headers: ['Name'],
        rows: [['Test']]
      };

      const buffer = await generatePDF(dataWithoutSummary, 'Test');

      expect(buffer).toBeInstanceOf(Buffer);
    });
  });
});
