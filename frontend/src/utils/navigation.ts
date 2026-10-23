// Client-side SPA navigation utility supporting smooth pushState transitions
export function navigateTo(path: string) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  // Dispatch custom event to notify listeners
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function getCurrentPath(): string {
  return window.location.pathname;
}
