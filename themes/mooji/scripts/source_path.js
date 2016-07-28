const _ = require('lodash');

hexo.extend.helper.register('source_path', function(type) {

    if (!type) {
        throw new Error('type is undefined.');
    }

    const name = this.theme.theme;
    const version = this.theme.version;
    const minified = this.env.env === 'production'? '.min' : '';

    if (type === 'css') {
        return this.css(`assets/css/${name}-${version}${minified}`);
    } else if (type === 'js') {
        const controller = _.chain(this.page)
            .keys()
            .find((k) => /^(__index|__post|archive|category|tag)$/g.test(k))
            .value()
            .replace('__', '');

        return this.js(`assets/js/${name}.${controller}-${version}${minified}`);
    }
});
