'use strict';

angular.module('gce-app.filters', [])

.filter('booleanTransform', ['$filter',
    function($filter) {

        return function(data) {
            if (data === true || data === 'true') {
                return 'true';
            } else if (data === false || data === 'false') {
                return 'false';
            }
        };

    }
]);
