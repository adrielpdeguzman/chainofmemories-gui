$.ajaxSetup({
  headers: { 'Authorization': 'Bearer' + getAccessToken() }
});

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function updateURL(value) {
  var currentURL = window.location.pathname;
  var currentTitle = document.title;
  window.history.pushState('', '', currentURL.substring(0, currentURL
          .lastIndexOf('/') + 1)
          + value);
  document.title = currentTitle.substring(0, currentTitle.lastIndexOf(" ") + 1)
          + value;
}

function getCookie(name) {
  var re = new RegExp(name + '=([^;]+)');
  var value = re.exec(document.cookie);
  return (value != null) ? unescape(value[1]) : null;
}

function getAccessToken() {
  return getCookie("chainofmemories_access_token");
}

$(function() {
  $('.alert').delay(4000).slideUp(200, function() {
    $(this).alert('close');
  });
})