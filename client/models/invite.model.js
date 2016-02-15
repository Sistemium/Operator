'use strict';

(function () {

  angular.module('debtApp')
    .factory('Invite', function (DS) {
      return DS.defineResource({
        name: 'invite',
        relations: {
          belongsTo: {
            agents: [
              {
                localField: 'ownerAgent',
                localKey: 'owner'
              },
              {
                localField: 'acceptorAgent',
                localKey: 'acceptor'
              }
            ]
          }
        },
        actions: {
          findByCode: {}
        }
      });
    })
    .run(function (Invite) {
    });

}());
