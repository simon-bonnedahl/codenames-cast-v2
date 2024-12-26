declare global {
    interface Window {
      cast: typeof cast;
    }
  
    const cast: any; // Alternatively, use `typeof cast.framework` if you want type checking.
  }
  
  export {};