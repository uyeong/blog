hexo.extend.tag.register('alert', function([type, title], content) {
  const rendered = hexo.render.renderSync({ text: content, engine: 'markdown' });
  return `
    <div class="alert alert--${type || 'info'}">
      ${title ? `<strong class="alert__title">${title}</strong>` : ''}
      <div class="alert__body">
        ${rendered}
      </div>
    </div>
  `;
}, {
  ends: true
});
