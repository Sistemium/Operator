'use strict';

angular.module('debtApp')
  .controller('InviteCtrl', function ($stateParams, Invite) {
    var me = this;
    me.invite = null;

    me.inviteCode = null;
    var agent = $stateParams.agent;

    me.init = function () {
      me.invitePromise = Invite.agentInvites({agent: agent});

      if (me.invitePromise.hasOwnProperty('$promise')) {
        me.invitePromise.$promise.then(function (res) {
           me.invites = res;
        });
      } else {
        me.invites = me.invitePromise;
      }
    };

    me.sendInvite = function () {
      var invite = {
        id: uuid.v4(),
        owner: agent
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
        if (invite.owner === agent) {
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
      me.invite.acceptor = agent;
      Invite.update({id: me.invite.id}, me.invite).$promise.then(function (res) {
        alert('Ура');
      }, function (res) {
        alert('Ну, зачем же так..');
      })
    };

    me.init();
  });
