  var EventTarget=function(){};
  EventTarget.prototype={
    addEventListener:function(name,handle){
      if(!("_events" in this))this._events={};
      if(!(name in this._events))this._events[name]=[];
      this._events[name].push(handle);
    },removeEventListener:function(name,handle){
      var events="_events" in this?this._events:this._events={};
      if(!("_events" in this&&name in this["_events"]))return;
      var s=this._events[name],i=s.length;
      while(i-->0)if(s[i]==handle)s.splice(i,1),i=0;
    },dispatchEvent:function(event){
      var name=event.type;
      if("_events" in this&&name in this._events)
        for(var s=this._events[name].slice(0),i=0;i<s.length;i++)
          s[i].call(this,event);
      var f=this["on"+name];
      if(typeof f=="function")f.call(this,event);
    }
  };
