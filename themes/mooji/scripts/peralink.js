hexo.extend.filter.register('post_permalink', function(data){
    return data.replace(/\d{4}\/([\w|-]+\/)$/g, '$1');
});
