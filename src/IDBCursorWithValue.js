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
