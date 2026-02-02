export const formatMoney = (amount: number): string => {
  // single currency as per requirements; adjust locale/currency if needed
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount)
}
