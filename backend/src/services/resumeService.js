const pdfParse = require('pdf-parse');

/**
 * Extracts raw text from an uploaded PDF file buffer.
 * Compatible with both pdf-parse v1 (callable function) and v2 (PDFParse class).
 * 
 * @param {Buffer} buffer - In-memory file buffer from multer.
 * @returns {Promise<string>} Extracted plain text.
 */
async function parseResumePdf(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    const error = new Error('A valid PDF buffer is required for parsing');
    error.code = 'PDF_PARSE_ERROR';
    error.statusCode = 400;
    throw error;
  }

  try {
    let rawText = '';

    if (typeof pdfParse === 'function') {
      const parsedData = await pdfParse(buffer);
      rawText = parsedData?.text || '';
    } else if (pdfParse?.PDFParse) {
      const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const parser = new pdfParse.PDFParse(uint8);
      const parsedData = await parser.getText();
      rawText = parsedData?.text || (typeof parsedData === 'string' ? parsedData : '');
    } else {
      throw new Error('pdf-parse function export is not available');
    }

    return rawText.trim();
  } catch (err) {
    const parseError = new Error(`Corrupted or unreadable PDF: ${err.message}`);
    parseError.code = 'PDF_PARSE_ERROR';
    parseError.statusCode = 400;
    throw parseError;
  }
}

module.exports = {
  parseResumePdf
};
