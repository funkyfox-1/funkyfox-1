// Type declarations for @cashfreepayments/cashfree-js

declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeInitOptions {
    mode: 'sandbox' | 'production';
  }

  export interface CashfreeCheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: '_modal' | '_self' | '_blank';
    values?: Record<string, any>;
  }

  export interface CashfreeInstance {
    checkout(options: CashfreeCheckoutOptions): Promise<any>;
    initialise(options: CashfreeInitOptions): Promise<CashfreeInstance>;
    [key: string]: any;
  }

  export function load(options: CashfreeInitOptions): Promise<CashfreeInstance>;
}

