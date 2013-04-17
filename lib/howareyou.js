(function ($) {
  var howareyou = window.howareyou = {};

  howareyou.gen_headers = gen_headers;
  howareyou.set_credestials = set_credestials;

  var auth;

  var swagger_user = {
    consumer_key:    "ea6d7475b6509f4150644c0823dd512a",
    consumer_secret: "0d26c7516c9dbf6d3a99ebb93477d74e"
  }

  $(function () {
    var credestials = $('#howareyou_credestials');
    var credestials_frame = credestials.find('.howareyou_frame');
    var header = $('#howareyou_header');
    var form = credestials.find('form');
    var inputs = form.find('input');

    set_credestials(swagger_user);
    set_credestials_ui(swagger_user);

    inputs.on('blur', function (event) {
      var config = {};
      inputs.each(function (index, field) {
        field = $(field);
        config[field.data('name')] = field.val();
      });
      set_credestials(config);
    });

    $('#howareyou_show_credestials').click(function (event) {
      event.preventDefault();
      show();
    });

    $('#howareyou_hide_credestials').click(function () {
      hide();
    });

    function show () {
      credestials.show();
      credestials.animate({
        opacity: 1,
        top: 0
      });
    }

    function hide () {
      credestials_frame.animate({});
      credestials.animate({
        opacity: 0,
        top: "-400px"
      }, function () {
        credestials.hide();
      });
    }
  });

  function gen_headers (obj) {
    return { Authorization: auth(obj.type, obj.url, obj.data) };
  }

  function set_credestials (config) {
    auth = ohauth.oh(config);
  }

  function set_credestials_ui (config) {
    var name, selector, field;

    for (name in config) {
      selector = '#howareyou_' + name;
      field = $(selector);
      field.val(config[name]);
      field.data('name', name);
    }
  }
})(jQuery);
