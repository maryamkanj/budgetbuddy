// Exchange rate: 1 USD = 89,699.58 LBP
export const EXCHANGE_RATE = 89699.58;

export const convertToUSD = (amount: number, currency: 'USD' | 'LBP'): number => {
  if (currency === 'LBP') {
    return amount / EXCHANGE_RATE;
  }
  return amount;
};

export const formatCurrency = (amount: number, currency: 'USD' | 'LBP'): string => {
  if (currency === 'LBP') {
    return `LBP ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
