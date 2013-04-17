(function () {
  window.howareyou_gen_headers = gen_headers;

  var auth = ohauth.oh({
    consumer_key:    "ea6d7475b6509f4150644c0823dd512a",
    consumer_secret: "0d26c7516c9dbf6d3a99ebb93477d74e"
  });

  function gen_headers (obj) {
    return { Authorization: auth(obj.type, obj.url, obj.data) };
  }
})();
