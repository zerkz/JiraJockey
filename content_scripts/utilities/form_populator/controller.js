// $('body').append('<div id="populator" class="jj-button">populate</div>');


$('#populator').on('click', function (populator) {
  $('input').each(function () {
    var $this    = $(this)
      , title    = $this.attr('title') || ''
      , value    = titleValueMap[title.toLowerCase()]
      , tabEvent = jQuery.Event("keydown");

    if ($this.is('input')) {
      var $label = $this.closest('.row').find('label');

      $this.attr('value', value);
      $label.addClass('field-has-value');

      $this.trigger('focus')
      $this.trigger('blur')

    } else if ($this.is('select')) {
      // TODO : select functionality
    }
  });
});
