import {Mongo} from 'meteor/mongo';
import {Meteor} from 'meteor/meteor';
import { Template } from 'meteor/templating';

export const Tasks= new Mongo.Collection("tasks");
export const Teams=new Mongo.Collection("teams");
//export const Users=new Mongo.Collection("")

if(Meteor.isServer){
  Meteor.publish('tasks',function tasksPublication(){
    return Tasks.find({viewAccess:this.userId});
  }),
  Meteor.publish('teams',function teamsPublication(){
    return Teams.find({});
  }),
  Meteor.publish('userData',function userPublication(){
    return Meteor.users.findOne(this.userId);
  })
}


Meteor.methods({
  'incomplete_tasks.setComplete'(taskId){
    Tasks.update(taskId, {
      $set: { status: 1 }
    });
  },
  'complete_tasks.delete'(taskId){
    if(Meteor.users.findOne(this.userId).username==assignedBy){
      $("#"+taskId).hide("slow",function(){
        Tasks.remove(taskId);
      });
    }
    else{
      throw new Meteor.Error('not-authorized');
    }
  },
  'create_team_modal.insertTeam'(name,purpose,objectives){
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }
    Teams.insert({name:name,purpose:purpose,objectives:objectives,
      leader:this.userId,
      members:[Meteor.users.findOne(this.userId).username],
      memberIds:[this.userId]});
  },
  'join_team_modal.joinTeam'(team_id,members,memberIds){
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }
    Teams.update(team_id,{$set:{members:members,memberIds:memberIds}});
  },
  'teams.exitTeam'(team_id,members,memberIds){
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }
    Teams.update(team_id,{$set:{members:members,memberIds:memberIds}});
  },
  'delegate_pseudoPage.createTask'(title,description,assign_to,viewAccess,assignedToUsers){
    Tasks.insert({title:title,description:description,
      assigned_to:assign_to,status:0,viewAccess:viewAccess,
      assignedToUsers:assignedToUsers,
      assignedBy:Meteor.users.findOne(this.userId).username});

  },
  'teams_under_me.delete'(teamId){
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }
    $("#"+teamId).hide("slow",function(){
      Teams.remove(teamId);
    });
  }
});
