(function () {
  "use strict";

  angular.module('frontend.domain')
  .factory('AgentModel', [
    'DataModel',
    function(DataModel) {
      var model = new DataModel('agent');

      model.handlerCreated = function handlerCreated(agent) {
        this.objects.push(agent.data);
      };

      return model;
    }
  ])
}());
