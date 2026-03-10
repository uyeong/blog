// {% codepen user slugHash [defaultTab] [height] %}
hexo.extend.tag.register('codepen', function(args) {
  const user = args[0];
  const slug = args[1];
  const defaultTab = args[2] || 'result';
  const height = args[3] || 300;
  return `
    <iframe
      height="${height}"
      style="width: 100%;"
      scrolling="no"
      title="CodePen Embed"
      src="https://codepen.io/${user}/embed/${slug}?default-tab=${defaultTab}&theme-id=dark"
      frameborder="no"
      loading="lazy"
      allowtransparency="true"
      allowfullscreen="true">
    </iframe>
  `;
});
