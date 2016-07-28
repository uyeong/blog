hexo.extend.tag.register('prism', function(args) {
    const language = args[0];
    var code = args[1];

    code = code.replace(/</g, '&lt;');
    code = code.replace(/>/g, '&gt;');

    return `<pre><code class="language-${language}">${code}</code></pre>`;
});
