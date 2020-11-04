import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Teams} from '../lib/collections.js';
import './main.html';
//routes
Router.configure({
  layoutTemplate:'layout'
});
Router.route('/',function(){
  this.render('home');
});
Router.route('/login',function(){
  this.render('login');
});
Router.route('/register',function(){
  this.render('register');
});
Router.route('/teams',function(){
  this.render('teams');
});
//subscriptions
//helpers
//console.log(Teams.find().count());
Template.teams.helpers({teams:Teams.find({members:Meteor.userId()})});
//register.events
Template.register.events({
  'submit form':function(event){
    event.preventDefault();
    var name=event.target.name.value;
    var username=event.target.username.value;
    var email=event.target.email.value;
    var password=event.target.password.value;
    var c_password=event.target.c_password.value;
    if(password!=c_password){
      Bert.alert({
        title:'Submission error',
        message:'passwords not matching',
        type:'danger',
        style:'growl-top-right'
      });
    }
    else{
      Accounts.createUser({
        username:username,
        email:email,
        password:password,
        profile:{
          name:name,
          leading:[],
          membership:[],
        }
      },function(error){
        if(error){
          Bert.alert({
            title:'registeration error',
            message:error.reason,
            type:'danger',
            style:'growl-top-right'
          });
        }
        else{
          Router.go('/');
          //location.reload();
        }
      });
    }
  }
});

//login.events
Template.login.events({
  'submit form':function(event){
    event.preventDefault();
    var username=event.target.l_username.value;
    var password=event.target.l_password.value;
    Meteor.loginWithPassword(username,password,function(error){
      if(error){
      Bert.alert({
        title:'Login error',
        message:error.reason,
        type:'danger',
        style:'growl-top-right'
      });
      }
        else{
          Router.go('/');
          //location.reload();
        }
    });
  },
});

//logged_in_navbar.events
Template.logged_in_navbar.events({
  'click #js_logout':function(){
    //Router.go('/');
    //location.reload();
    Meteor.logout();
  },
});
Template.create_team_modal.events({
  'submit form':function(event){
    //event.preventDefault();
    var name=event.target.team_name.value;
    var purpose=event.target.team_purpose.value;
    var objectives=event.target.team_objectives.value;
    var leader=Meteor.userId();
    var members=[];
    members.push(Meteor.userId());
    Teams.insert({
      name:name,
      description:purpose,
      objectives:objectives,
      leader:leader,
      members:members});
  }
});
Template.join_team_modal.events({
  'submit form':function(event){
    event.preventDefault();
    var team_id=event.target.team_id.value;
    var members;
    Teams.find({_id:team_id}).forEach(function(document){members=document.members});
    function alreadyMember(userId){
      return userId==Meteor.userId();
    }
    if(!members.find(alreadyMember)){
      members.push(Meteor.userId());
      console.log("member pushed");
      Teams.update({_id:team_id},{$set:{members:members}});
    }
    else{
      Bert.alert({
        title:'Joining error',
        message:'You are already a member of that team',
        type:"danger",
        style:"growl-top-right"
        
      });
    }
  }
});
