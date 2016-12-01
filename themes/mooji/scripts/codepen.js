// {% codepen userName|userId slugHash theme [defaultTab [height]] %}
hexo.extend.tag.register('codepen', function (args) {
    const [userName, userId] = args[0].split('|');
    const slugHash = args[1];
    const theme = args[2] === 'default' ? 0 : args[2];
    const defaultTab = args[3] != null ? args[3] : 'result';
    const height = args[4] != null ? args[4] : 300;

    return `
        <p data-height="${height}" data-theme-id="${theme}" data-slug-hash="${slugHash}" data-default-tab="${defaultTab}" data-user="${userId}" data-embed-version="2" data-pen-title="${slugHash}" class="codepen">
            See the Pen <a href="http://codepen.io/${userId}/pen/${slugHash}/">${slugHash}</a> by ${userName} (<a href="http://codepen.io/${userId}">@${userId}</a>) on <a href="http://codepen.io">CodePen</a>.
        </p>
    `;
});
