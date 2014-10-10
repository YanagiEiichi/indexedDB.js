  define("Transaction",function(database,names,mode){
    var transaction=this;
    if(!(names instanceof Array))names=[names];
    for(var i=0;i<names.length;i++)
      if(!database.objectStoreNames.contains(names[i]))
        throw new Error("One of the specified object stores was not found.");
    this.db=database;
    this.mode=mode;
    this.onabort=null;
    this.oncomplete=null;
    this.onerror=null;
    this._allowedNames=DOMStringList(names);
    this._objectStoreList=[];
    database._transactions.push(this);
    this.addEventListener("finish",function(){
      var i,s=database._transactions;
      for(var i=0;i<s.length;i++)
        if(s[i]==transaction)return s.splice(i,1);
    });
    //LifeTime
    (function(){
      var active,finished,activeId,finishedId;
      transaction._isActive=function(){ return active; };
      transaction._isFinished=function(){ return finished; };
      transaction._abort=function(){
        clearTimeout(activeId);
        clearTimeout(finishedId);
        active=false,finished=true;
        transaction.dispatchEvent({
          type:"finish",target:transaction
        });
      };
      transaction._activate=function(){
        clearTimeout(activeId);
        clearTimeout(finishedId);
        active=true,finished=false;
        activeId=setTimeout(function(){
          active=false;
          finishedId=setTimeout(function(){
            finished=true;
            transaction._commit();
            transaction.dispatchEvent({
              type:"complete",target:transaction
            });
            transaction.dispatchEvent({
              type:"finish",target:transaction
            });
          });
        });
      };
      transaction._activate();
    })();
  },function(){
    var Temp=function(){};
    Temp.prototype=new EventTarget;
    var temp=new Temp;
    temp.objectStore=function(name){
      var obj=new IDB.ObjectStore(this,name);
      return obj;
    };
    temp.abort=function(){
      this._abort();
      var that=this;
      setTimeout(function(){
        that.dispatchEvent({type:"abort",target:this});
      });
    };
    temp._commit=function(){
      var s=this._objectStoreList,i;
      for(i=0;i<s.length;i++)s[i]._commit();
    };
    return temp;
  }());
