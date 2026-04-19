/**
 * Dev stub for getPaymentSheetParams.
 * Replace with real network call when ready.
 */
export async function getPaymentSheetParams(_invoiceId?: string) {
  // return the shape your UI expects; in real app this should call your backend
  return {
    publishableKey: '',
    paymentIntent: '',
    ephemeralKey: '',
    customer: '',
  };
}

export default getPaymentSheetParams;
