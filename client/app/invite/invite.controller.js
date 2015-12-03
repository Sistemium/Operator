'use strict';

(function () {
  angular.module('debtApp')
    .controller('InviteCtrl', ['$rootScope', '$scope', '$stateParams', 'AgentInvite', 'Invite', 'toastr',
        function ($rootScope, $scope, $stateParams, AgentInvite, Invite, toastr) {
          var me = this;
          me.invite = null;
          me.showSpinner = false;
          me.inviteCode = null;
          var agent = $stateParams.agent;

          me.refresh = function () {
            me.showSpinner = true;
            AgentInvite.find(agent).then(function (res) {
              me.showSpinner = false;
              me.agentInvites = res;
              me.acceptedInvites = _.filter(res, {'acceptor': agent});
              me.confirmedInvites = _.filter(res, {'owner': agent, acceptor: !null});
            });
          };

          me.sendInvite = function () {
            var invite = {
              owner: agent
            };
            Invite.create(invite).then(function (res) {
              me.inviteCode = res.code;
            }, function () {
              toastr.error('failure');
            });
          };

          me.getInviteByCode = function () {
            Invite.findAll({code: me.inviteCode}).then(function (res) {
              me.invite = res;
              me.showInvite = true;
              me.manageInvite(me.invite);
            }, function () {
              toastr.error('неудача');
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
            Invite.destroy(id).then(function () {
              toastr.success('Успех');
            }, function () {
              toastr.error('Неудача');
            });
          };

          me.disableInvite = function () {
            //disable invite
          };

          me.acceptInvite = function () {
            //accept invite
            me.invite.acceptor = agent;
            Invite.update(me.invite.id, me.invite).then(function () {
              toastr.success('Ура');
              me.reset();
            }, function () {
              toastr.error('Ну, зачем же так..');
            })
          };
          me.reset = function () {
            me.showInvite = false;
            me.showDisableInviteButton = false;
            me.showAcceptInviteButton = false;
            me.inviteCode = null;
          };

          me.refresh();

          $rootScope.$on('invite', function (event, invite) {
            event.preventDefault();
            if (invite.owner === agent  && invite.acceptor) {
              me.confirmedInvites.push(invite);
              toastr.success('Your created invite was accepted');
            }
            else if (invite.acceptor == agent) {
              me.acceptedInvites.push(invite);
              toastr.success('You accepted the invite');
            }
            else if (invite.owner === agent) {
              me.agentInvites.push(invite);
              toastr.success('You created the invite');
            }
          });
        }
      ]
    )
  ;
})();
