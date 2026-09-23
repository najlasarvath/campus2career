/**
 * Pure Node.js Vector PDF-1.4 Generator
 * Generates an authentic, RFC-compliant Landscape A4 vector PDF certificate
 * with zero external dependencies.
 */

function escapePdf(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Approximate string width in points for standard Helvetica/Times.
 */
function estimateTextWidth(str, fontSize, isBold = false) {
  const avgCharFactor = isBold ? 0.6 : 0.52;
  return (str || '').length * fontSize * avgCharFactor;
}

/**
 * Generate a complete vector PDF buffer for a completion certificate.
 * Page format: Landscape A4 (842 x 595 points)
 */
function generateCertificatePdf({
  id = 'C2C-TECH-00000000',
  studentName = 'Candidate Name',
  collegeName = 'Apex Institute of Technology',
  workshopTitle = 'Industry Readiness Workshop',
  assessmentScore = 85,
  passingScore = 70,
  issuedDate = 'September 23, 2026'
}) {
  const pageWidth = 842;
  const pageHeight = 595;
  const centerX = pageWidth / 2;

  const stream = [];

  // 1. Subtle warm background fill
  stream.push('0.99 0.99 0.98 rg 0 0 842 595 re f');

  // 2. Outer Deep Navy Border (4pt width)
  stream.push('0.06 0.12 0.21 RG 4 w 24 24 794 547 re S');

  // 3. Inner Metallic Gold Border (1.5pt width)
  stream.push('0.83 0.69 0.22 RG 1.5 w 32 32 778 531 re S');

  // 4. Subtle Thin Inner Border
  stream.push('0.85 0.88 0.92 RG 0.5 w 38 38 766 519 re S');

  // 5. Corner Ornaments (Gold brackets)
  const cOff = 44;
  const cLen = 22;
  stream.push('0.83 0.69 0.22 RG 2 w');
  // Top Left
  stream.push(`${cOff} ${pageHeight - cOff - cLen} m ${cOff} ${pageHeight - cOff} l ${cOff + cLen} ${pageHeight - cOff} l S`);
  // Top Right
  stream.push(`${pageWidth - cOff - cLen} ${pageHeight - cOff} m ${pageWidth - cOff} ${pageHeight - cOff} l ${pageWidth - cOff} ${pageHeight - cOff - cLen} l S`);
  // Bottom Left
  stream.push(`${cOff} ${cOff + cLen} m ${cOff} ${cOff} l ${cOff + cLen} ${cOff} l S`);
  // Bottom Right
  stream.push(`${pageWidth - cOff - cLen} ${cOff} m ${pageWidth - cOff} ${cOff} l ${pageWidth - cOff} ${cOff + cLen} l S`);

  // Helper for centered text
  function addCenteredText(text, y, font, size, r, g, b, isBold = false) {
    const w = estimateTextWidth(text, size, isBold);
    const x = Math.max(50, Math.round(centerX - w / 2));
    stream.push(`${r} ${g} ${b} rg BT /${font} ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`);
  }

  // 6. Header: Institutional Authority & College Name
  addCenteredText('INSTITUTIONAL PLACEMENT & SKILLING AUTHORITY', 525, 'F2', 10, 0.55, 0.43, 0.14, true);
  addCenteredText(collegeName.toUpperCase(), 495, 'F2', 22, 0.06, 0.12, 0.21, true);

  // Decorative divider line
  stream.push(`0.83 0.69 0.22 RG 1 w ${centerX - 140} 482 m ${centerX + 140} 482 l S`);

  // 7. Certificate Main Title
  addCenteredText('CERTIFICATE OF COMPLETION', 448, 'F2', 22, 0.06, 0.12, 0.21, true);

  // 8. Presentation Statement
  addCenteredText('This certificate is proudly presented to', 412, 'F4', 12, 0.35, 0.40, 0.48);

  // 9. Student Full Name (Large Elegant Font)
  addCenteredText(studentName, 368, 'F3', 32, 0.06, 0.12, 0.21, true);

  // Underline for student name
  const nameW = estimateTextWidth(studentName, 32, true);
  const lineStartX = Math.max(160, Math.round(centerX - Math.max(nameW / 2 + 30, 140)));
  const lineEndX = Math.min(682, Math.round(centerX + Math.max(nameW / 2 + 30, 140)));
  stream.push(`0.83 0.69 0.22 RG 0.75 w ${lineStartX} 358 m ${lineEndX} 358 l S`);

  // 10. Completion Description
  addCenteredText('for successfully completing the', 332, 'F1', 11, 0.30, 0.35, 0.42);

  // 11. Workshop Title
  addCenteredText(workshopTitle, 308, 'F2', 16, 0.06, 0.12, 0.21, true);

  // Standard achieved
  addCenteredText('and achieving the required assessment standard.', 288, 'F1', 11, 0.30, 0.35, 0.42);

  // 12. Assessment Score & Completion Date
  const detailsText = `Assessment Score: ${assessmentScore}%      •      Completed on: ${issuedDate}      •      Certificate ID: ${id}`;
  addCenteredText(detailsText, 256, 'F2', 10, 0.06, 0.12, 0.21, true);

  // 13. Left Side: Authorized Signatory
  stream.push('0.06 0.12 0.21 rg BT /F3 14 Tf 75 140 Td (Dr. K. R. Sharma) Tj ET');
  stream.push('0.7 0.75 0.8 RG 0.75 w 75 132 m 220 132 l S');
  stream.push('0.20 0.25 0.32 rg BT /F2 10 Tf 75 120 Td (Authorized Signatory) Tj ET');
  stream.push('0.40 0.45 0.50 rg BT /F1 8 Tf 75 108 Td (Dean of Academic & Placement Affairs) Tj ET');

  // 14. Center: Official Seal Badge
  stream.push('0.83 0.69 0.22 RG 1.5 w 421 128 25 0 360 arc S');
  stream.push('0.83 0.69 0.22 RG 0.5 w 421 128 22 0 360 arc S');
  addCenteredText('OFFICIAL SEAL', 131, 'F2', 7, 0.55, 0.43, 0.14, true);
  addCenteredText('★ VERIFIED ★', 121, 'F2', 6, 0.06, 0.12, 0.21, true);

  // 15. Right Side: College / Program Authority
  stream.push('0.06 0.12 0.21 rg BT /F3 14 Tf 620 140 Td (Prof. M. K. Deshmukh) Tj ET');
  stream.push('0.7 0.75 0.8 RG 0.75 w 620 132 m 765 132 l S');
  stream.push('0.20 0.25 0.32 rg BT /F2 10 Tf 620 120 Td (College / Program Authority) Tj ET');
  stream.push(`0.40 0.45 0.50 rg BT /F1 8 Tf 620 108 Td (${escapePdf(collegeName)}) Tj ET`);

  // 16. Bottom Footer
  stream.push(`0.45 0.50 0.58 rg BT /F1 8 Tf 75 52 Td (Officially issued by ${escapePdf(collegeName)} in partnership with Campus2Career Placement & Skilling Authority) Tj ET`);

  const content = stream.join('\n');
  const contentBytes = Buffer.byteLength(content, 'utf8');

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [];

  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';

  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';

  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F3 << /Type /Font /Subtype /Type1 /BaseFont /Times-BoldItalic >> /F4 << /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >> >> >> /Contents 4 0 R >>\nendobj\n';

  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += `4 0 obj\n<< /Length ${contentBytes} >>\nstream\n${content}\nendstream\nendobj\n`;

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += 'xref\n0 5\n0000000000 65535 f \n';
  for (const o of offsets) {
    pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'binary');
}

module.exports = {
  generateCertificatePdf
};
