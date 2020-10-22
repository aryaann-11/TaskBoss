import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import{Tasks} from '../lib/collections.js';
import{Teams} from '../lib/collections.js';
import {Accounts} from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

Accounts.ui.config({
  passwordSignupFields:'USERNAME_AND_EMAIL'
});

import './main.html';
//console.log(document.getElementById("hide_completed").value)
Template.body.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('tasks');
    Meteor.subscribe('teams');
    Meteor.subscribe('userData');
  });
Template.incomplete_tasks.helpers({tasks:Tasks.find({status:0})});
Template.complete_tasks.helpers({tasks:Tasks.find({status:1})});
Template.teams.helpers({team:Teams.find({memberIds:Meteor.userId()})});
Template.teams_under_me.helpers({teams:Teams.find({leader:Meteor.userId()})});
//console.log(Meteor.userId());
//console.log(Meteor.users.findOne(Meteor.userId()));
Template.tasks_pseudoPage.events({
  'click #show-complete':function(event){
      status=1;
      $(".tasks").css("display","none");
      $(".complete_tasks").css("display","block");
  },
  'click #show-incomplete':function(event){
    status=0;
    $(".tasks").css("display","none");
    $(".incomplete_tasks").css("display","block");
  },
});
Template.body.events({
  'click .show-tasks':function(event){
    $(".pseudoPage").css("display","none");
    $(".tasks_pseudoPage").css("display","block");
  },
  'click .show-teams':function(event){
    $(".pseudoPage").css("display","none");
    $(".teams_pseudoPage").css("display","block");
  },
  'click .show-delegate':function(event){
    $(".pseudoPage").css("display","none");
    $(".delegate_pseudoPage").css("display","block");
  }
});

Template.incomplete_tasks.events({
  'click .completed':function(event){
    var taskId=this._id;
    Meteor.call('incomplete_tasks.setComplete',taskId);
  }
});
Template.complete_tasks.events({
  'click .js-del-task':function(event){
    var taskId=this._id;
    Meteor.call('complete_tasks.delete',taskId);
  },
});
Template.create_team_modal.events({
  'submit form':function(event){
    event.preventDefault();
    var name=event.currentTarget.team_name.value;
    var purpose=event.currentTarget.team_purpose.value;
    var objectives=document.getElementById("team_objectives").value;
    Meteor.call('create_team_modal.insertTeam',name,purpose,objectives);
  }
});
Template.join_team_modal.events({
  'submit form':function(event){
    event.preventDefault();
    var team_id=event.target.team_id.value;
    var members;var memberIds;
    Teams.find({_id:team_id}).forEach(function(document) {members=document.members;memberIds=document.memberIds});
    function alreadyMember(username){
       return username==Meteor.user().username;
     }
    if(!(members.find(alreadyMember))){
      members.push(Meteor.user().username);
      memberIds.push(Meteor.userId());
      Meteor.call('join_team_modal.joinTeam',team_id,members,memberIds)
    }
    else{
      alert("already a member");
    }
  },
});
Template.teams.events({
  'click .exit-team':function(event){
    var team_id=this._id;
    var members;var memberIds;
    var flag1,flag2=0;
    Teams.find({_id:team_id}).forEach(function(document) {members=document.members;memberIds=document.memberIds});
    var i=0;
    var j=0;
    for(; i<members.length&&j<memberIds.length;i++,j++){
      if(members[i]===Meteor.user().username){
        flag1=1;
        members.splice(i,1);
      }
      if(memberIds[j]===Meteor.userId()){
        flag2=1;
        memberIds.splice(j,1);
      }
      if(flag1==1 && flag2==1){
        break;
      }
    }
    $("#"+team_id).hide("slow",function(){
      Meteor.call('teams.exitTeam',team_id,members,memberIds);
    });

  }
});
Template.delegate_pseudoPage.events({
  'submit form':function(event){
    event.preventDefault();
    var title=event.currentTarget.title.value;
    var description=event.currentTarget.description.value;
    var assign_to=[];
    var prolly=document.getElementsByClassName("assign_to");
    var assignedToUsers=[];
    for(var i=0;i<prolly.length;i++){
      if(prolly[i].checked==true){
        var neededUsername=prolly[i].id;
        var userId=Meteor.users.findOne({username:neededUsername})._id;
        assign_to.push(userId);
        assignedToUsers.push(neededUsername);
      }
    }
    var prollyAccess=document.getElementsByClassName("view_access");
    var viewAccess=assign_to;
    viewAccess.push(Meteor.userId());
    for(var i=0;i<prollyAccess.length;i++){
      if(prollyAccess[i].checked==true){
        var teamId=prollyAccess[i].id.substring(prollyAccess[i].id.lastIndexOf("_")+1,prollyAccess[i].id.length);
        var accessToTeam=Teams.find({_id:teamId}).forEach(function(document){viewAccess=document.memberIds});
      }
    }
    Meteor.call('delegate_pseudoPage.createTask',title,description,assign_to,viewAccess,assignedToUsers);
  }
});
Template.teams_under_me.events({
  'click .del-team':function(event){
    var teamId=this._id;
    'teams_under_me.delete'(teamId);
  },
});
