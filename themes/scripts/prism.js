hexo.extend.tag.register('prism', ([ language = 'js' ], content) => {
  content = content.replace(/</g, '&lt;');
  content = content.replace(/>/g, '&gt;');
  return `<pre><code class="language-${language}">${content}</code></pre>`;
}, {
  ends: true
});
