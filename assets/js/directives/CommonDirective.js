'use strict';

angular.module('gce-app.directives', [])

.directive('fileUpload', function() {

    function link(scope, element, attrs) {

        jQuery('input:file', element).on('change', function(event) {
            let input = jQuery(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, ''),
                files = event.target.files;

            input.trigger('fileselect', [numFiles, label]);

            for (var i = 0; i < files.length; i++) {
                scope.$emit('fileSelected', {
                    'file': files[i]
                });
            }
        });

    }

    return {
        link: link,
        restrict: 'A'
    };

});
