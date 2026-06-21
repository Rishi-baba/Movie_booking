export const getImageUrl = (imageField) => {
  if (!imageField) return '';
  if (typeof imageField === 'string') return imageField;
  if (imageField.url) return imageField.url;
  return '';
};
