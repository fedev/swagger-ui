(function ($) {
  'use strict';

  var howareyou = window.howareyou = {};

  howareyou.gen_headers = gen_headers;
  howareyou.refresh_patient_ids = refresh_patient_ids;
  howareyou.set_config = set_config;
  howareyou.check_config = check_config;

  var auth, current_config;
  var credestials, header, form, inputs, login_form, login_status;
  var logged_in = false;

  var swagger_user = {
    patient_id:      "",
    consumer_key:    "",
    consumer_secret: ""
  };

  var user;

  $(function () {
    credestials = $('#howareyou_credestials');
    login_form = $('#howareyou_login_form');
    header = $('#howareyou_header');
    login_status = $('#howareyou_login_status');

    form = credestials.find('form');
    inputs = form.find('input');

    set_credestials_ui(swagger_user);

    inputs.on('blur', read_config_from_ui);

    $('#howareyou_show_credestials').click(function (event) {
      event.preventDefault();
      show(credestials);
    });

    $('#howareyou_show_login').click(function (event) {
      event.preventDefault();
      show(login_form);
    });

    $('#howareyou_hide_credestials').click(function () {
      hide(credestials);
    });

    $('#howareyou_hide_login').click(function () {
      hide(login_form);
    });

    $('#howareyou_login').click(function () {
      var email = $('#howareyou_email').val();
      var pass =  $('#howareyou_password').val();

      login(email, pass, function (status) {
        login_status.text(status);
      });
    });

    $('#howareyou_use_own_keys').click(function (event) {
      event.preventDefault();
    });

    $('#howareyou_use_default_keys').click(function (event) {
      event.preventDefault();
      set_credestials_ui(swagger_user);
    });
  });

  function gen_headers (obj) {
    return { Authorization: auth(obj.type, obj.url, obj.data) };
  }

  function login (email, password, set_status) {
    $.ajax({
      type: 'POST',
      url: 'https://api.howareyou.com/account/authenticate',
      data: {
        email: email,
        password: password
      }
    }).done(function (data) {
      if (set_config({
        patient_id:      data.consumer_token.user_id,
        consumer_key:    data.consumer_token.key,
        consumer_secret: data.consumer_token.secret
      })) {
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
    $('input[name="patient_id"]').val(id);
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
    logged_in = typeof config === 'object' &&
      config.consumer_key &&
      config.consumer_secret;

    if (logged_in) {
      set_logged_in();
    } else {
      set_logged_out();
    }

    return logged_in;
  }

  function show (modal) {
    modal
      .css('top', '-400px')
      .show()
      .animate({
        opacity: 1,
        top: 0
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

  function hide (modal) {
    modal.animate({
      opacity: 0,
      top: '-400px'
    }, function () {
      modal.hide();
    });
  }

})(jQuery);
