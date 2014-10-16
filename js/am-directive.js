angular.module('aniMachine', [])
.directive('amElement', ['$timeout', '$window', function($timeout, $window) {

	return {
		restrict: 'A',
		scope: {
			enter: '@'
		},
		link: function(scope, element, options) {

			var events = scope.events,
				triggers = scope.triggers;

			var musician = Object.create(am.maestro);
			musician.init({
				triggers: triggers,
				events: events,
				element: element,
				timeoutFn: $timeout
			});			

			if (events.enter || events.leave) {

				if (am.viewport.isInside(element[0])) {
					if (!events['default']) {
						musician.changeState('enter');
					}
				}

				scope.$watch(function() {
						return am.viewport.isInside(element[0]);
					}, function(newValue, oldValue) {
						if (newValue !== oldValue) {
							musician.changeState(newValue ? 'enter' : 'leave');
					   }
					}, true);

				// should be outside !?
				angular.element($window)
					.bind('resize', function () {
						scope.$apply();
					})
					.bind('scroll', function () {
						scope.$apply();
					});
			}

			musician.changeState('default');
		},
		controller: ['$scope', '$element', function($scope, $element) {

			$scope.events = {};
			$scope.triggers = {};

			this.setEvents = function(state, trigger, events) {
				state = state || 'default';
				$scope.events[state] = events;
				$scope.triggers[state] = trigger;
			};
		}]
	};
}])
.directive('amState', function() {
	return {
		restrict: 'E',
		scope: {
			value: '@',
			trigger: '@'
		},
		require: '^amElement',
		link: function (scope, element, attrs, elementCtrl) {
			elementCtrl.setEvents(scope.value, scope.trigger, scope.events);
		},
		controller: ['$scope', function($scope) {
			$scope.events = [];
			this.addEvent = function(event) {
				$scope.events.push(event);
			};
		}]
	};
})
.directive('amEvent', function() {
	return {
		restrict: 'E',
		scope: {
			on: '@',
			before: '@',
			after: '@',
			animate: '@',
			goto: '@'
		},
		require: '^amState',
		link: function(scope, elm, options, stateCtrl) {

			var on = tt.parseOn(scope.on),
				type, param;

			if (scope.animate) {
				type = 'animate';
				param = scope.animate;
			}

			stateCtrl.addEvent({
				on: on,
				type: type,
				param: param,
				currentStep: -1,
				before: scope.before,
				after: scope.after,
				goto: scope.goto
			});
		}
	};
});