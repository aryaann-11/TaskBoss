import { Meteor } from 'meteor/meteor';
import{Tasks} from '../lib/collections.js';
import{Teams} from '../lib/collections.js';

Meteor.startup(() => {/*
  // code to run on server at startup
  Teams.insert({name:"team1",teamMembers:["random guy 1","random guy 2"]});
  Teams.insert({name:"team2",teamMembers:["random guy 1","random guy 3"]});
  for(var i=1;i<3;i++){
    Tasks.insert({team:"team1", title:"random title",assigned_to:"random guy 1",assigned_by:"server",
    deadline:"na",view_access:"public",createdOn:new Date});
  }
  for(var i=1;i<3;i++){
    Tasks.insert({team:"team1", title:"random title",assigned_to:"random guy 2",assigned_by:"server",
    deadline:"na",view_access:"public",createdOn:new Date});
  }*/
  //Teams.insert({name:"team 1",members:[{name:"random guy1"}]});
});
