  define("ObjectStore",function(transaction,name){
    if(!transaction._allowedNames.contains(name))
      throw new Error("The specified object store was not found.");
    var key=transaction.db._prefix+"-"+stringify(name);
    var package=parse(localStorage.getItem(key));
    this.name=name;
    this.transaction=this._transaction=transaction;
    this.keyPath=package.conf.keyPath;
    this.autoIncrement=package.conf.autoIncrement;
    this._data=package.data;
    this._conf=package.conf;
    var inds=this._inds=package.inds;
    transaction._objectStoreList.push(this);
    this.indexNames=function(){
      var indexNames=[];
      for(var i in inds)indexNames.push(i);
      return DOMStringList(indexNames);
    }();
    this._commit=function(){
      localStorage.setItem(key,stringify(package));
    };
  },function(){
    function AssertActive(that){
      if(!that.transaction._isActive())
        throw new Error("The transaction is not active.");
    };
    function AssertWritable(that){
      if(that.transaction.mode=="readonly")
        throw new Error("The transaction is read-only.");
    };
    function GetValidKey(row,key,that){
      var keyPath=that._conf.keyPath;
      if(keyPath!=null&&key!==void 0)
        throw new Error("The object store uses in-line keys and the key parameter was provided.");
      if(keyPath instanceof Array)
        for(var key=[],i=0;i<keyPath.length;i++)
          AssertValidKey(key[i]=row[keyPath[i]]);
      else if(keyPath==="")AssertValidKey(key=row);
      else if(typeof keyPath=="string")
        AssertValidKey(key=row[keyPath]);
      else key=null;
      return key;
    };
    function MakeReturn(that,callback){
      var request=new IDB.Request,transaction=that.transaction;
      return setTimeout(function(){
        var result=callback&&callback.call(that);
        if(transaction._isFinished()){
          request._reject();
          transaction.dispatchEvent({
            type:"error",target:request
          });
        }else{
          transaction._activate();
          request._resolve(result);
        };
      }),request;
    };
    //Abstracts the Put function, it's used by "put" and "add" methods.
    function Put(that,row,key){
      if(typeof key=="number"&&key>=that._conf.incrementId)
        that._conf.incrementId=1+key|0;
      if(key==null&&that._conf.autoIncrement)
        key=that._conf.incrementId++;
      AssertValidKey(key);
      key=stringify(Object(key));
      row=parse(stringify(Object(row)));
      //Check unique index
      (function(){
        var indexNames=that.indexNames,i,index,keyPath;
        var data=that._data,key,current,result;
        for(var i=0;index=that._inds[indexNames[i]];i++){
          if(!index[2].unique)continue;
          keyPath=index[1];
          current=GetResultByKeyPathForIndex(keyPath,row);
          for(key in data){
            result=GetResultByKeyPathForIndex(keyPath,data[key]);
            if(current&&result&&Compare(current,result)==0)
              that.transaction.abort(); //!!!abort
          };
        };
      })();
      that._data[key]=row;
      return key;
    };
    return {
      count:function(){
        AssertActive(this);
        return MakeReturn(this,function(){
          var data=this._data,count=0;
          for(var i in data)count++;
          return count;
        });
      },get:function(key){
        AssertActive(this);
        AssertValidKey(key);
        return MakeReturn(this,function(){
          return this._data[stringify(key)];
        });
      },add:function(row,key){
        AssertActive(this);
        AssertWritable(this);
        key=GetValidKey(row,key,this);
        return MakeReturn(this,function(){
          if(key===void 0)key=row[this._conf.keyPath];
          //Aborts current transaction when the item is already exists
          if(key in this._data)this.transaction.abort();
          return Put(this,row,key);
        });
      },put:function(row,key){
        AssertActive(this);
        AssertWritable(this);
        key=GetValidKey(row,key,this);
        return MakeReturn(this,function(){
          return Put(this,row,key);
        });
      },"delete":function(key){
        AssertActive(this);
        AssertWritable(this);
        AssertValidKey(key);
        return MakeReturn(this,function(){
          delete this._data[key];
        });
      },clear:function(){
        AssertActive(this);
        AssertWritable(this);
        return MakeReturn(this,function(){
          this._data={};
        });
      },openCursor:function(range,order){
        AssertActive(this);
        var request=new IDB.Request;
        request.result=new IDB.CursorWithValue(this,range,order,request);
        return request;
      },createIndex:function(name,keyPath,config){
        AssertActive(this);
        if(this.transaction.mode!="versionchange")
          throw new Error("The database is not running a version change transaction.");
        keyPath=NormalizeKeyPath(keyPath);
        config=new Object(config);
        var index=new IDB.Index(this,name,keyPath,config);
        this.indexNames.push(name);
        this._inds[name]=[name,keyPath,config];
        return index;
      },index:function(name){
        AssertActive(this);
        var args=this._inds[name];
        return new IDB.Index(this,args[0],args[1],args[2]);
      }
    };
  }());
