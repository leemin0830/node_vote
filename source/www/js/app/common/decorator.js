$(document).ready(function(){
  $a.decorator({
    options:{
      /** html without alopex-decorator uses default decorator*/
      defaultDecorator: 'main'
    },
    /** template names*/
    main: function(){
      //view is injected into data-outlet
      var header = '<div id="titleArea" data-outlet="main/header"></div>';
      $('#titleArea').length?$('#titleArea').empty():$('.content').prepend(header);
      $a.view('main/header').render();
    },
    foo: function(){
      var header = '<div id="titleArea" data-outlet="foo/header"></div>';
      $('#titleArea').length?$('#titleArea').empty():$('.content').prepend(header);
      $a.view('foo/header').render();
    },
    qux: function(){
      //no template
    }
  }).process();
});