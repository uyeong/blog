const marked = require('marked');
const types = [ 'info', 'success', 'warning', 'danger' ];

hexo.extend.tag.register('alert', ([ type, title = '' ], content) => {
  if (types.indexOf(type) === -1 && type !== undefined) {
    title = type;
    type = undefined;
  }
  return `
    <div class="alert${type ? ` alert--${type}` : ''}">
      ${title && `
        <strong class="alert__title">
          ${title}
        </strong>
      `}
      <div class="alert__body">
        ${marked(content)}
      </div>
    </div>
  `;
}, {
  ends: true
});
