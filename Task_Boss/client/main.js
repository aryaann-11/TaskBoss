import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Teams} from '../lib/collections.js';
import {Tasks} from '../lib/collections.js';
import { Session } from 'meteor/session';
import './main.html';
//routes
Router.configure({
  layoutTemplate:'layout'
});
Router.route('/',{
  template:'home',
  data:function(){
    return {
      tasks:Tasks.find({assignedTo:Meteor.userId()},{sort:{priority:1,deadline:1}}),
      completed_tasks:Tasks.find({completedBy:Meteor.userId()},{sort:{priority:1,deadline:1}})
    }
  },
    subscriptions:function(){
    return Meteor.subscribe('tasksToYou');
  }
});
Router.route('/login',{
  template:'login',
});
Router.route('/register',{template:'register'});
Router.route('/teams',{
  template:'teams',
  data:function(){
    return {
      teams:Teams.find({members:Meteor.userId()})
    } 
  },
  subscriptions:function(){
    return [Meteor.subscribe('teams'),Meteor.subscribe('tasksByYou')]
  }
});
Router.route('/tasks',{
  template:'tasks',
  data:function(){
    return {
      tasks: Tasks.find({assignedBy:Meteor.userId()},{sort:{priority:1,date:1}})
    }
  },
    subscriptions:function(){
    return Meteor.subscribe('tasksByYou');
  }
});

//subscriptions
//helpers
//console.log(Teams.find().count());
Session.setDefault('tamperMode',false);
console.log(Session.get('tamperMode'));
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
Template.layout.events({
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
  },

});
//logged_in_navbar.events
Template.logged_in_navbar.events({
  'click #js_logout':function(){
    //Router.go('/');
    //location.reload();
    Meteor.logout();
    Session.set('tamperMode',false);
  },
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
    Meteor.call('insertTeam',name,purpose,objectives,members,member_usrs
      ,function(error){
        if(error){
          Bert.alert({
            title:error,
            message:error.reason,
            type:"danger",
            style:"growl-top-right"
          });
        }
      });
  }
});
Template.join_team_modal.events({
  'submit form':function(event){
    event.preventDefault();
    var team_id=event.target.team_id.value;
    var members=[];
    var member_usrs=[];
    Teams.find({_id:team_id}).forEach(function(document){
      members=document.members;
      member_usrs=document.member_usrs;
    });
    function alreadyMember(userId){
      return userId==Meteor.userId();
    }
    console.log(members);
    if(!(members.find(alreadyMember))){
      members.push(Meteor.userId());
      member_usrs.push(Meteor.user());
      Meteor.call('updateTeam',team_id,members,member_usrs,function(error){
        if(error){
          Bert.alert({
            title:error,
            message:error.reason,
            type:"danger",
            style:"growl-top-right"
          });
        }
      });
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
  'click .js-del-team':function(event){
     //console.log(this._id);
    if(Session.get('tamperMode')){
     var id=this._id;
     var createdBy;
     Teams.find({_id:id}).forEach(function(document){createdBy=document.createdBy});
    if(createdBy==Meteor.userId()){
       Meteor.call('delTeam',id); 
    }
    else{
      Bert.alert({
        title:"can't delete team",
        message:"you must be the team's creator in order to delete it",
        type:"danger",
        style:"growl-top-right"
      });
    }
   }
    else{
      Bert.alert({
        title:"can't delete team",
        message:"turn tamper mode on to delete this team",
        type:"danger",
        style:"growl-top-right"
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
    Tasks.find({_id:taskId}).forEach(function(document){
        assignedTo=document.assignedTo;
        assignedTo_usrs=document.assignedTo_usrs;
      });
    console.log(assignedTo_usrs);
    for(var i=0;i<checked.length;i++){
      var doc=checked[i];
      var user=doc.getAttribute("data-user");
      var username=doc.getAttribute("data-username");
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
    console.log(assignedTo_usrs);
    Meteor.call('updateTask',taskId,assignedTo,assignedTo_usrs,function(error){
      if(error){
        Bert.alert({
          title:error,
          message:error.reason,
          type:"danger",
          style:"growl-top-right"
        });
      }
            });
  }
});
Template.create_task.events({
  'submit form':function(event){
    event.preventDefault();
    var title=event.target.task_title.value;
    var description=event.target.task_description.value;
    var radios=document.getElementsByName("priority");
    var priority;
    var deadline=event.target.deadline.value;
    console.log(deadline);
    for(var i=0;i<radios.length;i++){
      if(radios[i].checked){
        priority=radios[i].value;
        break;
      }
    }
    Meteor.call('createTask',title,description,priority,deadline,
      Meteor.user().username,function(error){
      if(error){
        Bert.alert({
          title:error,
          message:error.reason,
          type:"danger",
          style:"growl-top-right"
        });
      }
    });
  }
});
Template.tasks.events({
  'click .js-del-task':function(){
    if(Session.get('tamperMode')){
      Meteor.call('delTask',this._id,function(error){
        if(error){
          Bert.alert({
            title:error,
            message:error.reason,
            type:'danger',
            style:"growl-top-right"
          });
        }
      });
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
      Meteor.call('stageTask',this._id,function(error){
        if(error){
          Bert.alert({
            title:error,
            message:error.reason,
            type:"danger",
            style:"growl-top-right"
          });
        }
      });     
    }
    else{
      Bert.alert({
        title:"Cannot move back to stage",
        message:"turn on tamper mode to be able to move this task to stage",
        type:"danger",
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
      function alreadyPresent(userId){
        return userId==Meteor.userId();
      }
      if(!completedBy.find(alreadyPresent)){
          completedBy.push(Meteor.userId());
          completedBy_usrs.push(Meteor.user().username);
        Bert.alert({
          title:"success",
          message:"task has been set as complete",
          type:"success",
          style:"growl-top-right"
        });
      }
      else{
        Bert.alert({
          title:"error",
          message:"you have already set this task as complete",
          type:"danger",
          style:"growl-top-right"
        });
      }
      console.log(completedBy_usrs);
      Meteor.call('setTask',taskId,completedBy,completedBy_usrs,function(error){
        if(error){
          Bert.alert({
            title:error,
            message:error.reason,
            type:"danger",
            style:"grow-top-right"
          });
        }
      });
      }
    else{
      Bert.alert({
        title:"cannot set complete",
        message:"turn tamper mode on to be able to set this task as complete",
        type:"danger",
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
      var i=completedBy.indexOf(Meteor.userId());
      completedBy.splice(i,1);
      i=completedBy_usrs.indexOf(Meteor.user().username);
      completedBy_usrs.splice(i,1);
      Meteor.call('setTask',taskId,completedBy,completedBy_usrs,function(error){
        if(error){
        Bert.alert({
          title:error,
          message:error.reason,
          type:"danger",
          style:"growl-top-right"
        });
      }});
    }
    else{
      Bert.alert({
        title:"cannot set incomplete",
        message:"turn tamper mode on to be able to set this task as incomplete",
        type:"danger",
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
