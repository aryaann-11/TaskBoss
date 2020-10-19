import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import{Tasks} from '../lib/collections.js';
import{Teams} from '../lib/collections.js';
import {Accounts} from 'meteor/accounts-base';

Accounts.ui.config({
  passwordSignupFields:'USERNAME_AND_EMAIL'
});

import './main.html';
Template.tasks.helpers({tasks:Tasks.find({assigned_to:"random guy 1"})});
//Template.team_members.helpers({member:Teams.find({name:"team 1"}).members});
Template.teams.helpers({team:Teams.find({teamMembers:"random guy 1"})});
