(function () {
  "use strict";

  angular.module('frontend.core.services')
    .service('NgTableService', ['NgTableParams', function (NgTableParams) {
      var me = this;

      angular.extend(me, {
        setTable: function (ctrl, dataset) {
          var config = {
            page: 1,
            count: 5
          };
          return new NgTableParams(config, {
            counts: (ctrl.ngTable && ctrl.ngTable.count) || [5, 10, 20, 40],
            dataset: dataset
          });
        }
      });

      return me;
    }]);
}());
