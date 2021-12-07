const path = require('path');
const url_for = hexo.extend.helper.get('url_for').bind(hexo);

hexo.extend.tag.register('figure', function([ source, alt, caption, width ]) {
  const image = this.path.replace(/\d{4}\/\d{2}\/\d{2}\/([\w|-]+\/?)/g, '$1');
  return `
    <figure title="${alt}">
      <a href="${url_for(path.join('/images/', image, source))}" target="_blank">
        <img 
          src="${url_for(path.join('/images/', image, source))}" 
          alt="${alt || ''}" 
          style="${width ? `max-width:${width}` : ''}"
        >
      </a>
      ${caption ? `<figcaption>&lt;${caption}&gt;</figcaption>` : ''}
    </figure>
  `;
});
