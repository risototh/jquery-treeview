/*
 * Async Treeview 0.1.1 - Lazy-loading extension for Treeview
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-treeview/
 *
 * Copyright Jörn Zaefferer
 * Released under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * jQuery 3 fixes and extensions by Richard Toth (risototh) <riso@iklub.sk>
 */

;(function($) {

function load(settings, root, child, container) {
	function createNode(parent) {
		var current = $("<li/>").attr("id", this.id || "").html("<span>" + this.text + "</span>").appendTo(parent);
		if (this.classes) {
			current.children("span").addClass(this.classes);
		}
  	current.addClass(this.expanded ? "open" : "closed");
		if (this.hasChildren || this.children && this.children.length) {
			var branch = $("<ul/>").appendTo(current);
			if (this.hasChildren) {
				current.addClass("hasChildren");
        if (this.showLoader) {
          createNode.call({
            classes: "placeholder",
            text: "&nbsp;",
            children:[]
          }, branch);
        }
			}
			if (this.children && this.children.length) {
        $.each(this.children, function(k,v){createNode.call(v, [branch]);});
			}
		}
	}
	$.ajax($.extend(true, {
		url: settings.url,
		dataType: "json",
		data: {
			root: root
		},
		success: function(response) {
			child.empty();
      $.each(response, function(k,v){createNode.call(v, [child]);});
      $(container).treeview({add: child});
      // remove expandability if returned empty dataset
      if (response.length == 0) {
        $('li#' + root)
          .replaceClass('collapsable', '')
          .replaceClass('lastCollapsable', 'last')
          .find('ul').remove();
        $('li#' + root)
          .find('div.hitarea').remove();
      }
      if (typeof(settings.callback) === 'function') settings.callback(root);
	  }
	}, settings.ajax));
}

var proxied = $.fn.treeview;
$.fn.treeview = function(settings) {
	if (!settings.url) {
		return proxied.apply(this, arguments);
	}
//	if (!settings.root) {
//		settings.root = "source";
//	}
	var container = this;
	if (!container.children().length)
		load(settings, /*settings.root*/ "source", this, container);
	var userToggle = settings.toggle;
	return proxied.call(this, $.extend({}, settings, {
		collapsed: true,
		toggle: function() {
			var $this = $(this);
			if ($this.hasClass("hasChildren")) {
				var childList = $this.removeClass("hasChildren").find("ul");
				load(settings, this.id, childList, container);
			}
			if (userToggle) {
				userToggle.apply(this, arguments);
			}
		}
	}));
};

})(jQuery);
