const _ = require('lodash');
const marked = require('marked');
const ICON_TYPE = {
    success: "check-circle",
    info: "info-circle",
    warning: "exclamation-triangle",
    danger: "exclamation-circle"
};

hexo.extend.tag.register('alert', function(args) {
    const type = args[0];
    const title = args[1];
    const message = args[2] || '';
    const icon = ICON_TYPE[type];

    return `
        <div class="alert alert--${type}">
            <div class="alert__inner">
                <div class="alert__title">
                    <strong>${title}</strong>
                </div>
                <div class="alert__body">
                    ${marked(message)}
                </div>
            </div>
        </div>
    `;
});
