'use strict';

(function () {
  angular.module('debtApp')
    .controller('InviteCtrl', ['$scope', '$stateParams', 'Invite', 'socket',
        function ($scope, $stateParams, Invite, socket) {
          var me = this;
          me.invite = null;
          me.showSpinner = false;
          me.inviteCode = null;
          var agent = $stateParams.agent;

          me.refresh = function () {
            me.agentInvitesPromise = Invite.agentInvites({agent: agent});
            me.showSpinner = true;
            if (me.agentInvitesPromise.hasOwnProperty('$promise')) {
              me.agentInvitesPromise.$promise.then(function (res) {
                me.showSpinner = false;
                me.agentInvites = res;
                me.agentInvites.acceptedInvites = _.filter(res, {'acceptor': agent});
                socket.syncUpdates('invite', me.agentInvites, function (event, item, array) {
                  //TODO confirmed by agent
                  array.acceptedInvites = _.filter(array, {'acceptor': agent});
                });
              });
            } else {
              me.showSpinner = false;
              me.agentInvites = me.agentInvitesPromise;
              socket.syncUpdates('invite', me.agentInvites);
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
              //check if already have invite from that agent
              var alreadyAccepted = _.findWhere(me.acceptedInvites, {owner: invite.owner});
              if (alreadyAccepted) {
                me.showMessageThatAlreadyAccepted = true;
                return;
              }
              if (invite.owner === agent) {
                me.showDisableInviteButton = true;
              } else {
                me.showAcceptInviteButton = true;
              }
            } else {
              me.showDisableInviteButton = false;
              me.showAcceptInviteButton = false;
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
              me.reset();
            }, function (res) {
              alert('Ну, зачем же так..');
            })
          };
          me.reset = function () {
            me.showInvite = false;
            me.showDisableInviteButton = false;
            me.showAcceptInviteButton = false;
            me.inviteCode = null;
          };

          me.refresh();

          $scope.$on('$destroy', function () {
            socket.unsyncUpdates('invite');
          })
        }
      ]
    )
  ;
})();
