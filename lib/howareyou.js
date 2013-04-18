(function ($) {
  'use strict';

  var howareyou = window.howareyou = {};

  howareyou.gen_headers = gen_headers;
  howareyou.refresh_patient_ids = refresh_patient_ids;
  howareyou.set_config = set_config;
  howareyou.check_config = check_config;

  var chid_jsonp_url = '//localhost:9007/current_user/tokens?callback=howareyou.';

  var auth, current_config;
  var credestials, header, form, inputs;
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
    form = credestials.find('form');
    inputs = form.find('input');

    query_chid();

    set_credestials_ui(swagger_user);

    inputs.on('blur', read_config_from_ui);

    $('#howareyou_show_credestials').click(function (event) {
      event.preventDefault();
      query_chid('check_config');
      show(credestials);
    });

    $('#howareyou_hide_credestials').click(function () {
      hide(credestials);
    });

    $('#howareyou_use_own_keys').click(function (event) {
      event.preventDefault();
      query_chid(null, true);
    });

    $('#howareyou_use_default_keys').click(function (event) {
      event.preventDefault();
      set_credestials_ui(swagger_user);
    });
  });

  function gen_headers (obj) {
    return { Authorization: auth(obj.type, obj.url, obj.data) };
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
    auth = ohauth.oh(config);
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
      return;
    }

    current_config = config;
    set_credestials_ui(config);
  }

  function check_config (config) {
    logged_in = typeof config === 'object' &&
      config.consumer_key &&
      config.consumer_secret;

    if (logged_in) {
      set_logged_in();
    }

    return logged_in;
  }

  function query_chid (callback_name, interactive) {
    callback_name = callback_name || 'set_config';

    var script = document.createElement('script');
    script.src = chid_jsonp_url + callback_name;

    if (interactive) {
      script.onload = function () {
        if (!logged_in) {
          log_in_alert();
        }
      }
    }

    document.body.appendChild(script);
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
