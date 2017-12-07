'use strict';

angular.module('gce-app.controllers')

.controller('DocumentCtrl', ['$rootScope', '$scope', '$state', '$http', '$ngConfirm', '$window',
    function($rootScope, $scope, $state, $http, $ngConfirm, $window) {

        $scope.groupId = $window.localStorage.getItem('groupId');

        let formData = new FormData();
        let contentArray = [];

        $http.get($rootScope.baseUrl + '/document?owner=' + $scope.groupId)
            .then(function(response) {
                $scope.documents = response.data;
            },function(response) {});


        $http.get($rootScope.baseUrl + '/group/' + $scope.groupId)
            .then(function(response) {
                $scope.current_template = response.data.current_template;
            },function(response) {});

        $scope.$on('fileSelected', function(event, args) {
            $scope.$apply(function() {
                formData.append('file', args.file);
            });
        });

        $scope.templateChange = function() {
            $http.put($rootScope.baseUrl + '/group/' + $scope.groupId, { 'current_template': $scope.current_template })
                .then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                }, function(response) {});
        };

        $scope.upload = function() {
            $http.post($rootScope.baseUrl + '/document/upload/' + $scope.groupId, formData, {
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

        $scope.sendToSP = function(id) {
            $http.get($rootScope.baseUrl + '/document/uploadToSP/' + id)
                .then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                },function(response) {});
        };

        $scope.processLad = function(id) {
            $http.get($rootScope.baseUrl + '/document/ladprocess/' + id)
                .then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                },function(response) {});
        };

    }

]);
