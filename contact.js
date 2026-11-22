/* contact.js – client-side validation for the contact form */
"use strict";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;   // name@domain.tld
const DIGITS_ONLY = /^\d+$/;

/** One validator per field: returns an error string, or "" when the value is fine. */
const validators = {
  name(value) {
    if (!value) return "Please enter your name.";
    return "";
  },
  email(value) {
    if (!value) return "Please enter your email address.";
    if (!EMAIL_PATTERN.test(value)) return "Enter a valid email, e.g. name@example.com.";
    return "";
  },
  phone(value) {
    if (!value) return "Please enter your phone number.";
    if (!DIGITS_ONLY.test(value)) return "Phone number must contain digits only (0–9).";
    return "";
  },
  message(value) {
    if (!value) return "Please write a message.";
    return "";
  },
};

function validateField(input) {
  const field = input.closest(".field");
  const error = validators[input.name](input.value.trim());
  document.getElementById(`${input.name}-error`).textContent = error;
  field.classList.toggle("invalid", Boolean(error));
  field.classList.toggle("valid", !error);
  input.setAttribute("aria-invalid", String(Boolean(error)));
  return !error;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const inputs = Array.from(form.querySelectorAll("input, textarea"));
  const success = document.getElementById("success");
  const counter = document.getElementById("char-count");
  const message = document.getElementById("message");

  // Validate each field when the user leaves it, then live as they correct it.
  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid")) validateField(input);
    });
  });

  // Block non-digit keystrokes in the phone box (validation still catches pasted text).
  document.getElementById("phone").addEventListener("keypress", (e) => {
    if (e.key.length === 1 && !/\d/.test(e.key)) {
      e.preventDefault();
      document.getElementById("phone-error").textContent = "Phone number must contain digits only (0–9).";
    }
  });

  message.addEventListener("input", () => {
    counter.textContent = `${message.value.length} / ${message.maxLength}`;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = inputs.map(validateField);            // validate everything (no short-circuit)
    const firstBad = inputs[results.indexOf(false)];
    if (firstBad) { firstBad.focus(); return; }

    // No server here (static site), so confirm to the user on-page.
    const sent = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      message: message.value.trim(),
    };
    form.reset();                                          // fires "reset", which hides old confirmation
    document.getElementById("s-name").textContent = sent.name;
    document.getElementById("s-email").textContent = sent.email;
    document.getElementById("s-phone").textContent = sent.phone;
    document.getElementById("s-message").textContent = sent.message;
    success.classList.add("show");
    success.focus();
    showToast("Message sent ✓");
  });

  form.addEventListener("reset", () => {
    success.classList.remove("show");
    inputs.forEach((i) => {
      i.closest(".field").classList.remove("valid", "invalid");
      document.getElementById(`${i.name}-error`).textContent = "";
    });
    counter.textContent = `0 / ${message.maxLength}`;
  });
});
