export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters except space and dash
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};
