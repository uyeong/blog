const path = require('path');
const _ = require('lodash');

hexo.extend.tag.register('figure', function(args) {
    const source = args[0];
    const alt = args[1];
    const caption = args[2];

    return `
        <figure title="${alt}">
          <img src="${path.join('/assets/img', this.path, source)}" alt="${alt || ''}">
          <figcaption>&lt;${caption || ''}&gt;</figcaption>
        </figure>
    `;
});
