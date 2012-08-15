(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"initialize": function(exports, require, module) {
  var StallForm, Stalls, StallsView, _ref, _ref1;

  if ((_ref = this.Farm) == null) {
    this.Farm = {};
  }

  _ref1 = require('./views/stalls'), Stalls = _ref1.Stalls, StallsView = _ref1.StallsView, StallForm = _ref1.StallForm;

  $(function() {
    Farm.stalls = new Stalls;
    Farm.stallsView = new StallsView({
      collection: Farm.stalls
    });
    Farm.stallsFormView = new StallForm;
    return Farm.stalls.fetch({
      add: true
    });
  });
  
}});

window.require.define({"routers/app_router": function(exports, require, module) {
  var AppRouter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = AppRouter = (function(_super) {

    __extends(AppRouter, _super);

    function AppRouter() {
      return AppRouter.__super__.constructor.apply(this, arguments);
    }

    AppRouter.prototype.routes = {
      '': function() {}
    };

    return AppRouter;

  })(Backbone.Router);
  
}});

window.require.define({"views/forms": function(exports, require, module) {
  var FormView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = FormView = (function(_super) {

    __extends(FormView, _super);

    function FormView() {
      this.validation = __bind(this.validation, this);

      this.reset = __bind(this.reset, this);

      this.success = __bind(this.success, this);

      this.created = __bind(this.created, this);

      this.pending = __bind(this.pending, this);

      this.wrapSuccess = __bind(this.wrapSuccess, this);

      this.submit = __bind(this.submit, this);

      this.formdata = __bind(this.formdata, this);

      this.url = __bind(this.url, this);

      this.method = __bind(this.method, this);

      this.serialize = __bind(this.serialize, this);
      return FormView.__super__.constructor.apply(this, arguments);
    }

    FormView.prototype.events = {
      "submit": "submit"
    };

    FormView.prototype.serialize = function() {
      var field, form, _i, _len, _ref;
      form = {};
      _ref = this.fields;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        form[field] = ($(":input[name=" + field + "]", this.el)).val();
      }
      return form;
    };

    FormView.prototype.method = function() {
      return ($(this.el)).attr("method");
    };

    FormView.prototype.url = function() {
      return ($(this.el)).attr("action");
    };

    FormView.prototype.formdata = function() {
      return {};
    };

    FormView.prototype.submit = function(event) {
      event.preventDefault();
      return $.ajax({
        contentType: "application/json",
        dataType: "json",
        url: this.url(),
        type: this.method(),
        data: JSON.stringify(_.extend(this.serialize(), this.formdata())),
        success: this.success,
        error: this.error,
        statusCode: {
          422: this.validation,
          202: this.wrapSuccess(this.pending),
          201: this.wrapSuccess(this.created),
          200: this.wrapSuccess(this.success)
        }
      });
    };

    FormView.prototype.wrapSuccess = function(callback) {
      var that;
      that = this;
      return function(data, status, xhr) {
        that.reset();
        return callback(data, status, xhr);
      };
    };

    FormView.prototype.pending = function() {
      return {};
    };

    FormView.prototype.created = function() {
      return {};
    };

    FormView.prototype.success = function() {
      return {};
    };

    FormView.prototype.reset = function() {
      ($(".control-group.error", this.el)).removeClass("error");
      return ($(".help-inline", this.el)).empty();
    };

    FormView.prototype.validation = function(xhr, status, error) {
      var errors, field, message;
      errors = (JSON.parse(xhr.responseText)).errors;
      if (errors == null) {
        return;
      }
      this.reset();
      for (field in errors) {
        message = errors[field];
        ($(":input[name=" + field + "]", this.el)).focus().siblings(".help-inline").html(message).parents(".control-group:first").addClass("error");
        return field;
      }
    };

    return FormView;

  })(Backbone.View);
  
}});

window.require.define({"views/stalls": function(exports, require, module) {
  var FormView, StallForm, StallView, Stalls, StallsView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  FormView = require('./forms');

  exports.Stalls = Stalls = (function(_super) {

    __extends(Stalls, _super);

    function Stalls() {
      return Stalls.__super__.constructor.apply(this, arguments);
    }

    Stalls.prototype.url = '/stalls';

    Stalls.prototype.parse = function(response) {
      return response.stalls;
    };

    return Stalls;

  })(Backbone.Collection);

  exports.StallsView = StallsView = (function(_super) {

    __extends(StallsView, _super);

    function StallsView() {
      this.add = __bind(this.add, this);
      return StallsView.__super__.constructor.apply(this, arguments);
    }

    StallsView.prototype.el = ".signups ul";

    StallsView.prototype.initialize = function(options) {
      return this.collection.bind("add", this.add);
    };

    StallsView.prototype.add = function(model) {
      var view;
      view = new StallView({
        model: model
      });
      return ($(this.el)).prepend(view.render().el);
    };

    return StallsView;

  })(Backbone.View);

  exports.StallView = StallView = (function(_super) {

    __extends(StallView, _super);

    function StallView() {
      this.render = __bind(this.render, this);
      return StallView.__super__.constructor.apply(this, arguments);
    }

    StallView.prototype.tagName = "li";

    StallView.prototype.template = require("./templates/stall");

    StallView.prototype.render = function() {
      ($(this.el)).html(this.template(this.model.toJSON()));
      return this;
    };

    return StallView;

  })(Backbone.View);

  exports.StallForm = StallForm = (function(_super) {

    __extends(StallForm, _super);

    function StallForm() {
      this.created = __bind(this.created, this);
      return StallForm.__super__.constructor.apply(this, arguments);
    }

    StallForm.prototype.el = "form";

    StallForm.prototype.method = function() {
      return "POST";
    };

    StallForm.prototype.url = function() {
      return "/stalls";
    };

    StallForm.prototype.fields = ['description', 'email', 'name', 'entity'];

    StallForm.prototype.events = {
      "submit": "submit"
    };

    StallForm.prototype.created = function(data) {
      Farm.stallsView.add(new Backbone.Model(data));
      return ($(this.el)).fadeOut("slow").html("Takk!").fadeIn();
    };

    return StallForm;

  })(FormView);
  
}});

window.require.define({"views/templates/stall": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
      
        __out.push('<p>');
      
        __out.push(__sanitize(this.description));
      
        __out.push('</p>\n');
      
        if (this.entity === "business") {
          __out.push('\n    <cite>');
          __out.push(__sanitize(this.name));
          __out.push('</cite>\n');
        }
      
        __out.push('\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

