(function ($) {
  'use strict';

  var howareyou = window.howareyou = {};

  howareyou.gen_headers = gen_headers;
  howareyou.refresh_patient_ids = refresh_patient_ids;
  howareyou.set_config = set_config;
  howareyou.check_config = check_config;

  var AUTHENTICATE_ENDPOINT = 'http://chid.howareyou.com/account/authenticate';

  var auth, current_config;
  var current_modal;
  var credestials, header, form, inputs, login_form, login_status;
  var logged_in = false;

  var swagger_user = {
    patient_id:      "demo",
    consumer_key:    "ea6d7475b6509f4150644c0823dd512a",
    consumer_secret: "0d26c7516c9dbf6d3a99ebb93477d74e"
  };

  var user;

  $(function () {
    credestials = $('#howareyou_credestials');
    header = $('#howareyou_header');
    login_form = $('#howareyou_login_form');
    login_status = $('#howareyou_login_status');

    form = credestials.find('form');
    inputs = form.find('input');

    set_credestials_ui(swagger_user);

    inputs.on('blur', read_config_from_ui);

    $('#howareyou_show_credestials').click(function (event) {
      event.preventDefault();
      hide(login_form);
      show(credestials);
    });

    $('#howareyou_show_login').click(function (event) {
      event.preventDefault();
      hide(credestials);
      show(login_form);
    });

    $('#howareyou_use_own_keys').click(function (event) {
      event.preventDefault();
      if (user) {
        set_config(user);
      } else {
        hide(credestials);
        show(login_form);
      }
    });

    $('#howareyou_hide_credestials').click(function () {
      hide(credestials);
    });

    $('#howareyou_hide_login').click(function () {
      hide(login_form);
    });

    $('#howareyou_login').click(function (event) {
      event.preventDefault();
      var email = $('#howareyou_email').val();
      var pass =  $('#howareyou_password').val();

      login(email, pass, function (status) {
        login_status.text(status);
      });
    });

    $('#howareyou_logout').click(function (event) {
      event.preventDefault();

      user = undefined;

      set_config(swagger_user);
      hide(login_form);
      show(credestials);
    });

    $('#howareyou_use_default_keys').click(function (event) {
      event.preventDefault();
      set_credestials_ui(swagger_user);
    });

    $(window).on('keydown', function (event) {
      if (event.keyCode == 27 && current_modal) {
        hide(current_modal);
      }
    });

  });

  function gen_headers (obj) {
    return { Authorization: auth(obj.type, obj.url, obj.data) };
  }

  function login (email, password, set_status) {
    $.ajax({
      type: 'POST',
      url: AUTHENTICATE_ENDPOINT,
      data: {
        email: email,
        password: password
      }
    }).done(function (data) {
      user = {
        patient_id:      data.consumer_token.user_id,
        consumer_key:    data.consumer_token.key,
        consumer_secret: data.consumer_token.secret
      };

      if (set_config(user)) {
        $('#howareyou_password').val('');
        hide(login_form);
        show(credestials);
      } else {
        set_status('Problem with configuration. Report a bug.');
      }
    }).fail(function (xhr, status, error) {
      set_status('Wrong email or password');
    });
  }

  function read_config_from_ui (event) {
    var config = {};
    inputs.each(function (index, field) {
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

    set_patient_ids(config.patient_id);
    set_credestials(config);

    for (name in config) {
      selector = '#howareyou_' + name;
      field = $(selector);
      field.val(config[name]);
      field.data('name', name);
    }
  }

  function set_patient_ids (id) {
    $('input[name="patient_id"], input[name="user_id"], input[name="customer_id"]').val(id);
  }

  function refresh_patient_ids () {
    set_patient_ids(current_config.patient_id);
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
    modal.animate({
      opacity: 0,
      top: '-400px'
    }, function () {
      modal.hide();
    });
  }

  function set_logged_in () {
    $('.howareyou_logged_in').show();
    $('.howareyou_demo').hide();
  }

  function set_logged_out () {
    $('.howareyou_logged_in').hide();
    $('.howareyou_demo').show();
  }

  function log_in_alert () {
    alert('You are not logged in.\nUse "Sign in" link on the top bar.');
    set_credestials_ui(swagger_user);
 }

})(jQuery);
