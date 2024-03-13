export default function getTranslationFields(
  languages,
  values,
  field = 'title'
) {
  const list = languages
    .filter((item) => values[`${field}[${item.locale}]`])
    .map((item) => ({
      [item.locale]: values[`${field}[${item.locale}]`],
    }));
  return Object.assign({}, ...list);
}
