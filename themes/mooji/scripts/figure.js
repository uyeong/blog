const path = require('path');

hexo.extend.tag.register('figure', function(args) {
    const source = args[0];
    const alt = args[1];
    const caption = args[2];
    const width = args[3] ? `max-width:${args[3]}` : '';
    const image = this.path.replace(/(\d{4}\/)\d{2}\/\d{2}\/([\w|-]+\/?)/g, '$1$2');

    return `
        <figure title="${alt}">
          <img 
              src="${path.join('/assets/img', image, source)}" 
              alt="${alt || ''}" 
              style="${width}"
          >
          <figcaption>&lt;${caption || ''}&gt;</figcaption>
        </figure>
    `;
});
