'use-strict';

const SearchView = require('views/search');
const template = require('./templates/left_panel');

module.exports = Mn.View.extend({
  tagName: 'aside',
  className: 'drawer',
  template: template,

  behaviors: {
    Toggle: {},
  },

  ui: {},

  triggers: {
    //eslint-disable-next-line
    'click': 'expand',
  },
  regions: {
    search: '.search',
  },

  onRender: function () {
    this.showChildView('search', new SearchView());
    // Listen to toggle from responsive topbar button toggle-drawer.
    $('.toggle-drawer').click(() => this.triggerMethod('toggle'));
  },
});
