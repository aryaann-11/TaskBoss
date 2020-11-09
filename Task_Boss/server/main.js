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
