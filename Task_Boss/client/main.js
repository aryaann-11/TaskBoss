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
Template.incomplete_tasks.helpers({tasks:Tasks.find({status:0,assigned_to:Meteor.userId()})});
Template.complete_tasks.helpers({tasks:Tasks.find({status:1,assigned_to:Meteor.userId()})});
Template.teams.helpers({team:Teams.find({memberIds:Meteor.userId()})});
Template.teams_under_me.helpers({teams:Teams.find({leader:Meteor.userId()})});
//console.log(Meteor.userId());
//console.log(Meteor.users.findOne(Meteor.userId()));
Template.tasks_pseudoPage.events({
  'click #show-complete':function(event){
      status=1;
      console.log(status);
      $(".tasks").css("display","none");
      $(".complete_tasks").css("display","block");
  },
  'click #show-incomplete':function(event){
    status=0;
    console.log(status);
    $(".tasks").css("display","none");
    $(".incomplete_tasks").css("display","block");
  },
});
Template.body.events({
  'click .show-tasks':function(event){
    $(".pseudoPage").css("display","none");
    $(".tasks_pseudoPage").css("display","block");
    console.log("show tasks");
  },
  'click .show-teams':function(event){
    $(".pseudoPage").css("display","none");
    $(".teams_pseudoPage").css("display","block");
    console.log("show teams");
  },
  'click .show-delegate':function(event){
    $(".pseudoPage").css("display","none");
    $(".delegate_pseudoPage").css("display","block");
    console.log("show delegate");
  }
});

Template.incomplete_tasks.events({
  'click .completed':function(event){
    Tasks.update(this._id, {
      $set: { status: 1 }
    });
  }
});
Template.complete_tasks.events({
  'click .js-del-task':function(event){
    var taskId=this._id;
    console.log(taskId);
    $("#"+taskId).hide("slow",function(){
      Tasks.remove(taskId);
    })
  },
});
Template.create_team_modal.events({
  'submit form':function(event){
    event.preventDefault();
    console.log(Meteor.user().username);
    var name=event.currentTarget.team_name.value;
    var purpose=event.currentTarget.team_purpose.value;
    var objectives=document.getElementById("team_objectives").value;
    console.log(name);
    console.log(purpose);
    console.log(objectives);
    Teams.insert({name:name,purpose:purpose,objectives:objectives,leader:Meteor.userId(),members:[Meteor.user().username],memberIds:[Meteor.userId()]});
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
      Teams.update(team_id,{$set:{members:members,memberIds:memberIds}});
      console.log(members);
    }
    else{
      console.log("already a member");
    }
  },
});
Template.teams.events({
  'click .exit-team':function(event){
    console.log(this._id);
    var team_id=this._id;
    var members;var memberIds;
    var flag1,flag2=0;
    Teams.find({_id:team_id}).forEach(function(document) {members=document.members;memberIds=document.memberIds});
    console.log(members);
    console.log(memberIds);
    var i=0;
    var j=0;
    for(; i<members.length&&j<memberIds.length;i++,j++){
      if(members[i]===Meteor.user().username){
        console.log("found");
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
      Teams.update(team_id,{$set:{members:members,memberIds:memberIds}});
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
    //console.log(prolly);
    for(var i=0;i<prolly.length;i++){
      if(prolly[i].checked==true){
        //assign_to.push(prolly[i].id);
        //console.log(prolly[i].id);
        var neededUsername=prolly[i].id;
        var userId=Meteor.users.findOne({username:neededUsername})._id;
        assign_to.push(userId);
        console.log(userId);
      }
    }
    console.log(assign_to);
    Tasks.insert({title:title,description:description,assigned_to:assign_to,status:0});
  }
});
