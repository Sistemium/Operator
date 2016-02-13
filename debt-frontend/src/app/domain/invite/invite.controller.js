(function () {
  'use strict';
  angular.module('frontend.domain')
    .controller('InviteCtrl',
      [
        '$rootScope', '$scope', '$http', '$stateParams', 'uuid4',
        '_invites', '_agent', 'InviteModel',
        'gettextCatalog', 'MessageService',
        'NgTableService', '_',
        function ($rootScope, $scope, $http, $stateParams, uuid4,
                  _invites, _agent, InviteModel,
                  gettextCatalog, MessageService,
                  NgTableService, _) {

          var me = this;
          me.invite = null;

          var agent = $stateParams.agent;

          function filterAgentInvites(i) {
            me.agentInvitesTableParams = NgTableService.setTable(me, i);
            me.acceptedInvites = _.filter(i, {'acceptor': agent});
            me.acceptedInvitesTableParams = NgTableService.setTable(me, me.acceptedInvites);
            me.confirmedInvites = _.filter(i, {'owner': agent, acceptor: !null});
          }

          filterAgentInvites(_invites);

          me.refresh = function () {
            me.showSpinner = true;
            InviteModel.load({owner: agent}).then(function (res) {
              me.showSpinner = false;
              me.agentInvites = res;
              filterAgentInvites(me.agentInvites);
            });
          };

          me.sendInvite = function () {
            var invite = {
              id: uuid4.generate(),
              owner: _agent.id,
              ownerName: _agent.name
            };
            InviteModel.create(angular.copy(invite)).then(function (res) {
              me.inviteCode = res.code;
            }, function () {
              MessageService.error(gettextCatalog.getString('Failed to create invite'));
            });
          };

          me.getInviteByCode = function () {
            InviteModel.load({code: me.inviteCode}).then(function (res) {
              me.invite = res.data;
              me.showInvite = true;
              me.manageInvite(me.invite);
            }, function () {
              MessageService.error(gettextCatalog.getString('Failed to get invite by code'));
            });
          };

          me.manageInvite = function (invite) {
            //check if already have invite from that agent
            var alreadyAccepted = _.findWhere(me.acceptedInvites, {owner: invite.owner, acceptor: invite.acceptor});
            if (alreadyAccepted) {
              me.showMessageThatAlreadyAccepted = true;
              MessageService.warning(gettextCatalog.getString('This invite already accepted'));

              return;
            }

            if (invite.owner === agent && invite.status === 'accepted') {
              me.showDisableInviteButton = true;
            } else if (invite.owner === agent && invite.status === 'open') {
              me.showDeleteInviteButton = true;
            } else if (invite.status === 'open' && !(invite.owner === agent)) {
              me.showAcceptInviteButton = true;
            } else {
              me.showDisableInviteButton = false;
              me.showAcceptInviteButton = false;
            }
          };

          me.deleteInvite = function (id) {
            InviteModel.delete(id).then(function () {
              MessageService.success(gettextCatalog.getString('Invite was successfully deleted'));
            }, function () {
              MessageService.error(gettextCatalog.getString('Failed to delete invite'));
            });
          };

          me.disableInvite = function (id) {
            //disable invite
            InviteModel.delete(id).then(function () {
              me.reset();
            }, function () {
              MessageService.error(gettextCatalog.getString('Could not disable invite'));
            });
          };

          me.acceptInvite = function () {
            //accept invite
            me.invite.acceptor = agent;
            me.invite.acceptorName = _agent.name;
            InviteModel.update(me.invite.id, me.invite).then(function () {
              me.reset();
            }, function () {
              MessageService.error(gettextCatalog.getString('Could not accept invite'));
            });
          };
          me.reset = function () {
            me.showInvite = false;
            me.showDisableInviteButton = false;
            me.showAcceptInviteButton = false;
            me.inviteCode = null;
          };

          me.sendEmail = function () {
            $http({
              method: 'GET',
              url: '/api/invites/sendEmail',
              params: {
                inviteCode: me.inviteCode,
                toEmail: me.toEmail
              }
            }).then(function () {
              me.inviteCode = undefined;
              MessageService.success(gettextCatalog.getString('Email was successfully sent!'));
            }, function () {
              MessageService.error(gettextCatalog.getString('Error occurred'));
            });
          };

          me.refresh();

          $rootScope.$on('invite:save', function (event, invite) {
            event.preventDefault();

            if (invite.owner === agent || invite.acceptor === agent) {
              var isUpdated = _.find(me.agentInvites, {id: invite.id});
              InviteModel.fetch(invite.id).then(function (res) {
                isUpdated ? _.merge(res, isUpdated) : me.agentInvites.push(res);
                filterAgentInvites(me.agentInvites);
              });
            }

            if (invite.owner === agent && invite.acceptor) {
              MessageService.success(gettextCatalog.getString('Your created invite was accepted'));
            }
            else if (invite.acceptor === agent) {
              MessageService.success(gettextCatalog.getString('You accepted the invite'));
            }
            else if (invite.owner === agent) {
              MessageService.success(gettextCatalog.getString('You created the invite'));
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
    );
})();
