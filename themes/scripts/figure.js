const url_for = hexo.extend.helper.get('url_for').bind(hexo);

hexo.extend.tag.register('figure', function([source, alt, caption, width]) {
  const src = url_for(`images/${this.slug}/${source}`);
  const inlineStyle = width
    ? ` style="max-width:min(100%, ${width}); width:auto; height:auto;"`
    : '';

  return `
    <figure title="${alt || ''}">
      <a href="${src}" target="_blank">
        <img src="${src}" alt="${alt || ''}"${inlineStyle}>
      </a>
      ${caption ? `<figcaption>&lt;${caption}&gt;</figcaption>` : ''}
    </figure>
  `;
});
