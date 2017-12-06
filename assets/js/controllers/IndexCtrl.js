'use strict';

angular.module('gce-app.controllers', [])

.controller('IndexCtrl', ['$scope', '$state', '$timeout', 'Restangular', '$http', '$ngConfirm',
    function($scope, $state, $timeout, Restangular, $http, $ngConfirm) {

        /*$ngConfirm({
            columnClass: 'large',
            title: 'Choissisez votre groupe',
            contentUrl: 'templates/_group_dialog.html',
            scope: $scope,
            buttons: {
                create: {
                    text: 'Connecter',
                    btnClass: 'btn-green',
                    action: function(scope) {

                    }
                },
                close: function() {}
            }
        });*/

    }

]);
