/*
 * view configuration
 * templateBasePath: template root dir.  default = source/templates
 * templateFileExtension: template file extension including dot.  default = .html
 * 
 */
$a.viewSetup({
  templateBasePath: 'source/templates',
  templateFileExtension: '.html'
});

/*
 * base/header: view name
 * templateName: template file name
 * render: rendering function with model
 */

$a.view('main/header', {
  templateName:'main/header.html', //optional
  outlet:'main/header', //optional
  model: function(){ //optional
  }
});


$a.view('foo/header', {});
