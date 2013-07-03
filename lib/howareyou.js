(function ($) {
  'use strict';

  var howareyou = window.howareyou = {};

  var API_HOST = '';

  if (/^(((\d+\.){3}(\d+))|localhost)$/.test(location.hostname)) {
    API_HOST = '//' + location.hostname + ':3000';
  }

  howareyou.API_HOST = API_HOST;

  howareyou.gen_headers = gen_headers;
  howareyou.refresh_user_ids = refresh_user_ids;
  howareyou.set_config = set_config;
  howareyou.check_config = check_config;

  var AUTHENTICATE_ENDPOINT = API_HOST + '/users/authenticate';
  var REGISTER_ENDPOINT     = API_HOST + '/users/register';

  var auth, current_config;
  var current_modal;
  var form, credestials_inputs, login_status, register_status;
  var logged_in = false;

  var swagger_user = {
    user_id:         "demo",
    consumer_key:    "ea6d7475b6509f4150644c0823dd512a",
    consumer_secret: "0d26c7516c9dbf6d3a99ebb93477d74e"
  };

  var user;

  $(function () {
    credestials_inputs = $('#howareyou_credestials form input');
    login_status = $('#howareyou_login_status');
    register_status = $('#howareyou_register_status');

    set_credestials_ui(swagger_user);

    // Read config from credestials automatically on blur.
    credestials_inputs.on('blur', read_config_from_ui);

    $('#howareyou_use_own_keys').click(function (event) {
      event.preventDefault();
      if (user) {
        set_config(user);
      } else {
        show('#howareyou_login_modal');
      }
    });

    $('#howareyou_login_modal form').submit(function (event) {
      event.preventDefault();
      var data = $(this).serializeArray();

      post(AUTHENTICATE_ENDPOINT, data, function () {
        $('#howareyou_login_password').val('');
        show('#howareyou_credestials');
      }, function (error) {
        login_status.text(error.password || error.email ?
                          'Invalid email or password' : error);
      });
    });

    $('#howareyou_register_modal form').submit(function (event) {
      event.preventDefault();
      register_status.text('Registering...');

      var pass1 = $('#howareyou_register_password');
      var pass2 = $('#howareyou_register_password2');

      if (pass1.val() !== pass2.val()) {
        register_status.text('Passwords differ.');
        return;
      }

      var data = $(this).serializeArray();
      post(REGISTER_ENDPOINT, data, function () {
        pass1.val('');
        pass2.val('');
        show('#howareyou_credestials');
      }, function (error) {
        register_status.text(
          error.first_name ? 'Invalid first name.' :
          error.last_name  ? 'Invalid last name.'  :
          error.email      ? 'Invalid email.'      :
          error.password   ? 'Invalid password.'   :
          error);
      });
    });

    $('#howareyou_logout').click(function (event) {
      event.preventDefault();

      user = undefined;

      set_config(swagger_user);
    });

    $('#howareyou_use_default_keys').click(function (event) {
      event.preventDefault();
      set_credestials_ui(swagger_user);
    });

    // Iterate over elements in the header and show corresponding
    // modals on click.
    [{
      select: '#howareyou_show_credestials',
      show:   '#howareyou_credestials',
      focus:  '#howareyou_user_id'
    }, {
      select: '#howareyou_show_login',
      show:   '#howareyou_login_modal',
      focus:  '#howareyou_login_email'
    }, {
      select: '#howareyou_show_register',
      show:   '#howareyou_register_modal',
      focus:  '#howareyou_register_first_name'
    }].forEach(function (options) {
      $(options.select).click(function (event) {
        event.preventDefault();
        show(options.show);
        if (options.focus) {
          $(options.focus).focus();
        }
      });
    });

    $(window).on('keydown', function (event) {
      if (event.keyCode == 27) hide_current();
    });

    $('.howareyou_hide_modal').click(function (event) {
      event.preventDefault();
      hide_current();
    });
  });

  function gen_headers (obj) {
    return { Authorization: auth(obj.type, obj.url, obj.data) };
  }

  function post (endpoint, data, success, error) {
    $.ajax({
      type: 'POST',
      url:   endpoint,
      data:  data
    }).done(function (data) {
      user = {
        user_id:         data.consumer_token.user_id,
        consumer_key:    data.consumer_token.key,
        consumer_secret: data.consumer_token.secret
      };

      if (set_config(user)) {
        success(user);
      } else {
        error('Problem with configuration. Please report a bug.');
      }
    }).fail(function (xhr, _, status) {
      var response = {};

      try {
        response = JSON.parse(xhr.responseText);
      } catch (e) {}

      error(response.errors || response.error || status);
    });
  }

  function read_config_from_ui (event) {
    var config = {};
    credestials_inputs.each(function (index, field) {
      field = $(field);
      config[field.data('name')] = $.trim(field.val());
    });
    set_credestials_ui(config);
  }

  function set_credestials (config) {
    current_config = config;
    auth = ohauth.headerGenerator(config);
  }

  function set_credestials_ui (config) {
    var name, selector, field;

    set_user_ids(config.user_id);
    set_credestials(config);

    for (name in config) {
      selector = '#howareyou_' + name;
      field = $(selector);
      field.val(config[name]);
      field.data('name', name);
    }
  }

  function set_user_ids (id) {
    $('input[name="user_id"], input[name="patient_id"], input[name="customer_id"]').val(id);
  }

  function refresh_user_ids () {
    set_user_ids(current_config.user_id);
  }

  function set_config (config) {
    if (!check_config(config)) {
      return false;
    }

    current_config = config;
    set_credestials_ui(config);
    return true;
  }

  function check_config (config) {
    if (user) {
      set_logged_in();
    } else {
      set_logged_out();
    }

    var ok = typeof config === 'object' &&
      config.consumer_key &&
      config.consumer_secret;

    return ok;
  }

  function show (modal) {
    hide_current();

    modal = $(modal);

    current_modal = modal;

    modal
      .css('top', '-400px')
      .show()
      .animate({
        opacity: 1,
        top: 0
      });
  }

  function hide (modal) {
    current_modal = undefined;

    modal.animate({
      opacity: 0,
      top: '-400px'
    }, function () {
      modal.hide();
    });
  }

  function hide_current () {
    if (current_modal) hide(current_modal);
  }

  function set_logged_in () {
    $('.howareyou_logged_in').show();
    $('.howareyou_demo').hide();
  }

  function set_logged_out () {
    $('.howareyou_logged_in').hide();
    $('.howareyou_demo').show();
  }

})(jQuery);
