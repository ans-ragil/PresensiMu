import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

interface ReportData {
  headers: string[];
  rows: any[][];
  summary?: Record<string, any>;
}

export const generateExcel = async (data: ReportData, title: string): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Absensi Online';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title);

  // Add title
  sheet.mergeCells('A1:F1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { size: 14, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  // Add date
  sheet.mergeCells('A2:F2');
  const dateCell = sheet.getCell('A2');
  dateCell.value = `Tanggal: ${new Date().toLocaleDateString('id-ID')}`;
  dateCell.alignment = { horizontal: 'center' };

  // Add headers
  const headerRow = sheet.addRow(data.headers);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3B82F6' }
  };
  headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Add data rows
  data.rows.forEach(row => {
    sheet.addRow(row);
  });

  // Add summary if provided
  if (data.summary) {
    sheet.addRow([]);
    sheet.addRow(['Ringkasan']);
    Object.entries(data.summary).forEach(([key, value]) => {
      sheet.addRow([key, value]);
    });
  }

  // Auto-fit columns
  sheet.columns.forEach(column => {
    column.width = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

export const generateCSV = (data: ReportData): string => {
  const lines: string[] = [];

  // Add headers
  lines.push(data.headers.join(','));

  // Add data rows
  data.rows.forEach(row => {
    lines.push(row.map(cell => {
      if (typeof cell === 'string' && cell.includes(',')) {
        return `"${cell}"`;
      }
      return cell;
    }).join(','));
  });

  // Add summary if provided
  if (data.summary) {
    lines.push('');
    lines.push('Ringkasan');
    Object.entries(data.summary).forEach(([key, value]) => {
      lines.push(`${key},${value}`);
    });
  }

  return lines.join('\n');
};

export const generatePDF = (data: ReportData, title: string): Promise<Buffer> => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Title
    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
    doc.moveDown(2);

    // Headers
    doc.fontSize(10).font('Helvetica-Bold');
    const headerText = data.headers.join(' | ');
    doc.text(headerText);
    doc.moveDown();

    // Data rows
    doc.font('Helvetica');
    data.rows.forEach(row => {
      const rowText = row.map(cell => String(cell)).join(' | ');
      doc.text(rowText, { width: 500, continued: false });
    });

    // Summary
    if (data.summary) {
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Ringkasan:');
      doc.font('Helvetica');
      Object.entries(data.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`);
      });
    }

    doc.end();
  });
};
