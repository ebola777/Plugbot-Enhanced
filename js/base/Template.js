/**
 * Sub-class properties:
 * elements: element of id or class ex. {elTest: '#test'}
 * elementIds: id of element ex. {elTest: null}
 * ids: ids
 * classes: classes
 * events: events ex. 'click {{elTest}}': 'onClickTest'
 * template: handlebars template ex. '<p id={{elTest}}>TEST<\/p>'
 */

define('Plugbot/base/Template', [
    'handlebars',
    'Plugbot/views/utils/UiHelpers'
], function (Handlebars, UiHelpers) {
    'use strict';

    var View = Backbone.View.extend({
        options: function () {
            return {
                // the actual view
                view: undefined
            };
        },
        initialize: function () {
            _.bindAll(this, '_getElement', '_getId', '_getClass');
            this.rendered = false;
            this.cachedElements = false;
            this.precompiledHbs = undefined;
            this.settingsElem = undefined;
            this.memGetElement = _.memoize(this._getElement);
            this.memGetId = _.memoize(this._getId);
            this.memGetClass = _.memoize(this._getClass);
        },
        /**
         * Cache elements like this.$elA = this.$(this.elA)
         */
        cacheElements: function () {
            var elements = this.elements,
                view = this.options.view,
                key;

            for (key in elements) {
                if (elements.hasOwnProperty(key)) {
                    view['$' + key] = view.$(elements[key]);
                }
            }

            this.cachedElements = true;

            return this;
        },
        /**
         * Set element
         * @param {Object} settings     Settings
         */
        setSelf: function (settings) {
            this.options.view.setElement(this.getCompiledHbs(settings));
            this.rendered = true;

            return this;
        },
        /**
         * Set HTML
         * @param {Object} settings     Settings
         */
        setHtml: function (settings) {
            this.options.view.$el.html(this.getCompiledHbs(settings));
            this.rendered = true;

            return this;
        },
        /**
         * Set element IDs
         */
        setElementIds: function () {
            var key,
                value,
                view = this.options.view,
                elements = this.elements,
                elementIds = this.elementIds;

            for (key in elementIds) {
                if (elementIds.hasOwnProperty(key)) {
                    value = elementIds[key];

                    if (null === value) {
                        // use element id or class as data
                        value = elements[key];
                    }

                    if (this.cachedElements) {
                        view['$' + key].data('id', value);
                    } else {
                        view.$(elements[key]).data('id', value);
                    }
                }
            }
        },
        isRendered: function () {
            return this.rendered;
        },
        /**
         * Delegate events
         */
        delegateEvents: function () {
            var events = this.events,
                elements = this.elements,
                view = this.options.view,
                key,
                obj = view.events || {};

            for (key in events) {
                if (events.hasOwnProperty(key)) {
                    obj[Handlebars.compile(key)(elements)] = events[key];
                }
            }

            view.delegateEvents(obj);

            return this;
        },
        /**
         * Get name of a registered element
         * @param {string} key      Key
         */
        getElement: function (key) {
            return this.memGetElement(key);
        },
        getId: function (key) {
            return this.memGetId(key);
        },
        getClass: function (key) {
            return this.memGetClass(key);
        },
        /**
         * Get compiled handlebars html
         * @param {Object} settings     Settings
         * @return {string}     HTML
         */
        getCompiledHbs: function (settings) {
            var settingsElemCloned;

            this._precompile();
            this._prepareSettings();

            settingsElemCloned = _.clone(this.settingsElem);

            return this.precompiledHbs(
                _.defaults(settingsElemCloned, settings)
            );
        },
        _getElement: function (key) {
            var el = this.elements[key];

            return UiHelpers.getId(el) || UiHelpers.getClass(el);
        },
        _getId: function (key) {
            return UiHelpers.getId(this.ids[key]);
        },
        _getClass: function (key) {
            return UiHelpers.getClass(this.classes[key]);
        },
        /**
         * Precompile handlebars template
         * @private
         */
        _precompile: function () {
            if (undefined === this.precompiledHbs) {
                this.precompiledHbs = Handlebars.compile(this.template);
            }
        },
        /**
         * Prepare settings and store to this.settingsElem
         * @private
         */
        _prepareSettings: function () {
            var key, elements, obj;

            if (undefined === this.settingsElem) {
                elements = this.elements;

                obj = {};

                for (key in elements) {
                    if (elements.hasOwnProperty(key)) {
                        obj[key] = this._getElement(key);
                    }
                }

                this.settingsElem = obj;
            }
        }
    });

    return View;
});
