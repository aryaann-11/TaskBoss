import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Teams} from '../lib/collections.js';
import {Tasks} from '../lib/collections.js';
import { Session } from 'meteor/session';
import { Email } from 'meteor/email';
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
Router.route('/profile',function(){
  this.render('profile');
});
Router.route('/tasks',function(){
  this.render('tasks');
});
//subscriptions
//helpers
//console.log(Teams.find().count());
Session.setDefault('tamperMode',false);
console.log(Session.get('tamperMode'));
Template.teams.helpers({
  teams:Teams.find({members:Meteor.userId()}),
  });
Template.tasks.helpers({
  tasks:Tasks.find({assignedBy:Meteor.userId()})
});
Template.home.helpers({
  tasks:Tasks.find({assignedTo:Meteor.userId()}),
  completed_tasks:Tasks.find({completedBy:Meteor.userId()})
});
//register.events
Template.register.events({
  'submit form':function(event){
    event.preventDefault();
    var name=event.target.name.value;
    var last_name=event.target.last_name.value;
    var jobtitle=event.target.job_title.value;
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
          first_name:name,
          last_name:last_name,
          job_title:job_title,
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
  'click .js-change-mode':function(event){
    if(event.target.innerHTML=='tamper mode is off'){
      event.target.innerHTML='tamper mode is on';
      event.target.classList.remove('btn-success');
      event.target.classList.add('btn-danger');
    }
    else if(event.target.innerHTML=='tamper mode is on'){
      event.target.innerHTML="tamper mode is off";
      event.target.classList.remove('btn-danger');
      event.target.classList.add('btn-success');
    }
    Session.set('tamperMode',!Session.get('tamperMode'));
    console.log(Session.get('tamperMode'));
  }
});
Template.create_team_modal.events({
  'submit form':function(event){
    //event.preventDefault();
    var name=event.target.team_name.value;
    var purpose=event.target.team_purpose.value;
    var objectives=event.target.team_objectives.value;
    var members=[];
    var member_usrs=[]
    members.push(Meteor.userId());
    member_usrs.push(Meteor.user())
    Teams.insert({
      name:name,
      description:purpose,
      objectives:objectives,
      members:members,
      member_usrs:member_usrs
    });
  }
});
Template.join_team_modal.events({
  'submit form':function(event){
    event.preventDefault();
    var team_id=event.target.team_id.value;
    var members;
    var member_usrs;
    Teams.find({_id:team_id}).forEach(function(document){
      members=document.members;
      member_usrs=document.member_usrs;
    });
    function alreadyMember(userId){
      return userId==Meteor.userId();
    }
    if(!members.find(alreadyMember)){
      members.push(Meteor.userId());
      member_usrs.push(Meteor.user());
      console.log("member pushed");
      Teams.update({_id:team_id},{$set:
        {members:members,member_usrs:member_usrs}});
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
Template.teams.events({
  'click .js-exit-team':function(event){
    //console.log(this._id);
    if(Session.get('tamperMode')){
      var team_id=this._id;
      var members;
      var member_usrs;
      Teams.find({_id:team_id}).forEach(
        function(document){
          members=document.members;
          member_usrs=document.member_usrs
        });
      members.pop(Meteor.userId());
      member_usrs.pop(Meteor.user());
      $("#"+this._id).hide("slow",function(){
        Teams.update({_id:team_id},{$set:{members:members,member_usrs:member_usrs}});
      });
     
    }
    else{
      Bert.alert({
        title:'Cant exit team',
        message:'tamper mode is turned off. Turn tamper mode on to be able to exit team',
        type:'danger',
        style:'growl-top-right'
      });
    }
  },
  'click .js-assign-task':function(event){
    //var teamId=this._id;
    //console.log(teamId);
    var checked=$(".check:checkbox:checked");
    var taskId=$("#assign_task").val();
    var assignedTo=[];
    var assignedTo_usrs=[];
    console.log(taskId);
    for(var i=0;i<checked.length;i++){
      var doc=checked[i];
      var user=doc.getAttribute("data-user");
      var username=doc.getAttribute("data-username");
      console.log(user);
      console.log(username);
      function alreadyAssigned(userId){
         return userId==user;
      }
      if(assignedTo.find(alreadyAssigned)){
       // 
      }
      else{
        assignedTo.push(user);
        assignedTo_usrs.push(username);
      }
    }
      Tasks.update({_id:taskId},{$set:{assignedTo:assignedTo,
        assignedTo_usrs:assignedTo_usrs,
        assigned:1}});
    }
});
Template.create_task.events({
  'submit form':function(event){
    event.preventDefault();
    var title=event.target.task_title.value;
    var description=event.target.task_description.value;
    Tasks.insert({title:title,description:description,assigned:0,
      completed:0,assignedTo:[],assignedTo_usrs:[],completedBy:[],
      completedBy_usrs:[],
      assignedBy:Meteor.userId(),assignedBy_usr:Meteor.user().username});
  }
});
Template.tasks.events({
  'click .js-del-task':function(){
    if(Session.get('tamperMode')){
      Tasks.remove({_id:this._id});
    }
    else{
      Bert.alert({
        tilte:"cannot delete task",
        message:"turn on tamper mode to be able to delete task",
        type:"danger",
        style:"growl-top-right"
      });
    }
  },
  'click .js-stage':function(){
    if(Session.get('tamperMode')){
      Tasks.update({_id:this._id},{$set:{
        assignedTo:[],
        assignedTo_usrs:[],
        assigned:0,
        completedBy:[],
        completedBy_usrs:[]
      }});      
    }
    else{
      Bert.alert({
        title:"Cannot move back to stage",
        message:"turn on tamper mode to be able to move this task to stage",
        type:"warning",
        style:"growl-top-right"
      });
    }
  }
});
Template.home.events({
  'click .js-set-complete':function(event){
    if(Session.get('tamperMode')){
      var taskId=this._id;
      var completedBy;
      var completedBy_usrs;
      console.log(taskId);
      Tasks.find({_id:taskId}).forEach(function(document){
        completedBy=document.completedBy;
        completedBy_usrs=document.completedBy_usrs;
      });
      completedBy.push(Meteor.userId());
      completedBy_usrs.push(Meteor.user().username);
      console.log(completedBy_usrs);
      Tasks.update({_id:this._id},{$set:{completed:1,completedBy:completedBy,
        completedBy_usrs:completedBy_usrs
      }});
    }
    else{
      Bert.alert({
        title:"cannot set complete",
        message:"turn tamper mode on to be able to set this task as complete",
        type:"warning",
        style:"growl-top-right"
      });
    }
  },
  'click .js-set-incomplete':function(){
    if(Session.get('tamperMode')){
      var taskId=this._id;
      var completedBy;
      var completedBy_usrs;
      console.log(taskId);
      Tasks.find({_id:taskId}).forEach(function(document){
          completedBy=document.completedBy;
          completedBy_usrs=document.completedBy_usrs;
      });
      completedBy.pop(Meteor.userId());
      completedBy_usrs.pop(Meteor.user().username);
      Tasks.update({_id:this._id},{$set:{completed:0,
        completedBy:completedBy,
        completedBy_usrs:completedBy_usrs
      }});
    }
    else{
      Bert.alert({
        title:"cannot set incomplete",
        message:"turn tamper mode on to be able to set this task as incomplete",
        type:"warning",
        style:"growl-top-right"
      });
    }
  },
  'click #seeCompleted':function(){
    if(document.getElementById("seeCompleted").checked==true){
       console.log("Show completed");
       $("#all_tasks").css("display","none");
       $("#complete_tasks").css("display","block");
    }
    else{
      console.log("Show all");
      $("#complete_tasks").css("display","none");
      $("#all_tasks").css("display","block");

    }
  }
});
