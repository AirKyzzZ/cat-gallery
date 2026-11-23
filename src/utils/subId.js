const SUB_ID_KEY = "cat-gallery:sub-id";

export function getSubId() {
  const saved = localStorage.getItem(SUB_ID_KEY);
  if (saved) return saved;
  const created = crypto.randomUUID();
  localStorage.setItem(SUB_ID_KEY, created);
  return created;
}
