'use strict';

angular.module('gce-app.controllers')

.controller('SettingsCtrl', ['$scope', '$rootScope', '$state', '$window', '$http',
    function($scope, $rootScope, $state, $window, $http) {

        let formData = new FormData();
        let contentArray = [];

        $scope.groupId = $window.localStorage.getItem('groupId');

        $http.get($rootScope.baseUrl + '/group/' + $scope.groupId)
            .then(function(response) {
                $scope.group = response.data;
            },
            function(response) {});

        $scope.$on('fileSelected', function(event, args) {
            $scope.$apply(function() {
                formData.append('file', args.file);
            });
        });

        $scope.save = function(group) {
            $http.put($rootScope.baseUrl + '/group/' + $scope.groupId, group)
                .then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                }, function(response) {});
        };

        $scope.saveTemplates = function(templates) {
            $http.post($rootScope.baseUrl + '/group/uploadTemplates/' + $scope.groupId , formData, {
                    'transformRequest': angular.identity,
                    'headers': { 'Content-Type': undefined }
                })
                .then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                }, function(response) {});
        };

    }

]);
