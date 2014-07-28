//
// hide/show repo manager
//

$('minimizer').on('click', function () {
  $('#repo-edit-form').addClass('hidden');
  $('#maximizer').removeClass('hidden');
})
$('maximizer').on('click', function () {
  $('#repo-edit-form').removeClass('hidden');
  $('#maximizer').addClass('hidden');
});