(function () {
  'use strict';
  angular.module('frontend.domain')
    .controller('InviteCtrl',
      [ function () {}
        //'$rootScope',
        //'$scope',
        //'$http',
        //'$stateParams',
        //'toastr',
        //'gettextCatalog',
        //'NgTableOptions',
        //function ($rootScope,
        //          $scope,
        //          $http,
        //          $stateParams,
        //          toastr,
        //          gettextCatalog,
        //          NgTableOptions) {
        //  var me = this;
        //  me.invite = null;
        //  me.showSpinner = false;
        //  me.inviteCode = null;
        //  var agent = $stateParams.agent;
        //
        //  function filterAgentInvites(i) {
        //    me.agentInvitesTableParams = NgTableOptions.setTable(me, i);
        //    me.acceptedInvites = _.filter(i, {'acceptor': agent});
        //    me.acceptedInvitesTableParams = NgTableOptions.setTable(me, me.acceptedInvites);
        //    me.confirmedInvites = _.filter(i, {'owner': agent, acceptor: !null});
        //  }
        //
        //  me.refresh = function () {
        //    me.showSpinner = true;
        //    AgentInvite.find(agent).then(function (res) {
        //      me.showSpinner = false;
        //      me.agentInvites = res;
        //      filterAgentInvites(me.agentInvites);
        //    });
        //  };
        //
        //  me.sendInvite = function () {
        //    var invite = {
        //      owner: agent,
        //      ownerName: Agent.get(agent).name
        //    };
        //    Invite.create(invite).then(function (res) {
        //      me.inviteCode = res.code;
        //    }, function () {
        //      toastr.error(gettextCatalog.getString("Failed to create invite"));
        //    });
        //  };
        //
        //  me.getInviteByCode = function () {
        //    Invite.findByCode(me.inviteCode).then(function (res) {
        //      me.invite = res.data;
        //      me.showInvite = true;
        //      me.manageInvite(me.invite);
        //    }, function () {
        //      toastr.error(gettextCatalog.getString("Failed to get invite by code"));
        //    })
        //  };
        //
        //  me.manageInvite = function (invite) {
        //    //check if already have invite from that agent
        //    var alreadyAccepted = _.findWhere(me.acceptedInvites, {owner: invite.owner, acceptor: invite.acceptor});
        //    if (alreadyAccepted) {
        //      me.showMessageThatAlreadyAccepted = true;
        //      //noinspection JSValidateTypes
        //      toastr.warning("This invite already accepted");
        //      return;
        //    }
        //
        //    if (invite.owner === agent && invite.status === 'accepted') {
        //      me.showDisableInviteButton = true;
        //    } else if (invite.owner === agent && invite.status === 'open') {
        //      me.showDeleteInviteButton = true;
        //    } else if (invite.status === 'open' && !(invite.owner === agent)) {
        //      me.showAcceptInviteButton = true;
        //    } else {
        //      me.showDisableInviteButton = false;
        //      me.showAcceptInviteButton = false;
        //    }
        //  };
        //
        //  me.deleteInvite = function (id) {
        //    Invite.destroy(id).then(function () {
        //      toastr.success(gettextCatalog.getString("Invite was successfully deleted"));
        //    }, function () {
        //      toastr.error(gettextCatalog.getString("Failed to delete invite"));
        //    });
        //  };
        //
        //  me.disableInvite = function (id) {
        //    //disable invite
        //    Invite.destroy(id).then(function () {
        //      me.reset();
        //    }, function () {
        //      toastr.error(gettextCatalog.getString("Could not disable invite"));
        //    })
        //  };
        //
        //  me.acceptInvite = function () {
        //    //accept invite
        //    me.invite.acceptor = agent;
        //    me.invite.acceptorName = Agent.get(agent).name;
        //    Invite.update(me.invite.id, me.invite).then(function () {
        //      me.reset();
        //    }, function () {
        //      toastr.error(gettextCatalog.getString("Could not accept invite"));
        //    })
        //  };
        //  me.reset = function () {
        //    me.showInvite = false;
        //    me.showDisableInviteButton = false;
        //    me.showAcceptInviteButton = false;
        //    me.inviteCode = null;
        //  };
        //
        //  me.sendEmail = function () {
        //    $http({
        //      method: 'GET',
        //      url: '/api/invites/sendEmail',
        //      params: {
        //        inviteCode: me.inviteCode,
        //        toEmail: me.toEmail
        //      }
        //    }).then(function () {
        //      me.inviteCode = undefined;
        //      toastr.success(gettextCatalog.getString('Email was successfully sent!'));
        //    }, function (err) {
        //      console.error(err);
        //      toastr.error(gettextCatalog.getString('Error occurred'));
        //    });
        //  };
        //
        //  me.refresh();
        //
        //  $rootScope.$on('invite:save', function (event, invite) {
        //    event.preventDefault();
        //
        //    console.log(invite);
        //
        //    if (invite.owner === agent || invite.acceptor === agent) {
        //      var isUpdated = _.find(me.agentInvites, {id: invite.id});
        //      Invite.find(invite.id).then(function (res) {
        //        isUpdated ? _.merge(res, isUpdated) : me.agentInvites.push(res);
        //        filterAgentInvites(me.agentInvites);
        //      });
        //    }
        //
        //    if (invite.owner === agent && invite.acceptor) {
        //      toastr.success(gettextCatalog.getString("Your created invite was accepted"));
        //    }
        //    else if (invite.acceptor == agent) {
        //      toastr.success(gettextCatalog.getString("You accepted the invite"));
        //    }
        //    else if (invite.owner === agent) {
        //      toastr.success(gettextCatalog.getString("You created the invite"));
        //    }
        //  });
        //
        //  $rootScope.$on('invite:remove', function (event, invite) {
        //    event.preventDefault();
        //
        //    if (invite.owner === agent || invite.acceptor === agent) {
        //      var index = _.findIndex(me.agentInvites, {id: invite.id});
        //      me.agentInvites.splice(index, 1);
        //      filterAgentInvites(me.agentInvites);
        //    }
        //  });
        //}
      ]
    );
})();
