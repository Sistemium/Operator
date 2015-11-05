'use strict';

angular.module('debtApp')
  .factory('Invite', function ($resource) {
    return $resource('/api/invites');
  })
  .controller('InviteCtrl', function ($stateParams, Invite) {
    var me = this;

    me.sendInvite = function () {
      var invite = {
        id: uuid.v4(),
        owner: $stateParams.agentId
      };
      Invite.save(invite).$promise.then(function () {
        alert('success');
      }, function () {
        alert('failure');
      });
    };
  });
