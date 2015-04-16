'use strict';

var path = require('path');
var pages = require('alopex-tools-pages');

var config = {
  source: 'source',
  release: '_release',
  apps: '_apps',
  build: 'build',
  webport: '3001',
  rcsport: '3002',
  livereloadport: 35729
};

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    
    source: config.source,
    release: config.release,
    apps: config.apps,
    build: config.build,
    webport: grunt.option('webport') || config.webport,
    rcsport: grunt.option('rcsport') || config.rcsport,
    livereloadport: grunt.option('livereloadport') || config.livereloadport,
    
    /**
	 * task: clean delete files in release directory
	 */
    clean: {
      release:{
        src: ['<%= release %>']
      }
    },
    /**
	 * task: concat merge javascript and CSS files
	 */
    concat:{
      options:{
        process: {
          data : {
            alopexbase: '../../js/lib/alopex'
          }
        }
      },
      js: {
        src: [
              '<%= source %>/www/js/lib/jquery/jquery-1.10.1.js',
              '<%= source %>/www/js/lib/handlebars/handlebars.js',
              '<%= source %>/www/alopex/script/alopex_controller.js',
              '<%= source %>/www/alopex/script/alopex-ui-2.2.js',
              '<%= source %>/www/alopex/script/alopex-validator.js',
              '<%= source %>/www/alopex/script/alopex-data.js',
              '<%= source %>/www/alopex/script/alopex-client.js',
              '<%= source %>/www/<%= build %>/js/templates.js',
              '<%= source %>/www/js/app/common/view.js',
              '<%= source %>/www/js/app/common/decorator.js'
              ],
        dest: '<%= source %>/www/<%= build %>/js/app.js'
      },
      css:{
        src: [
              '<%= source %>/www/alopex/css/alopex_ui.css',
              '<%= source %>/www/alopex/css/alopex_ui_theme.css',
              '<%= source %>/www/css/app/common/common.css',
              ],
        dest: '<%= source %>/www/<%= build %>/css/app.css'
      }
      
    },
    /**
	 * task: copy image, alopex_image: copy alopex images release: copy images to release
	 */
    copy:{
      image: {
        files: [
          {
            expand: true, src: ['**'], cwd: '<%= source %>/www/img',dest: '<%= source %>/www/<%= build %>/css/img'
          }
        ]
      },
      alopex_image: {
        files: [
          {
            expand: true, src: ['**'], cwd: '<%= source %>/www/alopex/css/images',dest: '<%= source %>/www/<%= build %>/css/images'
          }
        ]
      },
      release:{
        files: [
        {expand: true, 
         src: [
               '**',
               
               /* javascript files to exclude(already merged into app.js) */
               '!js/lib/**',
               '!<%= build %>/js/templates.js',
               '!js/app/common/**',
               '!alopex/script/alopex_controller.js',
               '!alopex/script/alopex-ui-2.2.js',
               '!alopex/script/alopex-validator.js',
               '!alopex/script/alopex-data.js',
               '!alopex/script/alopex-view.js',
               '!alopex/script/alopex-decorator.js',
               '!alopex/script/alopex.js',
               
               /* CSS files to exclude(already merged into app.css) */
               '!alopex/css/**',
               '!css/app/common/**',
               
               /* images to exclude(already copied into _bulid) */
               '!img/**',
               
               ],
         cwd: '<%= source %>/www/',
         dest: '<%= release %>/www/'}
        ]
      }
    },
    /**
	 * task: uglify JS minimise
	 * 
	 */
    uglify: {
        options: {
          banner: '<%= banner %>'
        },
        release:{
          files:{
            '<%= release %>/www/<%= build %>/js/app.js': '<%= release %>/www/<%= build %>/js/app.js'
          }
        }
    },
    /**
	 * task: cssmin CSS minimize
	 * 
	 */
    cssmin:{
        options: {
          keepSpecialComments: 0
        },
        release: {
          options: {
            keepSpecialComments: '*'
          },
          src: '<%= release %>/www/<%= build %>/css/app.css',
          dest: '<%= release %>/www/<%= build %>/css/app.css'
        }
    },
    /**
	 * task: jshint Javascript code inspection
	 * 
	 */
    jshint: {
      app: {
        options: {
          jshintrc: '<%= source %>/.jshintrc'
        },
        src: ['<%= source %>/www/js/app/**/*.js']
      }
    },
    /**
	 * task: csslint CSS code inspection
	 * 
	 */
    csslint: {
      source: {
        src: '<%= source %>/www/css/app/**/*.css',
        options: {
          'adjoining-classes': false,
          'box-model': false,
          'compatible-vendor-prefixes': false,
          'duplicate-background-images': false,
          'import': true,
          'important': false,
          'outline-none': false,
          'overqualified-elements': false,
          'text-indent': false
        }
      }
    },
    /**
	 * task: watch incremental build and livereload
	 * 
	 */
    watch: {
      options: {
        
      },
      www : {
        options:{
          livereload: '<%= livereloadport %>'
        },
        files : ['<%= source %>/www/**/*.*']
      },
      js: {
        files: [ '<%= source %>/www/<%= build %>/js/templates.js',
                 '<%= source %>/www/js/lib/**/*.js',
                 '<%= source %>/www/alopex/script/**/*.js',
                 '<%= source %>/www/js/app/common/**/*.js'
                ],
        tasks: ['concat:js']
      },
      css: {
        files: [
                 '<%= source %>/www/alopex/css/**/*.css',
                 '<%= source %>/www/css/lib/**/*.css',
                 '<%= source %>/www/css/app/common/**/*.css'
                ],
        tasks: ['concat:css']
      },
      alopex_image:{
        files: [
                '<%= source %>/www/alopex/css/images/*.*'
               ],
        tasks: ['copy:alopex_image']
      },
      template:{
        files: [
                '<%= source %>/templates/**/*.html'
               ],
       tasks: ['handlebars']
      },
      gruntfile:{
        files: [
                'Gruntfile.js'
               ],
       tasks: ['build'] 
      }
    },
    /**
	 * task: rcs lightweight remote contents server
	 * 
	 */
    rcs: {
      all:{
        options: {
          port: '<%= rcsport %>',
          hostname: '*',
          contextRoot: '<%= apps %>',
        },
        src:'<%= source %>/www'
      }
    },
