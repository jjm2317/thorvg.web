export const IS_BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';

export const getDefaultDPR = (): number => {
  if (IS_BROWSER && window.devicePixelRatio) {
    return window.devicePixelRatio;
  }
  return 1;
};

export const isElementInViewport = (element: Element): boolean => {
  if (!IS_BROWSER) return true;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}; 