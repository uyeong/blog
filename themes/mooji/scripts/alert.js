const _ = require('lodash');
const marked = require('marked');

hexo.extend.tag.register('alert', function(args) {
    const type = args[0];
    let title = args[1];
    let message = args[2];

    if (!message) {
        message = title;
        title = '';
    }

    return `
        <div class="alert alert--${type}">
            <div class="alert__inner">
                ${title ? `
                    <div class="alert__title">
                        <strong>${title}</strong>
                    </div>
                ` : ''}
                <div class="alert__body">
                    ${marked(message)}
                </div>
            </div>
        </div>
    `;
});
