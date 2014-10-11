/*********************************************************
Author: 次碳酸钴（admin@web-tinker.com）
Latest: 2014-10-10
Require: localStorage.js
Git: https://github.com/YanagiEiichi/indexedDB.js
*********************************************************/

var IDBFactory,IDBRequest,IDBOpenDBRequest,
    IDBTransaction,IDBObjectStore,IDBKeyRange,
    IDBIndex,IDBDatabase,IDBCursorWithValue,
    IDBVersionChangeEvent,indexedDB;

indexedDB||function(){
  var IDB={},prefix="indexedDB";
  function define(name,func,proto){
    function err(){throw new TypeError("Illegal constructor");};
    self["IDB"+name]=err,IDB[name]=func;
    err.prototype=func.prototype=proto;
  };
  var stringify=function(){
    var ESCAPE={8:"b",9:"t",10:"n",12:"f",13:"r",34:'"',92:"\\"};
    var ObjectToString=Object.prototype.toString,stack=[];
    return function(e){
      if(e===void 0)return "void 0";
      if(e===null)return "null";
      var type=typeof e;
      if(type=="object"){
        for(i=0;i<stack.length;i++)
          if(stack[i]==e)throw new Error("self-reference");
        type=ObjectToString.call(e);
      };
      switch(type){
        case "[object Number]":e*=1;
        case "number":
          switch(true){
            case e==1/0:return "1/0";
            case e==-1/0:return "-1/0";
            case e!=e:return "0/0";
            case 1/e==-1/0:return "-0";
            default:return e+"";
          };
        case "[object String]":e+="";
        case "string":
          return '"'+e.replace(/[\x00-\x19\x22\x5C]/g,function(c){
            c=c.charCodeAt(0)
            return "\\"+(ESCAPE[c]||"x"+(c<16?"0":"")+c.toString(16));
          })+'"';    
        case "[object Boolean]":e=e*1;
        case "boolean":return e?"true":"false";
        case "[object Date]":
          return "new Date("+e*1+")";
        case "[object Object]":
          var i,s=[];
          stack.push(e);
          try{for(i in e)s.push(stringify(i)+":"+stringify(e[i]));}
          finally{stack.pop();};
          return "{"+s+"}";
        case "[object Arguments]":
        case "[object Array]":
          var i,s=[];
          stack.push(e);
          try{for(i=0;i<e.length;i++)s.push(stringify(e[i]));}
          finally{stack.pop();};
          return "["+s+"]";
        default:throw new Error("Stringify Error");
      };
    };
  }();
  function parse(e){return eval("("+e+")");};
  function AssertKeyPathName(key){
    if(!/^(?!\d)[\w$]*$/.test(key))
      throw new Error("The keyPath argument contains an invalid key path.");
  };
  function AssertValidKey(key){
    if(key instanceof Array)for(var i=0;i<key.length;i++)
      AssertValidKey(key[i]);
    else if(typeof key!="string"&&typeof key!="number"||key!=key)
      throw new Error("The parameter is not a valid key.");
  };
  function NormalizeKeyPath(e){
    if(e instanceof Array)
      for(var i=0;i<e.length;i++)
        AssertKeyPathName(e[i]+="")
    else AssertKeyPathName(e+="");
    return e;
  };
  function GetResultByKeyPathForIndex(keyPath,row){
    var result,i,key,value;
    if(keyPath instanceof Array){
      for(i=0,result=[];i<keyPath.length;i++){
        key=keyPath[i],value=row[key];
        if(!key||value==null||typeof value=="object")
          return void 0;
        result.push(value);
      };
      return result;
    }else if(keyPath){
      result=row[keyPath];
      if(result==null||typeof result=="object")return void 0;
      return result;
    }else return void 0;
  };
  var Compare=function(){
    var f,m={undefined:0,number:1,string:2,object:3};
    return f=function(a,b){
      var i,r;
      if(a===null)a=void 0;
      if(b===null)b=void 0;
      if(r=m[typeof a]-m[typeof b])return r;
      if(typeof a!="object")return a<b?-1:a==b?0:1;
      for(i=0;i<a.length||i<b.length;i++)
        if(r=f(a[i],b[i]))return r;
      return 0;
    };
  }();
  var DOMStringList=function(array){
    return array.contains=function(value){
      for(var i=0;i<array.length;i++)
        if(array[i]==value)return true;
      return false;
    },array.item=function(index){
      return array[index];
    },array;
  };
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
  define("Factory",function(){},{
    open:function(name,version){
      if(typeof name!="string")name+="";
      if(version!==void 0)version*=1;
      if(version<0||version!=version) //Minus or NaN
        throw new Error("Value is not of type 'unsigned long long'.");
      if(version==0)
        throw new Error("The version provided must not be 0.");
      version|=0; //Convert to unsigned long long
      var request=new IDB.OpenDBRequest;
      setTimeout(function(){
        var key=prefix+"-"+stringify(name);
        var oldVersion=localStorage.getItem(key);
        var newVersion=version||oldVersion||1;
        var database=new IDB.Database(name,newVersion);
        request.readyState="done";
        request.result=database;
        if(oldVersion<newVersion){
          database._upgrading=true;
          request.dispatchEvent({type:"upgradeneeded",target:request});
          localStorage.setItem(key,newVersion);
          database._upgrading=false;
        };
        database._commit();
        request.dispatchEvent({type:"success",target:request});
      });
      return request;
    },deleteDatabase:function(name){
      var request=new IDB.OpenDBRequest;
      var key=prefix+"-"+stringify(name);
      var l=localStorage.length,i,partial=[];
      for(i=0;i<l;i++)
        if(localStorage.key(i).slice(0,key.length)==key)
          partial.push(localStorage.key(i));
      for(i=0;i<partial.length;i++)
        localStorage.removeItem(partial[i]);
      setTimeout(function(){request._resolve();});
      return request;
    }
  });
  define("Request",function(){
    this.readyState="pending",this.result=null;
    this._resolve=function(result){
      this.result=result,this.readyState="done";
      this.dispatchEvent({type:"success",target:this});
    };
    this._reject=function(result){
      this.result=result,this.readyState="done";
      this.dispatchEvent({type:"error",target:this});
    };
  },new EventTarget);
  define("OpenDBRequest",function(){
    this.onupgradeneeded=null;
    this.onblocked=null;
    this.onerror=null;
    this.onsuccess=null;
    this.source=null;
  },new IDB.Request);
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
  define("CursorWithValue",function(source,range,order,request){
    if(order===void 0)order="next";
    if(range!=null&&!(range instanceof IDBKeyRange))
      range=IDBKeyRange.only(range);
    if(!/^(?:prev|next)(?:unique)?$/.test(order))
      throw new Error("The direction provided is not one of 'next', 'nextunique', 'prev', or 'prevunique'.");
    this.source=source;
    var keyPath=source.keyPath,data,list=[],key;
    if(source instanceof IDB.Index)
      data=this._data=source.objectStore._data;
    if(source instanceof IDB.ObjectStore)
      data=this._data=source._data;
    var that=this;
    that._list=list;
    that._cursor=0;
    that._request=request;
    setTimeout(function(){
      //!!! A performance problem here
      var result,i,isPrimary=source instanceof IDB.ObjectStore;
      for(key in data){
        result=GetResultByKeyPathForIndex(keyPath,data[key]);
        if(result!==void 0||isPrimary)if(!range||range._match(result))
          list.push(key);
      };
      list.sort(function(a,b){
        a=GetResultByKeyPathForIndex(keyPath,a);
        b=GetResultByKeyPathForIndex(keyPath,b);
        return Compare(a,b);
      });
      if(order=="prev")list.reverse();
      that["continue"]();
    });
  },function(){
    return {
      update:function(){
        console.log("no implementation");
      },advance:function(){
        console.log("no implementation");
      },"continue":function(){
        if(this.source._transaction._isFinished())return;
        if(this._cursor<this._list.length){
          this.value=this._data[this._list[this._cursor++]];
          this._request._resolve(this);
        }else this._request._resolve(null);
      },"delete":function(){
        console.log("no implementation");
      }
    };
  }());
  define("KeyRange",function(lower,upper,lowerOpen,upperOpen){
    if(lower!=null&&upper!=null&&Compare(lower,upper)>0)
      throw new Error("The lower key is greater than the upper key.");
    this.lower=lower;
    this.upper=upper;
    this.lowerOpen=lowerOpen;
    this.upperOpen=upperOpen;
    this._match=function(key){
      var r;
      if(lower!==void 0){
        r=Compare(key,lower);
        if(r<0||r==0&&lowerOpen)return false;
      };
      if(upper!==void 0){
        r=Compare(upper,key);
        if(r<0||r==0&&upperOpen)return false;
      };
      return true;
    };
  },{});
  IDBKeyRange.only=function(e){
    AssertValidKey(e);
    return new IDB.KeyRange(e,e);
  };
  IDBKeyRange.lowerBound=function(l,lo){
    AssertValidKey(l);
    return new IDB.KeyRange(l,void 0,!!lo,false);
  };
  IDBKeyRange.upperBound=function(u,uo){
    AssertValidKey(u);
    return new IDB.KeyRange(void 0,u,false,!!uo);
  };
  IDBKeyRange.bound=function(l,u,lo,uo){
    AssertValidKey(l);
    AssertValidKey(u);
    if(l==u&&(lo||uo))
      throw Error("The lower key and upper key are equal and one of the bounds is open.");
    return new IDB.KeyRange(l,u,!!lo,!!uo);
  };
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
  //Initialize instance
  indexedDB=new IDB.Factory;
}();
