/**
 * Format the date to the format DD/MM/YYYY
 * @param dateString - The date to format
 * @returns The formatted date
 */
export const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Non renseigné';
    const newDate = new Date(dateString).toLocaleDateString('fr-FR');
    const cleanDate = newDate.split('T', 2);
    return cleanDate[0];
};

/**
 * Format the currency to the format €0
 * @param amount - The amount to format
 * @returns The formatted amount
 */
export const formatCurrency = (amount?: number | string) => {
    if (!amount || amount === 0) return '0 €';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numAmount);
};

/**
 * Format the year to the format YYYY
 * @param year - The year to format
 * @returns The formatted year
 */
export const formatYear = (year?: number | string) => {
    if (!year) return 'Non définie';
    const numYear = typeof year === 'string' ? parseInt(year) : year;
    if (isNaN(numYear) || numYear < 1900) return 'Année invalide';
    return numYear.toString();
};

/**
 * Format the percentage to the format 0%
 * @param percentage - The percentage to format
 * @returns The formatted percentage
 */
export const formatPercentage = (percentage?: number | string, decimalPlaces?: number) => {
    if (!percentage) return '0%';
    const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
    if (isNaN(numPercentage)) return '0%';
    return `${numPercentage.toFixed(decimalPlaces ?? 0)}%`;
};

/**
 * Format the number to the format 0
 * @param number - The number to format
 * @returns The formatted number
 */
export const formatNumber = (number?: number | string) => {
    if (!number) return '0';
    const numNumber = typeof number === 'string' ? parseFloat(number) : number;
    if (isNaN(numNumber)) return '0';
    return numNumber.toFixed(0);
};

/**
 * Format the date to the format DD/MM/YYYY HH:MM
 * @param dateString - The date to format
 * @returns The formatted date
 */
export const formatDateTime = (dateString?: string | Date) => {
    if (!dateString) return 'Non renseigné';
    const newDate = new Date(dateString).toLocaleDateString('fr-FR');
    const cleanDate = newDate.split('T', 2);
    return `${cleanDate[0]} à ${cleanDate[1]}`;
};
