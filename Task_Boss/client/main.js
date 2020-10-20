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
Template.incomplete_tasks.helpers({tasks:Tasks.find({status:0})});
Template.complete_tasks.helpers({tasks:Tasks.find({status:1})});
Template.teams.helpers({team:Teams.find({members:Meteor.userId()})});

//console.log(Meteor.userId());
//console.log(Meteor.users.findOne(Meteor.userId()));

Template.body.events({
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
  'click .show-tasks':function(event){
    $(".pseudoPage").css("display","none");
    $(".tasks_pseudoPage").css("display","block");
    console.log("show tasks");
  },
  'click .show-teams':function(event){
    $(".pseudoPage").css("display","none");
    $(".teams_pseudoPage").css("display","block");
    console.log("show teams");
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
    console.log(event.currentTarget.team_name.value);
    var name=event.currentTarget.team_name.value;
    var purpose=event.currentTarget.team_purpose.value;
    var objectives=document.getElementById("team_objectives").value;
    Teams.insert({name:name,purpose:purpose,objectives:objectives,leader:Meteor.userId(),members:[Meteor.userId()]});
  }
});
Template.join_team_modal.events({
  'submit form':function(event){
    event.preventDefault();
    var team_id=event.target.team_id.value;
    var members;
    Teams.find({_id:team_id}).forEach(function(document) {members=document.members});
    function alreadyMember(user_id){
       return user_id==Meteor.userId();
     }
    if(!(members.find(alreadyMember))){
      members.push(Meteor.userId());
      Teams.update(team_id,{$set:{members:members}});
      console.log(members);
    }
    else{
      console.log("already a member");
    }
  },
});
