export const isPlainKey = (event) => !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);

export function trapFocus(event, container) {
  const focusable = [...container.querySelectorAll("a[href], button:not(:disabled)")];
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  const active = document.activeElement;
  if (!container.contains(active) || (event.shiftKey && active === first)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
