
export const profileCacheUtils = {
  clearCache: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('profileFailedAttempts');
    }
  },
  
  clearSpecificProfile: (userId) => {
    if (typeof window !== 'undefined') {
      const failed = JSON.parse(localStorage.getItem('profileFailedAttempts') || '[]');
      const filtered = failed.filter(id => id !== userId);
      localStorage.setItem('profileFailedAttempts', JSON.stringify(filtered));
    }
  }
};