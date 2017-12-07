'use strict';

angular.module('gce-app.controllers', [])

.controller('IndexCtrl', ['$scope', '$state', '$window', '$rootScope', '$http', '$ngConfirm',
    function($scope, $state, $window, $rootScope, $http, $ngConfirm) {

        $http.get($rootScope.baseUrl + '/group')
            .then(function(response) {
                $scope.groups = response.data;
            },function(response) {});


        if ($window.localStorage.getItem('groupId') === null) {
            $ngConfirm({
                columnClass: 'large',
                title: 'Sélectionner votre groupe',
                contentUrl: 'templates/_group_dialog.html',
                scope: $scope,
                buttons: {
                    create: {
                        text: 'Connecter',
                        btnClass: 'btn-green',
                        action: function(scope) {
                            $window.localStorage.setItem('groupId', scope.group.id);
                            $state.go($state.current, {}, { reload: true });
                        }
                    }
                }
            });
        }

    }

]);
