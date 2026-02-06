export const formatMoney = (amount: number): string => {
  // single currency as per requirements; adjust locale/currency if needed
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount)
}
