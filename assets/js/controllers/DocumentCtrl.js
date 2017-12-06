'use strict';

angular.module('gce-app.controllers')

.controller('DocumentCtrl', ['$rootScope', '$scope', '$state', '$http', '$ngConfirm',
    function($rootScope, $scope, $state, $http, $ngConfirm) {

        let formData = new FormData();
        let contentArray = [];

        $http.get($rootScope.baseUrl + '/document')
            .then(function(response) {
                $scope.documents = response.data;
            },function(response) {});

        $scope.$on('fileSelected', function(event, args) {
            $scope.$apply(function() {
                formData.append('file', args.file);
            });
        });

        $scope.upload = function() {
            $http.post($rootScope.baseUrl + '/document/upload', formData, {
                    'transformRequest': angular.identity,
                    'headers': { 'Content-Type': undefined }
                }).then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                }, function(response) {});
        };

        $scope.process = function(id) {
            $http.get($rootScope.baseUrl + '/document/ocrprocess/' + id)
                .then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                },function(response) {});
        };

        $scope.sendToSP = function() {

        };

    }

]);
