import {Mongo} from 'meteor/mongo';
import {Meteor} from 'meteor/meteor';
import { Template } from 'meteor/templating';

export const Teams=new Mongo.Collection("teams");
export const Tasks=new Mongo.Collection("tasks");
