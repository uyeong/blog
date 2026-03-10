const url_for = hexo.extend.helper.get('url_for').bind(hexo);

hexo.extend.tag.register('figure', function([source, alt, caption, width]) {
  const src = url_for(`images/${this.slug}/${source}`);
  return `
    <figure title="${alt || ''}">
      <a href="${src}" target="_blank">
        <img src="${src}" alt="${alt || ''}"${width ? ` style="max-width:${width}"` : ''}>
      </a>
      ${caption ? `<figcaption>&lt;${caption}&gt;</figcaption>` : ''}
    </figure>
  `;
});
