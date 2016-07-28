class PageNavigation {
    constructor(element) {
        this.wrapper = element;

        this._assignElements();
        this._bindListeners();
        this._setupNavigation();
    }

    _assignElements() {
        this.list = this.wrapper.find('.page-navigation__list');
        this.items = this.wrapper.find('.page-navigation__item');
        this.prev = this.wrapper.find('.page-navigation__prev');
        this.next = this.wrapper.find('.page-navigation__next');
    }

    _bindListeners() {
        this.wrapper.on('click', '.page-navigation__pick', this._onClickNavPick.bind(this));
    }

    _setupNavigation() {
        const items = this.items;
        const current = items.find('.page-navigation__pick.on').data('page');

        this.range = _.range(0, _.multiply(_.ceil(items.length / 5), 5) + 1, 5);
        this.end = _.find(this.range, (i) => current <= i);
        this.start = this.end - 5;

        this.list
            .empty()
            .append(_.slice(items, this.start, this.end));

        if (this._isFirstRange()) {
            this.prev.addClass('disabled');
        }

        if (this._isLastRange()) {
            this.next.addClass('disabled');
        }
    }

    _onClickNavPick(event) {
        event.preventDefault();

        const target = $(event.currentTarget);
        const direction = target.data('page');

        if (target.hasClass('on') ||
            direction === 'prev' && this._isFirstRange() ||
            direction === 'next' && this._isLastRange()) {
            return;
        }

        if (_.isNumber(direction)) {
            this._gotoPageBy(direction);
        } else {
            this._gotoPageBy(direction === 'prev'? this.start : this.end + 1);
        }
    }

    _gotoPageBy(pageNum) {
        const path = window.location.pathname.replace(/page\/\d+\/?/g, '');

        if (pageNum === 1) {
            window.location.href = path;
        } else {
            window.location.href = path + 'page/' + pageNum;
        }
    }

    _isFirstRange() {
        return this.end === this.range[1];
    }

    _isLastRange() {
        return this.end === _.last(this.range);
    }
}

export default PageNavigation;
