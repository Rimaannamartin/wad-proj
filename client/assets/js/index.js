// index.js - navbar toggle + example AJAX call using jQuery
$(function(){
  // fill year
  $('#year').text(new Date().getFullYear());

  // navbar toggle for small screens
  $('#navToggle').on('click', function(){ $('#navLinks').toggleClass('open'); });

  // Close nav when clicking outside (mobile)
  $(document).on('click', function(e){ if(!$(e.target).closest('.navbar').length){ $('#navLinks').removeClass('open'); } });

  // Example AJAX: check dashboard (requires server running)
  $('#navLinks .accent').on('click', function(e){
    // placeholder: don't block navigation; demonstrate how to call the API
    $.ajax({ url: '/api/v1/userAuth/dashboard', method: 'GET' })
      .done(function(res){ console.log('dashboard ->', res); })
      .fail(function(xhr){ /* not logged in or server down is normal during local dev */ console.log('dashboard request failed'); });
  });
});
