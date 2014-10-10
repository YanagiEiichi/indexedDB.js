  define("Index",function(objectStore,name,keyPath,config){
    this.keyPath=keyPath;
    this.name=name;
    this.objectStore=objectStore;
    this.unique=config.unique;
    this.multiEntry=!config.multiEntry;
    this._transaction=objectStore.transaction;
  },function(){
    return {
      count:function(){},
      get:function(){},
      openCursor:function(range,order){
        if(!this.objectStore.transaction._isActive())
          throw new Error("The transaction is not active.");
        var request=new IDB.Request;
        request.result=new IDB.CursorWithValue(this,range,order,request);
        return request;
      },openKeyCursor:function(){}
    };
  }());