// /**
// * task: bonjour
// * bonjour server (roadmap)
// *
// */
// bonjour: {
// all:{
// options: {
// webport: '<%= webport %>',
// rcsport: '<%= rcsport %>'
// }
// }
// },
    /**
	 * task: connect test web server
	 * 
	 */
    connect: {
      source:{
        options: {
          port: '<%= webport %>',
          hostname: '*',
          base: '<%= source %>',
          directory: '<%= source %>',
          middleware: function (connect, options, middlewares) {
            middlewares.unshift(function(req, res, next) { // first middleware
              if (req.url !== '/') return next();
              pages.index({port: options.port, base:'www'}, res);
            });

            return middlewares;
          }
        }
      }
    },
    /**
	 * task: handlebars precomile html templates into javascript
	 * 
	 */
    handlebars: {
      options: {
        namespace: 'AlopexWebApp.Templates'
      },
      all: {
          files: {
              "<%= source %>/www/<%= build %>/js/templates.js": ["<%= source %>/templates/**/*.html"]
          }
      }
    },
    
    'ftp-deploy': {
    	  build: {
    	    auth: {
    	      host: 'ide.alopex.io',
    	      port: 21,
    	      authKey: 'key1'
    	    },
    	    src: './',
    	    dest: '/var/www/html/dev',
    	    exclusions: ['files*','./node_modules','.git*','_release*','./source/www/**/.DS_Store', './source/www/**/Thumbs.db', './source/www/**/.*'],
    	    serverSep: '/',
    	    concurrency: 4,
    	    progress:true
    	  }
    },
    express: {
        all: {
            options: {
            	bases: [path.resolve(__dirname, 'source/www')],
            	server: path.resolve(__dirname, 'server/app.js'),
                port: 3001,
                hostname: "0.0.0.0"
//                livereload: true
            }
        }
    }
  });
  
  /* grunt task load */
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-ftp-deploy');
  grunt.loadNpmTasks('grunt-express');

  grunt.loadNpmTasks('grunt-alopex-rcs');
// grunt.loadNpmTasks('grunt-alopex-bonjour'); //roadmap
  
  
  /* registering jobs */

  /**
	 * task: default use grunt default: server
	 */
  grunt.registerTask('default', ['server']);
  
  /**
	 * task: lint lint javascript and css
	 */
  grunt.registerTask('lint', ['jshint', 'csslint']);
  
  /**
	 * task: build precompile to build directory
	 */
  grunt.registerTask('build', ['handlebars', 'concat', 'copy:image', 'copy:alopex_image']);
  
  /**
	 * task: release copy and minimize into release directory
	 */
  grunt.registerTask('release', ['build', 'clean:release', 'copy:release', 'uglify:release', 'cssmin:release']);
  
  /**
	 * task: server build, run web server and watch
	 */
  grunt.registerTask('server', [/*'build',*/ 'express', /*'rcs',*/ /* 'bonjour', */ 'watch']);
  
  /**
	 * task: server deploy to production server
	 */
  grunt.registerTask('deploy', ['ftp-deploy']); 
  
};
