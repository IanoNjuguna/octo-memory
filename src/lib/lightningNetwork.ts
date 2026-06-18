export type LightningNetwork = 'mainnet' | 'testnet';

export function getInvoiceNetwork(invoice: string): LightningNetwork | null {
  const normalized = invoice.trim().toLowerCase();
  if (normalized.startsWith('lnbc')) return 'mainnet';
  if (normalized.startsWith('lntb')) return 'testnet';
  return null;
}

export function assertInvoiceNetwork(invoice: string, expectedNetwork: LightningNetwork): void {
  const invoiceNetwork = getInvoiceNetwork(invoice);

  if (!invoiceNetwork) {
    throw new Error('Lightning service returned an invoice with an unknown network prefix.');
  }

  if (invoiceNetwork !== expectedNetwork) {
    throw new Error(
      `Lightning service returned a ${invoiceNetwork} invoice while ZapQR is set to ${expectedNetwork}.`,
    );
  }
}
