(function ($) {
  var howareyou = window.howareyou = {};

  howareyou.gen_headers = gen_headers;
  howareyou.refresh_patient_ids = refresh_patient_ids;
  howareyou.set_config = set_config;

  var chid_jsonp_url = '/lib/test_config.js'

  var auth;

  var swagger_user = {
    patient_id:      7,
    consumer_key:    "ea6d7475b6509f4150644c0823dd512a",
    consumer_secret: "0d26c7516c9dbf6d3a99ebb93477d74e"
  };

  var current_config;

  $(function () {
    var credestials = $('#howareyou_credestials');
    var header = $('#howareyou_header');
    var form = credestials.find('form');
    var inputs = form.find('input');

    query_chid();

    set_credestials_ui(swagger_user);

    inputs.on('blur', function (event) {
      var config = {};
      inputs.each(function (index, field) {
        field = $(field);
        config[field.data('name')] = $.trim(field.val());
      });
      set_credestials_ui(config);
    });

    $('#howareyou_show_credestials').click(function (event) {
      event.preventDefault();
      show(credestials);
    });

    $('#howareyou_hide_credestials').click(function () {
      hide(credestials);
    });

    $('#howareyou_use_own_keys').click(function (event) {
      event.preventDefault();
      query_chid();
    });

    $('#howareyou_use_default_keys').click(function (event) {
      event.preventDefault();
      set_credestials_ui(swagger_user);
    });
  });

  function gen_headers (obj) {
    return { Authorization: auth(obj.type, obj.url, obj.data) };
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
    if (typeof config !== 'object' &&
        !config.consumer_key &&
        !config.consumer_secret)  {
      return;
    }

    current_config = config;
    set_credestials_ui(config);
  }

  function query_chid () {
    var script = document.createElement('script');
    script.src = chid_jsonp_url;
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

  function hide (modal) {
    modal.animate({
      opacity: 0,
      top: '-400px'
    }, function () {
      modal.hide();
    });
  }

})(jQuery);
