/**
 * Core validation and sanitization utilities shared between client and server.
 * This module contains no browser-specific APIs and can be imported anywhere.
 */

/**
 * Validates email address format using standard RFC 5322 regex.
 */
export function validateEmail(email: string): string | null {
  if (!email || typeof email !== "string") {
    return "Email address is required.";
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address (e.g. name@domain.com).";
  }
  return null;
}

/**
 * Validates password criteria (min 6 characters).
 */
export function validatePassword(password: string): string | null {
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  return null;
}

/**
 * Validates that a string has a minimum and maximum length.
 */
export function validateLength(
  value: string,
  fieldName: string,
  min = 1,
  max = 5000
): string | null {
  const trimmed = (value || "").trim();
  if (min > 0 && trimmed.length === 0) {
    return `${fieldName} is required.`;
  }
  if (trimmed.length < min) {
    return `${fieldName} must be at least ${min} characters.`;
  }
  if (trimmed.length > max) {
    return `${fieldName} cannot exceed ${max} characters.`;
  }
  return null;
}

/**
 * Validates calendar date format and logical values.
 * Ensures the date is a real calendar date.
 */
export function validateDate(dateStr: string, allowPast = false): string | null {
  if (!dateStr || typeof dateStr !== "string") {
    return "Date is required.";
  }

  const timestamp = Date.parse(dateStr);
  if (isNaN(timestamp)) {
    return "Please provide a valid calendar date.";
  }

  if (!allowPast) {
    const inputDate = new Date(dateStr);
    const today = new Date();
    // Set hours to 0 to compare days only
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    if (inputDate < today) {
      return "Event date cannot be in the past.";
    }
  }

  return null;
}

/**
 * Validates event capacity is a valid positive integer.
 */
export function validateCapacity(capacity: any): string | null {
  const capNum = Number(capacity);
  if (isNaN(capNum) || !Number.isInteger(capNum) || capNum <= 0) {
    return "Capacity must be a positive whole number (at least 1).";
  }
  if (capNum > 100000) {
    return "Capacity cannot exceed 100,000 attendees.";
  }
  return null;
}

/**
 * Validates URL format if provided.
 */
export function validateUrl(url: string, fieldName = "URL", required = false): string | null {
  const val = (url || "").trim();
  if (!val) {
    return required ? `${fieldName} is required.` : null;
  }

  // Quick check for standard http/https URL scheme
  const urlRegex = /^(https?:\/\/)?([\w.-]+)+([\w\._~:\/?#\[\]@!\$&'\(\)\*\+,;=.-]+)*$/i;
  if (!urlRegex.test(val)) {
    return `Please enter a valid URL for ${fieldName}.`;
  }
  return null;
}

/**
 * Sanitizes user input to prevent XSS (Cross-Site Scripting) and injection vulnerabilities.
 * Supporting plain-text escaping and structured Markdown sanitization.
 */
export function sanitizeInput(
  value: string,
  mode: "text" | "markdown" | "none" = "text"
): string {
  if (!value || typeof value !== "string") return "";

  if (mode === "none") {
    return value.trim();
  }

  let result = value.trim();

  if (mode === "text") {
    // Escape all dangerous HTML entities
    return result
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  if (mode === "markdown") {
    // For markdown, we want to allow standard formatting but strip high-risk elements
    // like <script> tags, iframes, onload/onerror handlers, javascript: URIs, etc.
    result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    result = result.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
    result = result.replace(/\bon\w+\s*=/gi, "data-sanitized-event="); // Disable inline event handlers (e.g. onload=)
    result = result.replace(/javascript\s*:/gi, "disabled-javascript:"); // Disable JS scheme URIs
  }

  return result;
}
