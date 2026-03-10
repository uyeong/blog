const types = [ 'info', 'success', 'warning', 'danger' ];

hexo.extend.tag.register('alert', function([ type, title = '' ], content) {
  if (types.indexOf(type) === -1 && type !== undefined) {
    title = type;
    type = undefined;
  }
  const rendered = hexo.render.renderSync({ text: content, engine: 'markdown' });
  return `
    <div class="alert${type ? ` alert--${type}` : ''}">
      ${title && `
        <strong class="alert__title">
          ${title}
        </strong>
      `}
      <div class="alert__body">
        ${rendered}
      </div>
    </div>
  `;
}, {
  ends: true
});
