# Palette's Journal

## 2024-05-22 - Accessibility in Modal Interactions

**Learning:** When using modal dialogs for purchasing, icon-only buttons (like +/- for quantity) are often overlooked for accessibility. Screen reader users need explicit `aria-label`s to understand what these buttons do. Also, visual feedback like a spinner during async operations is crucial for perceived performance.

**Action:** Always audit modal interactions for keyboard accessibility and screen reader support. Use `Loader2` or similar spinners for async actions instead of static text.
