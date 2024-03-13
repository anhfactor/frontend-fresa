export function getReportValue(symbol, qty, isPrice) {
  if (isPrice && qty) {
    return `${symbol || '$'} ${qty}`;
  } else if (qty) {
    return qty;
  } else return '';
}
