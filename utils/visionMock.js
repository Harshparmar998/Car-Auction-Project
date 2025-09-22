// utils/visionMock.js

/**
 * Mock OCR validation instead of calling Google Vision API
 * Always returns text as if detected successfully
 */
export async function validateImageMock(filePath, expectedText) {
  // simulate OCR text detection
  const fakeDetectedText = `Sample text with ${expectedText}`;
  const isValid = fakeDetectedText.includes(expectedText);

  return {
    text: fakeDetectedText,
    valid: isValid,
  };
}
