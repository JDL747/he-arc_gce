'use strict';

angular.module('gce-app.controllers')

.controller('ZoningCtrl', ['$scope', '$state', '$timeout', 'Restangular', 'Cropper',
    function($scope, $state, $timeout, Restangular, Cropper) {

        var file, data;

        /**
         * Croppers container object should be created in controller's scope
         * for updates by directive via prototypal inheritance.
         * Pass a full proxy name to the `ng-cropper-proxy` directive attribute to
         * enable proxing.
         */
        $scope.cropper = {};
        $scope.cropperProxy = 'cropper.first';


        /**
         * Method is called every time file input's value changes.
         * Because of Angular has not ng-change for file inputs a hack is needed -
         * call `angular.element(this).scope().onFile(this.files[0])`
         * when input's event is fired.
         */
        $scope.onFile = function(blob) {
            Cropper.encode((file = blob)).then(function(dataUrl) {
                $scope.dataUrl = dataUrl;
                $timeout(showCropper); // wait for $digest to set image's src
            });
        };

        /**
         * Use cropper function proxy to call methods of the plugin.
         * See https://github.com/fengyuanchen/cropper#methods
         */
        $scope.clear = function(degrees) {
            if (!$scope.cropper.first) return;
            $scope.cropper.first('clear');
        };

        $scope.scale = function(width) {
            $scope.cropZone = $scope.cropper.first('getData');
            $scope.cropZone.x = Math.round($scope.cropZone.x);
            $scope.cropZone.y = Math.round($scope.cropZone.y);
            $scope.cropZone.width = Math.round($scope.cropZone.width);
            $scope.cropZone.height = Math.round($scope.cropZone.height);
        }

        /**
         * Object is used to pass options to initalize a cropper.
         * More on options - https://github.com/fengyuanchen/cropper#options
         */
        $scope.options = {
            zoomable: false,
            highlight: false,
            scalable: false,
            autoCrop: false,
            crop: function(dataNew) {
                data = dataNew;
            }
        };

        /**
         * Showing (initializing) and hiding (destroying) of a cropper are started by
         * events. The scope of the `ng-cropper` directive is derived from the scope of
         * the controller. When initializing the `ng-cropper` directive adds two handlers
         * listening to events passed by `ng-cropper-show` & `ng-cropper-hide` attributes.
         * To show or hide a cropper `$broadcast` a proper event.
         */
        $scope.showEvent = 'show';
        $scope.hideEvent = 'hide';

        function showCropper() {
            $scope.$broadcast($scope.showEvent);
        }

        function hideCropper() {
            $scope.$broadcast($scope.hideEvent);
        }
    }

]);
