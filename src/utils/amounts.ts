export function getReadableAmount(amount: number): string {

  if(!amount) return '0';
  const [integerPart, decimalPart] = amount.toString().split('.');

  // Format the integer part using Indian numbering system
  let formattedInteger = '';
  const lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);

  if (otherNumbers !== '') {
    formattedInteger =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    formattedInteger = lastThree;
  }

  // If there's a decimal part, attach it
  if (decimalPart) {
    return `${formattedInteger}.${decimalPart.slice(0, 2)}`; // limit to 2 decimal places
  }

  return formattedInteger;
}
