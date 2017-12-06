'use strict';

angular.module('gce-app.directives', [])

.directive('treeDiagram', ['$timeout',
    function($timeout) {
        return {
            scope: true,
            link: function($scope, el, attrs) {

                let simple_chart_config = {

                    chart: {
                        container: '#tree-diagram',
                        rootOrientation: 'WEST',
                    },

                    nodeStructure: {
                        text: {
                            name: 'get_ideas_and_solutions_to_specific_questions'
                        },
                        children: [{
                            collapsable: true,
                            text: {
                                name: 'New ideas'
                            },
                            children: [{
                                text: {
                                    name: 'New product or services'
                                },
                            }, {
                                text: {
                                    name: 'Find names'
                                },
                            },{
                                text: {
                                    name: 'Enhance products or services'
                                },
                            }]
                        }, {
                            collapsable: true,
                            text: {
                                name: 'Solution to specific problem'
                            },
                            children: [{
                                text: {
                                    name: 'Innovation or R&D'
                                },
                            }, {
                                text: {
                                    name: 'Other issues'
                                },
                            }]
                        }]
                    }
                };

                new Treant(simple_chart_config);

            }
        }
    }

])

.directive('uploadImage', function() {

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

        jQuery('input:file', element).on('fileselect', function(event, numFiles, label) {

            jQuery('.img-container', element).show().attr('style', 'display: block !important;');

            var input = jQuery(this).parents('.input-group').find(':text'),
                log = numFiles > 1 ? numFiles + ' files selected' : label,
                tmppath = URL.createObjectURL(event.target.files[0]);

            if (label.split('.').pop() !== 'pdf') {
                jQuery(element).find('.img-container').show(function() {
                    jQuery(this).find('img').attr('src', tmppath);
                });
            }

        });

    }

    return {
        link: link,
        restrict: 'A'
    };

})

.directive('stFilteredCollection', function() {
    return {
        require: '^stTable',
        link: function(scope, element, attr, ctrl) {
            scope.$watch(ctrl.getFilteredCollection, function(val) {
                scope.$emit('filteredList', { 'val': val });
                scope.filteredCollection = val;
            });
        }
    }
})

.directive('viewExpand', function() {
    return {
        link: function(scope, element, attr) {

            jQuery(element).on('click', '.expand', function(evt) {

                jQuery(this).parent().parent().parent().toggleClass('col-md-3 col-md-12', 1000)
                    .siblings().toggleClass('visibility');

                jQuery('i.glyphicon', this).toggleClass('glyphicon-resize-full glyphicon-resize-small');

            });

        }
    }
});
