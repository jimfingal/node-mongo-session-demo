require.config({
    'baseUrl': '.',
    'paths': {
      'jquery': 'bower_components/jquery/dist/jquery.min',
      'jquery-ui': 'bower_components/jquery-ui/ui/jquery-ui',
      'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap.min'
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

require(['jquery', 'jquery-ui', 'bootstrap'],
  function($) {

    var url = location.protocol + '//' + location.hostname + ':' + location.port;

    $("#login").click(function() {
        window.location = url + '/authenticate';
    });

    $("#logout").click(function() {
        window.location = url + '/logout';
    });

});

