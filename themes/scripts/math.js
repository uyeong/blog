hexo.extend.tag.register('math', function(args, content) {
  return `<p>$$${content}$$</p>`;
}, { ends: true });
