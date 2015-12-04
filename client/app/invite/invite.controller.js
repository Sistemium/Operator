'use strict';

(function () {
  angular.module('debtApp')
    .controller('InviteCtrl', ['$rootScope', '$scope', '$stateParams', 'AgentInvite', 'Invite', 'toastr', 'gettextCatalog',
        function ($rootScope, $scope, $stateParams, AgentInvite, Invite, toastr, gettextCatalog) {
          var me = this;
          me.invite = null;
          me.showSpinner = false;
          me.inviteCode = null;
          var agent = $stateParams.agent;

          function filterAgentInvites(i) {
            me.acceptedInvites = _.filter(i, {'acceptor': agent});
            me.confirmedInvites = _.filter(i, {'owner': agent, acceptor: !null});
          }

          me.refresh = function () {
            me.showSpinner = true;
            AgentInvite.find(agent).then(function (res) {
              me.showSpinner = false;
              me.agentInvites = res;
              filterAgentInvites(me.agentInvites);
            });
          };

          me.sendInvite = function () {
            var invite = {
              owner: agent
            };
            Invite.create(invite).then(function (res) {
              me.inviteCode = res.code;
            }, function () {
              toastr.error(gettextCatalog.getString("Failed to create invite"));
            });
          };

          me.getInviteByCode = function () {
            Invite.findAll({code: me.inviteCode}).then(function (res) {
              me.invite = res;
              me.showInvite = true;
              me.manageInvite(me.invite);
            }, function () {
              toastr.error(gettextCatalog.getString("Failed to get invite by code"));
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
              toastr.success(gettextCatalog.getString("Invite was successfully deleted"));
            }, function () {
              toastr.error(gettextCatalog.getString("Failed to delete invite"));
            });
          };

          me.disableInvite = function (id) {
            //disable invite
            Invite.destroy(id).then(function () {
              me.reset();
            }, function () {
              toastr.error(gettextCatalog.getString("Could not disable invite"));
            })
          };

          me.acceptInvite = function () {
            //accept invite
            me.invite.acceptor = agent;
            Invite.update(me.invite.id, me.invite).then(function () {
              me.reset();
            }, function () {
              toastr.error(gettextCatalog.getString("Could not accept invite"));
            })
          };
          me.reset = function () {
            me.showInvite = false;
            me.showDisableInviteButton = false;
            me.showAcceptInviteButton = false;
            me.inviteCode = null;
          };

          me.refresh();

          $rootScope.$on('invite:save', function (event, invite) {
            event.preventDefault();

            if (invite.owner === agent || invite.acceptor === agent) {
              var isUpdated = _.find(me.agentInvites, {id: invite.id});
              isUpdated ? _.merge(invite, isUpdated) : me.agentInvites.push(invite);
              filterAgentInvites(me.agentInvites);
            }

            if (invite.owner === agent  && invite.acceptor) {
              toastr.success(gettextCatalog.getString("Your created invite was accepted"));
            }
            else if (invite.acceptor == agent) {
              toastr.success(gettextCatalog.getString("You accepted the invite"));
            }
            else if (invite.owner === agent) {
              toastr.success(gettextCatalog.getString("You created the invite"));
            }
          });

          $rootScope.$on('invite:remove', function (event, invite) {
            event.preventDefault();

            if (invite.owner === agent || invite.acceptor === agent) {
              var index = _.findIndex(me.agentInvites, {id: invite.id});
              me.agentInvites.splice(index, 1);
              filterAgentInvites(me.agentInvites);
            }
          });
        }
      ]
    )
  ;
})();
