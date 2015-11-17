'use strict';

angular.module('debtApp')
  .controller('InviteCtrl', ['$stateParams', 'Invite', 'socket',
      function ($stateParams, Invite, socket) {
        var me = this;
        me.invite = null;

        me.inviteCode = null;
        var agent = $stateParams.agent;

        me.init = function () {
          me.agentInvitesPromise = Invite.agentInvites({agent: agent});

          if (me.agentInvitesPromise.hasOwnProperty('$promise')) {
            me.agentInvitesPromise.$promise.then(function (res) {
              me.agentInvites = res.agentInvites;
              me.acceptedInvites = res.accepted;
              socket.syncUpdates('invite', me.agentInvites, function (event, item, array) {
                //TODO confirmed by agent
              });
            });
          } else {
            me.agentInvites = me.agentInvitesPromise;
            socket.syncUpdates('invite', me.invites);
          }
        };

        me.sendInvite = function () {
          var invite = {
            id: uuid.v4(),
            owner: agent
          };
          Invite.save({id: null}, invite).$promise.then(function (res) {
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

        me.deleteInvite = function (id) {
          Invite.delete({id: id}).$promise.then(function () {
            alert('Успех');
          }, function () {
            alert('Неудача');
          });
        };

        me.disableInvite = function () {
          //disable invite
        };

        me.acceptInvite = function () {
          //accept invite
          me.invite.acceptor = agent;
          Invite.update({id: me.invite.id}, me.invite).$promise.then(function (res) {
            alert('Ура');
            me.showInvite = false;
            me.manageInvite(me.invite);
          }, function (res) {
            alert('Ну, зачем же так..');
          })
        };

        me.init();
      }
    ]
  )
;
