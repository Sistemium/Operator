'use strict';

angular.module('debtApp')
  .controller('InviteCtrl', function ($stateParams, Invite) {
    var me = this;
    me.invite = null;

    me.inviteCode = null;
    var owner = $stateParams.agent;
    me.sendInvite = function () {
      var invite = {
        id: uuid.v4(),
        owner: owner
      };
      Invite.save(invite).$promise.then(function (res) {
        me.inviteCode = res.code;
      }, function () {
        alert('failure');
      });
    };

    me.getInviteByCode = function () {
      Invite.getInviteByCode({code: me.inviteCode}).$promise.then(function (res) {
        me.invite = res;
        me.showInvite = true;
        me.manageInvite(me.invite);
      }, function () {
        alert('неудача');
      })
    };

    me.manageInvite = function (invite) {
      if (invite.status === 'open') {
        if (invite.owner === owner) {
          me.showDisableInviteButton = true;
        } else {
          me.showAcceptInviteButton = true;
        }
      }
    };

    me.disableInvite = function () {
      //disable invite
    };

    me.acceptInvite = function () {
      //accept invite
    };
  });
