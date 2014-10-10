  define("Database",function(name,version){
    this.name=name;
    this.version=version;
    this.onabort=null;
    this.onclose=null;
    this.onerror=null;
    this.onversionchange=null;
    this._prefix=prefix+"-"+stringify(this.name);
    this._transactions=[];
    //Read the object store names from storage area
    this.objectStoreNames=function(){
      var result=[],match=prefix+"-"+stringify(name)+"-";
      var l=localStorage.length,i,rawkey;
      for(i=0;i<l;i++)
        rawkey=localStorage.key(i),
        rawkey.slice(0,match.length)==match &&
          result.push(parse(rawkey.slice(match.length)));
      return DOMStringList(result);
    }();
  },function(){
    var Temp=function(){};
    Temp.prototype=new EventTarget;
    var temp=new Temp;
    temp.close=function(){};
    temp.createObjectStore=function(name,config){
      if(!this._upgrading)
        throw new Error("The database is not running a version change transaction.");
      var key=this._prefix+"-"+stringify(name);
      var item=localStorage.getItem(key);
      if(item)throw new Error("An object store with the specified name already exists.");
      config=config||{};
      config.incrementId=1;
      var keyPath=config.keyPath=config.keyPath;
      if(keyPath===void 0)keyPath=null;
      if(keyPath!==null)
        config.keyPath=keyPath=NormalizeKeyPath(keyPath);
      config.autoIncrement=!!config.autoIncrement;
      if(config.autoIncrement&&(keyPath==""||keyPath instanceof Array))
        throw new Error("The autoIncrement option was set but the keyPath option was empty or an array.");
      localStorage.setItem(key,stringify({data:{},conf:config,inds:{}}));
      this.objectStoreNames.push(name);
      var transaction=new IDB.Transaction(this,[name],"versionchange");
      return transaction.objectStore(name);
    };
    temp.deleteObjectStore=function(name){
      if(!this._upgrading)
        throw new Error("The database is not running a version change transaction.");
      var key=this._prefix+"-"+stringify(name);
      var item=localStorage.getItem(key);
      if(!item)throw new Error("The specified object store was not found.");
      localStorage.removeItem(key);
      var s=this.objectStoreNames,i;
      for(i=0;i<s.length;i++)if(s[i]==name)s.splice(i,1),i=0/0;
    };
    temp.transaction=function(names,mode){
      mode=mode||"readonly";
      if(mode!="readonly"&&mode!="readwrite")
        throw new TypeError("The mode provided is not one of 'readonly' or 'readwrite'.");
      return new IDB.Transaction(this,names,mode);
    };
    temp._commit=function(){
      var i,s=this._transactions;
      for(i=0;i<s.length;i++)s[i]._commit();
    };
    return temp;
  }());
