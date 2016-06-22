$.ajaxSetup({
  headers: { 'Authorization': 'Bearer' + getAccessToken() }
});

function getCookie(name) {
  var re = new RegExp(name + "=([^;]+)");
  var value = re.exec(document.cookie);
  return (value != null) ? unescape(value[1]) : null;
}

function getAccessToken() {
  return getCookie("chainofmemories_access_token");
}

$(function() {
  $(".alert").delay(4000).slideUp(200, function() {
    $(this).alert('close');
  });
})