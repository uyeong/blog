const path = require('path');
const _ = require('lodash');

hexo.extend.tag.register('figure', function(args) {
    const source = args[0];
    const width = !Number.isNaN(+args[1]) ? parseInt(args[1], 10) : 'auto';
    const height = !Number.isNaN(+args[2]) ? parseInt(args[2], 10) : 'auto';
    var alt = '';
    var caption = '';

    if (width === 'auto') {
        alt = args[1];
        caption = args[2];
    } else if (width !== 'auto' && height === 'auto') {
        alt = args[2];
        caption = args[3];
    } else if (width !== 'auto' && height !== 'auto') {
        alt = args[3];
        caption = args[4];
    }

    return `
        <figure title="${alt}">
          <img src="${path.join('/assets/img', this.path, source)}" alt="${alt || ''}" width="${width}" height="${height}">
          <figcaption>&lt;${caption || ''}&gt;</figcaption>
        </figure>
    `;
});
