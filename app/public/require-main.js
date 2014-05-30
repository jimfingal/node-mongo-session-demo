require.config({
    'baseUrl': '.',
    'paths': {
      'jquery': 'bower_components/jquery/dist/jquery.min',
      'jquery-ui': 'bower_components/jquery-ui/ui/jquery-ui',
      'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap.min',
      'socket.io' : 'bower_components/socket.io-client/dist/socket.io.min',
    },
    'shim': {
        'jquery': {
            exports: 'jQuery'
        },
        'jquery-ui': {
            deps: ['jquery']
        },
        'bootstrap': {
          deps: ['jquery']
        }
    },
});

require(['socket.io', 'jquery', 'jquery-ui', 'bootstrap'],
  function(io, $) {

    var loc = window.location;
    var url = location.protocol + '//' + location.hostname + ':' + location.port;

    $("#login").click(function() {
        window.location = url + '/authenticate';
    });

    $("#logout").click(function() {
        window.location = url + '/logout';
    });


    var hash = $(location).attr('hash');

    if (hash) {
      var parts = hash.split('=');
      $('#access_token').html("<h2>Access token</h2><p>" + parts[1] + "</p>");
    };

});

