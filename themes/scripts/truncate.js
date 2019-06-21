const truncate = require('truncate-html');

hexo.extend.helper.register('truncate', (content, length, options) => {
  return truncate(content, length, options);
});
