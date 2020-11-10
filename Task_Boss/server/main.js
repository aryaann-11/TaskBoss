import { Meteor } from 'meteor/meteor';
import {Teams} from '../lib/collections.js';
import {Tasks} from '../lib/collections.js';
Meteor.startup(() => {
  // code to run on server at startup
});
Meteor.publish('teams',function(){
  return Teams.find({});
});
Meteor.publish('tasksByYou',function(){
  return Tasks.find({assignedBy:this.userId});
});
Meteor.publish('tasksToYou',function(){
  return Tasks.find({assignedTo:this.userId});
});
Meteor.methods({
  'insertTeam':function(name,description,objectives,members,member_usrs){
    if(!this.userId){
      throw new Meteor.Error('not logged in','you are not logged in');
    }
    Teams.insert({
      name:name,
      description:description,
      objectives:objectives,
      members:members,
      member_usrs:member_usrs,
      createdBy:this.userId
    });
  },
  'updateTeam':function(teamId,members,member_usrs){
    if(!this.userId){
      throw new Meteor.Error('not logged in','you are not logged in');
    }

    Teams.update({_id:teamId},{$set:{
      members:members,
      member_usrs:member_usrs
    }});
  },
  'delTeam':function(teamId){
    if(!this.userId){
      throw new Meteor.Error("not logged in","user is not logged in");
    }
    Teams.remove({_id:teamId});
  },
  'updateTask':function(taskId,assignedTo,assignedTo_usrs){
      if(!this.userId){
          throw new Meteor.Error('not logged in','you are not logged in');
      }

    Tasks.update({_id:taskId},{$set:{
      assignedTo:assignedTo,
      assignedTo_usrs:assignedTo_usrs,
      assigned:1
    }});
  },
  'createTask':function(title,description,priority,deadline,username){
    if(!this.userId){
      throw new Meteor.Error("not logged in");
    }
    Tasks.insert({
      title:title,
      description:description,
      assigned:0,
      completedBy:[],
      completedBy_usrs:[],
      assignedBy:this.userId,
      assignedBy_usr:username,
      assignedTo:[],
      assignedTo_usrs:[],
      priority:priority,
      deadline:deadline
    });
  },
  'delTask':function(taskId){
    if(!this.userId){throw new Meteor.Error("not logged in","you are not logged in");}
    Tasks.remove({_id:taskId});
  },
  'stageTask':function(taskId){
    if(!this.userId){throw new Meteor.Error("not logged in","you are not logged in");}
    Tasks.update({_id:taskId},{$set:{
      assignedTo:[],
      assignedTo_usrs:[],
      assigned:0,
      completedBy:[],
      completedBy_usrs:[]
    }});
  },
  'setTask':function(taskId,completedBy,completedBy_usrs){
    if(!this.userId){
      throw new Meteor.Error("not logged in","you are not logged in");
    }
    Tasks.update({_id:taskId},{$set:{
      completedBy:completedBy,
      completedBy_usrs:completedBy_usrs
    }});
  },
});
